import { Router } from "express";
import { db, tiktokAccountsTable, videoAnalyticsTable, growthSnapshotsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router = Router();

// ── TikTok public profile scraper ─────────────────────────────────────────────
// We fetch the public tiktok.com/@username page and extract the embedded
// __NEXT_DATA__ JSON blob — no API key or OAuth required.

function extractUsername(input: string): string | null {
  const trimmed = input.trim();
  // Handle full URLs: https://tiktok.com/@username, https://vm.tiktok.com/..., etc.
  const urlMatch = trimmed.match(/tiktok\.com\/@([\w.]+)/i);
  if (urlMatch) return urlMatch[1];
  // Handle @username or plain username
  const plain = trimmed.replace(/^@/, "");
  if (/^[\w.]{1,24}$/.test(plain)) return plain;
  return null;
}

async function scrapeTikTokProfile(username: string): Promise<{
  tiktokUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  totalLikes: number;
  videos: Array<{
    videoId: string;
    title: string;
    thumbnailUrl: string | null;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    playCount: number;
    videoCreatedAt: Date | null;
  }>;
} | null> {
  const url = `https://www.tiktok.com/@${username}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      logger.warn({ status: res.status, username }, "TikTok profile page returned non-200");
      return null;
    }

    const html = await res.text();

    // Extract __NEXT_DATA__ JSON blob embedded in the page
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!nextDataMatch) {
      // Try SIGI_STATE as fallback
      const sigiMatch = html.match(/window\['SIGI_STATE'\]\s*=\s*(\{[\s\S]*?\});\s*window\[/);
      if (!sigiMatch) {
        logger.warn({ username }, "Could not find __NEXT_DATA__ or SIGI_STATE in TikTok page");
        return null;
      }
    }

    let userInfo: any = null;
    let videoList: any[] = [];

    if (nextDataMatch) {
      const nextData = JSON.parse(nextDataMatch[1]);
      // Navigate the NEXT_DATA structure — it varies by TikTok version
      const props = nextData?.props?.pageProps;
      userInfo = props?.userInfo?.user ?? props?.userData?.user ?? null;
      const stats = props?.userInfo?.stats ?? props?.userData?.stats ?? null;

      if (userInfo && stats) {
        const videos = props?.items ?? props?.videoData?.itemList ?? [];
        videoList = Array.isArray(videos) ? videos : [];

        return {
          tiktokUserId: userInfo.id ?? userInfo.uniqueId ?? username,
          username: userInfo.uniqueId ?? username,
          displayName: userInfo.nickname ?? userInfo.uniqueId ?? username,
          avatarUrl: userInfo.avatarLarger ?? userInfo.avatarMedium ?? null,
          bio: userInfo.signature ?? null,
          followerCount: stats.followerCount ?? 0,
          followingCount: stats.followingCount ?? 0,
          videoCount: stats.videoCount ?? 0,
          totalLikes: stats.heartCount ?? stats.heart ?? 0,
          videos: videoList.slice(0, 30).map((v: any) => {
            const stat = v.stats ?? v.statsV2 ?? {};
            const views = parseInt(stat.playCount ?? stat.viewCount ?? "0") || 0;
            const likes = parseInt(stat.diggCount ?? "0") || 0;
            const comments = parseInt(stat.commentCount ?? "0") || 0;
            const shares = parseInt(stat.shareCount ?? "0") || 0;
            const total = views + likes + comments + shares;
            const engRate = total > 0 && views > 0 ? ((likes + comments + shares) / views) : 0;
            return {
              videoId: v.id ?? v.video?.id ?? String(Math.random()),
              title: v.desc ?? v.description ?? "",
              thumbnailUrl: v.video?.cover ?? v.video?.dynamicCover ?? null,
              views,
              likes,
              comments,
              shares,
              playCount: views,
              videoCreatedAt: v.createTime ? new Date(v.createTime * 1000) : null,
            };
          }),
        };
      }
    }

    logger.warn({ username }, "Could not parse TikTok profile data from page");
    return null;
  } catch (err) {
    logger.error({ err, username }, "Failed to scrape TikTok profile");
    return null;
  }
}

// ── POST /tiktok/connect ──────────────────────────────────────────────────────
// Accepts a TikTok profile URL or @username, scrapes, stores in DB
router.post("/tiktok/connect", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const { profileUrl } = req.body;

  if (!profileUrl || typeof profileUrl !== "string") {
    res.status(400).json({ error: "Please provide your TikTok profile URL or username." });
    return;
  }

  const username = extractUsername(profileUrl);
  if (!username) {
    res.status(400).json({ error: "Invalid TikTok profile URL or username. Try: https://tiktok.com/@yourname" });
    return;
  }

  const scraped = await scrapeTikTokProfile(username);
  if (!scraped) {
    res.status(422).json({
      error: "Could not fetch that TikTok profile. Make sure the account is public and the URL is correct.",
    });
    return;
  }

  try {
    const existing = await db.select().from(tiktokAccountsTable)
      .where(eq(tiktokAccountsTable.userId, user.id)).limit(1);

    let account: typeof tiktokAccountsTable.$inferSelect;

    if (existing.length) {
      const [updated] = await db.update(tiktokAccountsTable).set({
        tiktokUserId: scraped.tiktokUserId,
        username: scraped.username,
        displayName: scraped.displayName,
        avatarUrl: scraped.avatarUrl,
        bio: scraped.bio,
        followerCount: scraped.followerCount,
        followingCount: scraped.followingCount,
        videoCount: scraped.videoCount,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        lastSyncedAt: new Date(),
      }).where(eq(tiktokAccountsTable.userId, user.id)).returning();
      account = updated;
    } else {
      const [created] = await db.insert(tiktokAccountsTable).values({
        userId: user.id,
        tiktokUserId: scraped.tiktokUserId,
        username: scraped.username,
        displayName: scraped.displayName,
        avatarUrl: scraped.avatarUrl,
        bio: scraped.bio,
        followerCount: scraped.followerCount,
        followingCount: scraped.followingCount,
        videoCount: scraped.videoCount,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        lastSyncedAt: new Date(),
      }).returning();
      account = created;
    }

    // Upsert video analytics
    if (scraped.videos.length > 0) {
      for (const v of scraped.videos) {
        const existingVideo = await db.select().from(videoAnalyticsTable)
          .where(and(
            eq(videoAnalyticsTable.userId, user.id),
            eq(videoAnalyticsTable.videoId, v.videoId),
          )).limit(1);

        const total = v.views + v.likes + v.comments + v.shares;
        const engRate = v.views > 0 ? ((v.likes + v.comments + v.shares) / v.views * 100).toFixed(2) : "0";

        if (existingVideo.length) {
          await db.update(videoAnalyticsTable).set({
            title: v.title,
            thumbnailUrl: v.thumbnailUrl,
            views: v.views,
            likes: v.likes,
            comments: v.comments,
            shares: v.shares,
            playCount: v.playCount,
            engagementRate: engRate,
            videoCreatedAt: v.videoCreatedAt,
          }).where(and(
            eq(videoAnalyticsTable.userId, user.id),
            eq(videoAnalyticsTable.videoId, v.videoId),
          ));
        } else {
          await db.insert(videoAnalyticsTable).values({
            userId: user.id,
            tiktokAccountId: account.id,
            videoId: v.videoId,
            title: v.title,
            thumbnailUrl: v.thumbnailUrl,
            views: v.views,
            likes: v.likes,
            comments: v.comments,
            shares: v.shares,
            playCount: v.playCount,
            engagementRate: engRate,
            videoCreatedAt: v.videoCreatedAt,
          });
        }
      }
    }

    // Save a growth snapshot for today
    const today = new Date().toISOString().split("T")[0];
    const existingSnap = await db.select().from(growthSnapshotsTable)
      .where(and(
        eq(growthSnapshotsTable.userId, user.id),
        eq(growthSnapshotsTable.snapshotDate, today),
      )).limit(1);

    const totalLikes = scraped.videos.reduce((s, v) => s + v.likes, 0);
    const totalComments = scraped.videos.reduce((s, v) => s + v.comments, 0);
    const totalShares = scraped.videos.reduce((s, v) => s + v.shares, 0);

    if (!existingSnap.length) {
      await db.insert(growthSnapshotsTable).values({
        userId: user.id,
        tiktokAccountId: account.id,
        snapshotDate: today,
        followers: scraped.followerCount,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
      });
    } else {
      await db.update(growthSnapshotsTable).set({
        followers: scraped.followerCount,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
      }).where(and(
        eq(growthSnapshotsTable.userId, user.id),
        eq(growthSnapshotsTable.snapshotDate, today),
      ));
    }

    res.json(formatAccount(account, scraped.totalLikes));
  } catch (err) {
    logger.error({ err }, "TikTok connect DB error");
    res.status(500).json({ error: "Failed to save TikTok account. Please try again." });
  }
});

// ── POST /tiktok/sync ─────────────────────────────────────────────────────────
// Re-scrapes the profile to update stats
router.post("/tiktok/sync", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;

  const accounts = await db.select().from(tiktokAccountsTable)
    .where(eq(tiktokAccountsTable.userId, user.id)).limit(1);

  if (!accounts.length) {
    res.status(404).json({ error: "No TikTok account connected" });
    return;
  }

  const account = accounts[0];
  const scraped = await scrapeTikTokProfile(account.username);

  if (!scraped) {
    res.status(422).json({ error: "Failed to sync — TikTok profile may be private or unavailable." });
    return;
  }

  try {
    const [updated] = await db.update(tiktokAccountsTable).set({
      displayName: scraped.displayName,
      avatarUrl: scraped.avatarUrl,
      bio: scraped.bio,
      followerCount: scraped.followerCount,
      followingCount: scraped.followingCount,
      videoCount: scraped.videoCount,
      lastSyncedAt: new Date(),
    }).where(eq(tiktokAccountsTable.userId, user.id)).returning();

    // Upsert videos
    for (const v of scraped.videos) {
      const existing = await db.select().from(videoAnalyticsTable)
        .where(and(
          eq(videoAnalyticsTable.userId, user.id),
          eq(videoAnalyticsTable.videoId, v.videoId),
        )).limit(1);

      const engRate = v.views > 0 ? ((v.likes + v.comments + v.shares) / v.views * 100).toFixed(2) : "0";

      if (existing.length) {
        await db.update(videoAnalyticsTable).set({
          title: v.title, thumbnailUrl: v.thumbnailUrl,
          views: v.views, likes: v.likes, comments: v.comments,
          shares: v.shares, playCount: v.playCount, engagementRate: engRate,
          videoCreatedAt: v.videoCreatedAt,
        }).where(and(
          eq(videoAnalyticsTable.userId, user.id),
          eq(videoAnalyticsTable.videoId, v.videoId),
        ));
      } else {
        await db.insert(videoAnalyticsTable).values({
          userId: user.id, tiktokAccountId: account.id,
          videoId: v.videoId, title: v.title, thumbnailUrl: v.thumbnailUrl,
          views: v.views, likes: v.likes, comments: v.comments,
          shares: v.shares, playCount: v.playCount, engagementRate: engRate,
          videoCreatedAt: v.videoCreatedAt,
        });
      }
    }

    // Growth snapshot
    const today = new Date().toISOString().split("T")[0];
    const totalLikes = scraped.videos.reduce((s, v) => s + v.likes, 0);
    const totalComments = scraped.videos.reduce((s, v) => s + v.comments, 0);
    const totalShares = scraped.videos.reduce((s, v) => s + v.shares, 0);

    const existingSnap = await db.select().from(growthSnapshotsTable)
      .where(and(
        eq(growthSnapshotsTable.userId, user.id),
        eq(growthSnapshotsTable.snapshotDate, today),
      )).limit(1);

    if (!existingSnap.length) {
      await db.insert(growthSnapshotsTable).values({
        userId: user.id, tiktokAccountId: account.id,
        snapshotDate: today, followers: scraped.followerCount,
        likes: totalLikes, comments: totalComments, shares: totalShares,
      });
    } else {
      await db.update(growthSnapshotsTable).set({
        followers: scraped.followerCount,
        likes: totalLikes, comments: totalComments, shares: totalShares,
      }).where(and(
        eq(growthSnapshotsTable.userId, user.id),
        eq(growthSnapshotsTable.snapshotDate, today),
      ));
    }

    res.json(formatAccount(updated, scraped.totalLikes));
  } catch (err) {
    logger.error({ err }, "TikTok sync error");
    res.status(500).json({ error: "Sync failed. Please try again." });
  }
});

// ── GET /tiktok/account ───────────────────────────────────────────────────────
router.get("/tiktok/account", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const accounts = await db.select().from(tiktokAccountsTable)
    .where(eq(tiktokAccountsTable.userId, user.id)).limit(1);

  if (!accounts.length) {
    res.status(404).json({ error: "No TikTok account connected" });
    return;
  }
  res.json(formatAccount(accounts[0], 0));
});

// ── POST /tiktok/disconnect ───────────────────────────────────────────────────
router.post("/tiktok/disconnect", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  await db.delete(tiktokAccountsTable).where(eq(tiktokAccountsTable.userId, user.id));
  res.json({ message: "TikTok account disconnected" });
});

function formatAccount(acc: typeof tiktokAccountsTable.$inferSelect, totalLikes: number) {
  return {
    id: acc.id,
    username: acc.username,
    displayName: acc.displayName,
    avatarUrl: acc.avatarUrl,
    bio: acc.bio,
    followerCount: acc.followerCount,
    followingCount: acc.followingCount,
    videoCount: acc.videoCount,
    totalLikes,
    lastSyncedAt: acc.lastSyncedAt ? acc.lastSyncedAt.toISOString() : null,
  };
}

export default router;

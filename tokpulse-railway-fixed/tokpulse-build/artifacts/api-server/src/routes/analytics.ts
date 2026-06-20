import { Router } from "express";
import { db, videoAnalyticsTable, growthSnapshotsTable, tiktokAccountsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth, requirePremium } from "../middlewares/requireAuth";

const router = Router();

// ── GET /analytics/overview ───────────────────────────────────────────────────
router.get("/analytics/overview", requireAuth, requirePremium, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;

  const account = await db.select().from(tiktokAccountsTable)
    .where(eq(tiktokAccountsTable.userId, user.id)).limit(1);

  if (!account.length) {
    res.status(404).json({ error: "No TikTok account connected" });
    return;
  }

  const videos = await db.select().from(videoAnalyticsTable)
    .where(eq(videoAnalyticsTable.userId, user.id));

  const totalLikes = videos.reduce((s, v) => s + v.likes, 0);
  const totalComments = videos.reduce((s, v) => s + v.comments, 0);
  const totalShares = videos.reduce((s, v) => s + v.shares, 0);
  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const avgEngagementRate = videos.length > 0
    ? videos.reduce((s, v) => s + parseFloat(v.engagementRate as string), 0) / videos.length
    : 0;

  const acc = account[0];
  res.json({
    totalLikes,
    totalComments,
    totalShares,
    totalViews,
    totalVideos: videos.length,
    avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
    followerCount: acc.followerCount,
    followingCount: acc.followingCount,
    videoCount: acc.videoCount,
    lastUpdatedAt: acc.lastSyncedAt ? acc.lastSyncedAt.toISOString() : null,
  });
});

// ── GET /analytics/videos ─────────────────────────────────────────────────────
router.get("/analytics/videos", requireAuth, requirePremium, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const videos = await db.select().from(videoAnalyticsTable)
    .where(eq(videoAnalyticsTable.userId, user.id))
    .orderBy(desc(videoAnalyticsTable.views));

  res.json(videos.map(v => ({
    id: v.id,
    videoId: v.videoId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    likes: v.likes,
    comments: v.comments,
    shares: v.shares,
    views: v.views,
    playCount: v.playCount,
    engagementRate: parseFloat(v.engagementRate as string),
    createdAt: v.videoCreatedAt ? v.videoCreatedAt.toISOString() : v.createdAt.toISOString(),
  })));
});

// ── GET /analytics/top-videos ─────────────────────────────────────────────────
router.get("/analytics/top-videos", requireAuth, requirePremium, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const videos = await db.select().from(videoAnalyticsTable)
    .where(eq(videoAnalyticsTable.userId, user.id))
    .orderBy(desc(videoAnalyticsTable.views))
    .limit(10);

  res.json(videos.map(v => ({
    id: v.id,
    videoId: v.videoId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    likes: v.likes,
    comments: v.comments,
    shares: v.shares,
    views: v.views,
    playCount: v.playCount,
    engagementRate: parseFloat(v.engagementRate as string),
    createdAt: v.videoCreatedAt ? v.videoCreatedAt.toISOString() : v.createdAt.toISOString(),
  })));
});

// ── GET /analytics/growth ─────────────────────────────────────────────────────
router.get("/analytics/growth", requireAuth, requirePremium, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;
  const period = (req.query.period as string) ?? "30d";

  const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "all" ? 3650 : 30;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromDateStr = fromDate.toISOString().split("T")[0];

  const snapshots = await db.select().from(growthSnapshotsTable)
    .where(eq(growthSnapshotsTable.userId, user.id))
    .orderBy(growthSnapshotsTable.snapshotDate);

  const filtered = period === "all"
    ? snapshots
    : snapshots.filter(s => s.snapshotDate >= fromDateStr);

  res.json(filtered.map(s => ({
    date: s.snapshotDate,
    followers: s.followers,
    likes: s.likes,
    comments: s.comments,
    shares: s.shares,
  })));
});

// ── GET /analytics/all-time ───────────────────────────────────────────────────
router.get("/analytics/all-time", requireAuth, requirePremium, async (req, res): Promise<void> => {
  const user = (req as any).dbUser;

  const account = await db.select().from(tiktokAccountsTable)
    .where(eq(tiktokAccountsTable.userId, user.id)).limit(1);

  if (!account.length) {
    res.status(404).json({ error: "No TikTok account connected" });
    return;
  }

  const videos = await db.select().from(videoAnalyticsTable)
    .where(eq(videoAnalyticsTable.userId, user.id))
    .orderBy(desc(videoAnalyticsTable.views));

  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const totalLikes = videos.reduce((s, v) => s + v.likes, 0);
  const totalComments = videos.reduce((s, v) => s + v.comments, 0);
  const totalShares = videos.reduce((s, v) => s + v.shares, 0);

  const bestVideo = videos.length > 0 ? videos[0] : null;
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const avgLikes = videos.length > 0 ? Math.round(totalLikes / videos.length) : 0;
  const avgEngRate = videos.length > 0
    ? videos.reduce((s, v) => s + parseFloat(v.engagementRate as string), 0) / videos.length
    : 0;

  // Earliest snapshot for "joined" date
  const snapshots = await db.select().from(growthSnapshotsTable)
    .where(eq(growthSnapshotsTable.userId, user.id))
    .orderBy(growthSnapshotsTable.snapshotDate)
    .limit(1);

  res.json({
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    totalVideos: videos.length,
    avgViews,
    avgLikes,
    avgEngagementRate: Math.round(avgEngRate * 100) / 100,
    followerCount: account[0].followerCount,
    followingCount: account[0].followingCount,
    bestVideo: bestVideo ? {
      videoId: bestVideo.videoId,
      title: bestVideo.title,
      thumbnailUrl: bestVideo.thumbnailUrl,
      views: bestVideo.views,
      likes: bestVideo.likes,
      comments: bestVideo.comments,
      shares: bestVideo.shares,
      engagementRate: parseFloat(bestVideo.engagementRate as string),
    } : null,
    trackingSince: snapshots[0]?.snapshotDate ?? null,
  });
});

// ── POST /analytics/refresh ───────────────────────────────────────────────────
router.post("/analytics/refresh", requireAuth, async (req, res): Promise<void> => {
  res.json({ message: "Use POST /api/tiktok/sync to refresh your data." });
});

export default router;

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useGetMe, useGetTikTokAccount, useGetAnalyticsOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, Heart, MessageCircle, Share2, Users, Video, RefreshCw, ExternalLink, TrendingUp, Zap } from "lucide-react";

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function ConnectCard({ onConnected }: { onConnected: () => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tiktok/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profileUrl: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to connect. Please try again.");
      } else {
        onConnected();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border bg-card col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-14 px-6 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="w-9 h-9 fill-primary" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.5 3a8.5 8.5 0 0 0 7 7v4a12.4 12.4 0 0 1-7-2.2V20a9 9 0 1 1-9-9c.32 0 .63.02.94.05v4.08A5 5 0 1 0 17.5 20v-17h4Z"/>
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">Connect Your TikTok</h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            Paste your TikTok profile link below. We'll pull your stats instantly — no login or API key needed.
          </p>
        </div>

        <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://tiktok.com/@yourname"
            className="flex-1 bg-muted border-border"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Connecting…</>
            ) : "Connect"}
          </Button>
        </form>

        {error && (
          <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2 max-w-md">
            {error}
          </p>
        )}

        <p className="text-xs text-muted-foreground/60">
          Only public TikTok accounts are supported. We never access your password.
        </p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const qc = useQueryClient();
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: tiktok, isLoading: tiktokLoading, error: tiktokError } = useGetTikTokAccount();
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["getTikTokAccount"] });
    qc.invalidateQueries({ queryKey: ["getAnalyticsOverview"] });
    qc.invalidateQueries({ queryKey: ["getVideoAnalytics"] });
    qc.invalidateQueries({ queryKey: ["getGrowthChart"] });
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/tiktok/sync", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg("✓ Stats updated successfully!");
        invalidateAll();
      } else {
        setSyncMsg(data.error ?? "Sync failed.");
      }
    } catch {
      setSyncMsg("Network error during sync.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 4000);
    }
  }

  const isLoading = userLoading || tiktokLoading;
  const hasAccount = !tiktokError && !!tiktok;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {hasAccount && tiktok.lastSyncedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Last synced {new Date(tiktok.lastSyncedAt).toLocaleString()}
              </p>
            )}
          </div>
          {hasAccount && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync Stats"}
            </Button>
          )}
        </div>

        {syncMsg && (
          <div className={`text-sm px-4 py-2 rounded-lg border ${syncMsg.startsWith("✓") ? "bg-primary/10 border-primary/20 text-primary" : "bg-destructive/10 border-destructive/20 text-destructive"}`}>
            {syncMsg}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !hasAccount ? (
          <div className="grid gap-6">
            <ConnectCard onConnected={invalidateAll} />
          </div>
        ) : (
          <>
            {/* Profile + Plan row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Card */}
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    {tiktok.avatarUrl ? (
                      <img src={tiktok.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-primary object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary">
                        {(tiktok.displayName ?? tiktok.username ?? "T").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold truncate">{tiktok.displayName}</h2>
                      <a
                        href={`https://tiktok.com/@${tiktok.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        @{tiktok.username} <ExternalLink className="w-3 h-3" />
                      </a>
                      {tiktok.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tiktok.bio}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/40 rounded-xl p-3 text-center">
                      <p className="text-xl font-extrabold text-primary">{fmt(tiktok.followerCount ?? 0)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Followers</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-3 text-center">
                      <p className="text-xl font-extrabold">{fmt(tiktok.followingCount ?? 0)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Following</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-3 text-center">
                      <p className="text-xl font-extrabold">{fmt(tiktok.videoCount ?? 0)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Videos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Card */}
              <Card className="border-border bg-card relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-muted-foreground">Current Plan</p>
                  </div>
                  <p className="text-3xl font-extrabold uppercase text-primary mb-4">{user?.plan ?? "Free"}</p>

                  {user?.plan !== "premium" ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Unlock deep analytics, AI content tools, growth charts, and more.</p>
                      <div className="space-y-1.5">
                        {["Full analytics deep-dive", "AI content assistant", "Growth charts (7d/30d/90d/All)", "Viral ideas & hashtag AI"].map(f => (
                          <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {f}
                          </div>
                        ))}
                      </div>
                      <Button asChild className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                        <Link href="/upgrade">Upgrade for ₦1,500/mo</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-primary/80">You have full access to all TokPulse features.</p>
                      <div className="flex gap-3">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href="/analytics">
                            <TrendingUp className="w-4 h-4 mr-1.5" /> Analytics
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href="/assistant">
                            <Zap className="w-4 h-4 mr-1.5" /> AI Tools
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Analytics overview — premium only */}
            {user?.plan === "premium" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Quick Overview
                </h2>

                {overviewLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                  </div>
                ) : overview ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Total Views", value: fmt(overview.totalViews ?? 0), icon: Eye, color: "text-blue-400" },
                      { label: "Total Likes", value: fmt(overview.totalLikes ?? 0), icon: Heart, color: "text-pink-400" },
                      { label: "Total Comments", value: fmt(overview.totalComments ?? 0), icon: MessageCircle, color: "text-yellow-400" },
                      { label: "Avg Engagement", value: `${Number(overview.avgEngagementRate ?? 0).toFixed(1)}%`, icon: TrendingUp, color: "text-primary" },
                    ].map(stat => (
                      <Card key={stat.label} className="border-border bg-card">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <div>
                            <p className="text-2xl font-extrabold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/analytics">View Full Analytics →</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Not premium nudge for account stats */}
            {user?.plan !== "premium" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">See your full analytics</p>
                    <p className="text-sm text-muted-foreground">Views, likes, growth charts, video breakdown — all unlocked with Premium.</p>
                  </div>
                  <Button asChild size="sm" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/upgrade">Upgrade</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

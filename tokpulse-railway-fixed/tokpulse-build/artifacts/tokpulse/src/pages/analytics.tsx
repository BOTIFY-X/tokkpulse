import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useGetGrowthChart, useGetVideoAnalytics, useGetAnalyticsOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { Eye, Heart, MessageCircle, Share2, TrendingUp, Users, Video, BarChart2, Trophy } from "lucide-react";

type Period = "7d" | "30d" | "90d" | "all";

function fmt(n: number | undefined | null): string {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        </div>
        <p className="text-2xl font-extrabold">{value}</p>
      </CardContent>
    </Card>
  );
}

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
  "all": "All Time",
};

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(240 10% 8%)",
  border: "1px solid hsl(240 10% 18%)",
  borderRadius: "8px",
  color: "hsl(0 0% 98%)",
};

export default function Analytics() {
  const [period, setPeriod] = useState<Period>("30d");
  const [videoSort, setVideoSort] = useState<"views" | "likes" | "engagement">("views");

  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const chartPeriod = period === "all" ? "90d" : period;
  const { data: chartData, isLoading: chartLoading } = useGetGrowthChart({ period: chartPeriod });
  const { data: videos, isLoading: videosLoading } = useGetVideoAnalytics();

  // All-time from separate endpoint
  const { data: allTime, isLoading: allTimeLoading } = useQuery({
    queryKey: ["analyticsAllTime"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/all-time", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const sortedVideos = [...(videos ?? [])].sort((a, b) => {
    if (videoSort === "views") return b.views - a.views;
    if (videoSort === "likes") return b.likes - a.likes;
    return (b.engagementRate ?? 0) - (a.engagementRate ?? 0);
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <div className="flex gap-1 bg-muted p-1 rounded-lg border border-border">
            {(["7d", "30d", "90d", "all"] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${period === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* ── All-time summary stats ───────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> Channel Overview
          </h2>
          {overviewLoading || allTimeLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Followers" value={fmt(overview?.followerCount)} icon={Users} color="text-primary" />
              <StatCard label="Total Videos" value={fmt(overview?.totalVideos)} icon={Video} color="text-blue-400" />
              <StatCard label="Total Views" value={fmt(allTime?.totalViews ?? overview?.totalViews)} icon={Eye} color="text-purple-400" />
              <StatCard label="Total Likes" value={fmt(allTime?.totalLikes ?? overview?.totalLikes)} icon={Heart} color="text-pink-400" />
              <StatCard label="Total Comments" value={fmt(allTime?.totalComments ?? overview?.totalComments)} icon={MessageCircle} color="text-yellow-400" />
              <StatCard label="Total Shares" value={fmt(allTime?.totalShares ?? overview?.totalShares)} icon={Share2} color="text-green-400" />
              <StatCard label="Avg Views / Video" value={fmt(allTime?.avgViews)} icon={TrendingUp} color="text-orange-400" />
              <StatCard label="Avg Engagement" value={`${Number(overview?.avgEngagementRate ?? 0).toFixed(1)}%`} icon={TrendingUp} color="text-primary" />
            </div>
          )}
        </div>

        {/* ── Best performing video ────────────────────────────────────────── */}
        {allTime?.bestVideo && (
          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" /> Best Performing Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {allTime.bestVideo.thumbnailUrl && (
                  <img
                    src={allTime.bestVideo.thumbnailUrl}
                    alt={allTime.bestVideo.title}
                    className="w-16 h-24 rounded-lg object-cover shrink-0 border border-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base mb-3 line-clamp-2">{allTime.bestVideo.title || "Untitled video"}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Views", value: fmt(allTime.bestVideo.views), icon: Eye },
                      { label: "Likes", value: fmt(allTime.bestVideo.likes), icon: Heart },
                      { label: "Comments", value: fmt(allTime.bestVideo.comments), icon: MessageCircle },
                      { label: "Engagement", value: `${Number(allTime.bestVideo.engagementRate).toFixed(1)}%`, icon: TrendingUp },
                    ].map(s => (
                      <div key={s.label} className="bg-muted/40 rounded-lg p-2.5">
                        <p className="text-lg font-extrabold text-primary">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Growth chart ─────────────────────────────────────────────────── */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Follower Growth — {PERIOD_LABELS[period]}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {chartLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Loading chart…
              </div>
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 15%)" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(240 5% 45%)"
                    tick={{ fontSize: 11 }}
                    tickFormatter={d => {
                      const date = new Date(d);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke="hsl(240 5% 45%)" tick={{ fontSize: 11 }} tickFormatter={n => fmt(n)} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(val: number, name: string) => [fmt(val), name.charAt(0).toUpperCase() + name.slice(1)]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="followers" stroke="hsl(165 100% 50%)" strokeWidth={2.5} dot={false} name="Followers" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <TrendingUp className="w-8 h-8 opacity-30" />
                <p>No growth data yet — sync your account to start tracking.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Engagement chart ─────────────────────────────────────────────── */}
        {chartData && chartData.length > 0 && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Engagement Breakdown — {PERIOD_LABELS[period]}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 15%)" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(240 5% 45%)"
                    tick={{ fontSize: 11 }}
                    tickFormatter={d => {
                      const date = new Date(d);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke="hsl(240 5% 45%)" tick={{ fontSize: 11 }} tickFormatter={n => fmt(n)} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(val: number, name: string) => [fmt(val), name.charAt(0).toUpperCase() + name.slice(1)]} />
                  <Legend />
                  <Bar dataKey="likes" fill="hsl(330 80% 65%)" name="Likes" radius={[3,3,0,0]} />
                  <Bar dataKey="comments" fill="hsl(50 90% 60%)" name="Comments" radius={[3,3,0,0]} />
                  <Bar dataKey="shares" fill="hsl(200 80% 60%)" name="Shares" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* ── Videos table ─────────────────────────────────────────────────── */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Your Videos
              </CardTitle>
              <div className="flex gap-1 bg-muted p-1 rounded-lg border border-border text-xs">
                {(["views", "likes", "engagement"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setVideoSort(s)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${videoSort === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />)}
              </div>
            ) : sortedVideos.length > 0 ? (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wide border-b border-border">
                      <th className="px-3 py-3 text-left">#</th>
                      <th className="px-3 py-3 text-left">Video</th>
                      <th className="px-3 py-3 text-right">Views</th>
                      <th className="px-3 py-3 text-right">Likes</th>
                      <th className="px-3 py-3 text-right">Comments</th>
                      <th className="px-3 py-3 text-right">Shares</th>
                      <th className="px-3 py-3 text-right">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedVideos.map((v, i) => (
                      <tr key={v.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3 max-w-[260px]">
                            {v.thumbnailUrl ? (
                              <img
                                src={v.thumbnailUrl}
                                alt={v.title}
                                className="w-9 h-12 rounded object-cover shrink-0 border border-border"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-9 h-12 rounded bg-muted shrink-0 flex items-center justify-center">
                                <Video className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium line-clamp-2 text-xs leading-snug">
                              {v.title || "Untitled video"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-bold">{fmt(v.views)}</td>
                        <td className="px-3 py-3 text-right text-pink-400">{fmt(v.likes)}</td>
                        <td className="px-3 py-3 text-right text-yellow-400">{fmt(v.comments)}</td>
                        <td className="px-3 py-3 text-right text-blue-400">{fmt(v.shares)}</td>
                        <td className="px-3 py-3 text-right">
                          <span className={`font-bold ${Number(v.engagementRate) > 5 ? "text-primary" : "text-foreground"}`}>
                            {Number(v.engagementRate).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Video className="w-8 h-8 opacity-30" />
                <p className="text-sm">No video data yet. Connect and sync your TikTok account.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

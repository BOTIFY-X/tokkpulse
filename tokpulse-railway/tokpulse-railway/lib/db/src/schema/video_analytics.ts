import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const videoAnalyticsTable = pgTable("video_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tiktokAccountId: integer("tiktok_account_id").notNull(),
  videoId: text("video_id").notNull(),
  title: text("title").notNull().default(""),
  thumbnailUrl: text("thumbnail_url"),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  views: integer("views").notNull().default(0),
  playCount: integer("play_count").notNull().default(0),
  engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  videoCreatedAt: timestamp("video_created_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVideoAnalyticsSchema = createInsertSchema(videoAnalyticsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVideoAnalytics = z.infer<typeof insertVideoAnalyticsSchema>;
export type VideoAnalytics = typeof videoAnalyticsTable.$inferSelect;

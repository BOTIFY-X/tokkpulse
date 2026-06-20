import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tiktokAccountsTable = pgTable("tiktok_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tiktokUserId: text("tiktok_user_id").notNull().unique(),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  followerCount: integer("follower_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
  videoCount: integer("video_count").notNull().default(0),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTiktokAccountSchema = createInsertSchema(tiktokAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTiktokAccount = z.infer<typeof insertTiktokAccountSchema>;
export type TiktokAccount = typeof tiktokAccountsTable.$inferSelect;

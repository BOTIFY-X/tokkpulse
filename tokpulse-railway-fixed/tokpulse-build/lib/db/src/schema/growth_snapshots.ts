import { pgTable, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const growthSnapshotsTable = pgTable("growth_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tiktokAccountId: integer("tiktok_account_id").notNull(),
  snapshotDate: date("snapshot_date", { mode: "string" }).notNull(),
  followers: integer("followers").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGrowthSnapshotSchema = createInsertSchema(growthSnapshotsTable).omit({ id: true, createdAt: true });
export type InsertGrowthSnapshot = z.infer<typeof insertGrowthSnapshotSchema>;
export type GrowthSnapshot = typeof growthSnapshotsTable.$inferSelect;

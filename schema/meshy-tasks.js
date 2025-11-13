// schema/meshy-tasks.js
import { pgTable, text, integer, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";

export const meshyTasks = pgTable("meshy_tasks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  taskId: varchar("task_id", { length: 100 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  progress: integer("progress").default(0),
  prompt: text("prompt"),
  artStyle: varchar("art_style", { length: 50 }),
  modelUrls: jsonb("model_urls"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow(),
  finishedAt: timestamp("finished_at")
});
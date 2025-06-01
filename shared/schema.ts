import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  element: text("element").notNull(),
  section: text("section").notNull(),
  status: text("status").notNull().default("pending"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  clickData: text("click_data"), // JSON string containing click details
});

export const clickCaptures = pgTable("click_captures", {
  id: serial("id").primaryKey(),
  elementSelector: text("element_selector").notNull(),
  elementText: text("element_text"),
  pageUrl: text("page_url").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  processed: boolean("processed").notNull().default(false),
});

export const captureSettings = pgTable("capture_settings", {
  id: serial("id").primaryKey(),
  autoTaskGeneration: boolean("auto_task_generation").notNull().default(true),
  realTimeSync: boolean("real_time_sync").notNull().default(true),
  captureActive: boolean("capture_active").notNull().default(false),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  timestamp: true,
});

export const insertClickCaptureSchema = createInsertSchema(clickCaptures).omit({
  id: true,
  timestamp: true,
  processed: true,
});

export const insertCaptureSettingsSchema = createInsertSchema(captureSettings).omit({
  id: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertClickCapture = z.infer<typeof insertClickCaptureSchema>;
export type ClickCapture = typeof clickCaptures.$inferSelect;
export type InsertCaptureSettings = z.infer<typeof insertCaptureSettingsSchema>;
export type CaptureSettings = typeof captureSettings.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

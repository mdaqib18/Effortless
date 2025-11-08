import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Task types for automation
export const taskTypes = ["cab", "bill", "grocery", "food", "reminder"] as const;
export const taskStatuses = ["pending", "active", "completed", "failed", "cancelled"] as const;
export const recurrenceTypes = ["once", "daily", "weekly", "monthly"] as const;

// Automation tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  taskType: text("task_type").notNull(),
  action: text("action").notNull(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("pending"),
  platform: text("platform"),
  category: text("category"),
  recurrence: text("recurrence").default("once"),
  scheduledTime: text("scheduled_time"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Task status updates for real-time tracking
export interface TaskUpdate {
  taskId: string;
  status: string;
  message: string;
  progress?: number;
  metadata?: any;
  timestamp: string;
}

// Gemini AI response structure
export interface AIResponse {
  taskType: string;
  action: string;
  platform?: string;
  time?: string;
  recurrence?: string;
  category?: string;
  confirmationRequired?: boolean;
  clarification?: string;
  reply?: string;
}

// Cab booking details
export interface CabBooking {
  taskId: string;
  driverName: string;
  driverPhoto: string;
  carModel: string;
  carNumber: string;
  rating: number;
  eta: number;
  distance: number;
  fare: number;
  status: "requesting" | "driver_found" | "driver_enroute" | "ride_started" | "completed";
}

// Bill payment details
export interface BillPayment {
  taskId: string;
  provider: string;
  amount: number;
  billType: string;
  dueDate?: string;
  status: "pending" | "processing" | "success" | "failed";
  transactionId?: string;
}

// Grocery order details
export interface GroceryOrder {
  taskId: string;
  storeName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: "confirmed" | "packed" | "out_for_delivery" | "delivered";
  deliveryTime?: string;
}

// Food order details
export interface FoodOrder {
  taskId: string;
  restaurantName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: "confirmed" | "preparing" | "rider_assigned" | "on_the_way" | "delivered";
  estimatedTime?: number;
}

// Reminder details
export interface Reminder {
  taskId: string;
  message: string;
  scheduledTime: string;
  recurring: boolean;
  recurrence?: string;
  status: "scheduled" | "triggered" | "dismissed" | "snoozed";
}

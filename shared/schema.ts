import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Task types for automation
export const taskTypes = ["cab", "bill", "grocery", "food", "medicine", "reminder"] as const;
export const taskStatuses = ["pending", "active", "completed", "failed", "cancelled"] as const;
export const recurrenceTypes = ["once", "daily", "weekly", "monthly"] as const;
export const paymentStatuses = ["pending", "processing", "3ds_required", "success", "failed", "cancelled"] as const;
export const paymentMethods = ["card", "upi", "netbanking", "wallet"] as const;

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
  scheduleType: text("schedule_type").default("one_time"),
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

// User settings table
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  soundEnabled: boolean("sound_enabled").default(true),
  reminderLeadTime: integer("reminder_lead_time").default(15),
  
  preferredCabService: text("preferred_cab_service"),
  preferredPaymentGateway: text("preferred_payment_gateway"),
  preferredGroceryStore: text("preferred_grocery_store"),
  preferredFoodService: text("preferred_food_service"),
  preferredPharmacy: text("preferred_pharmacy"),
  
  quietHoursStart: text("quiet_hours_start"),
  quietHoursEnd: text("quiet_hours_end"),
  autoRunEnabled: boolean("auto_run_enabled").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Payments table for mock transaction tracking
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  taskId: varchar("task_id"),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("INR"),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").default("card"),
  cardLast4: varchar("card_last4", { length: 4 }).default("4242"),
  transactionId: varchar("transaction_id"),
  threeDSecureRequired: boolean("three_d_secure_required").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Task status updates for real-time tracking
export interface TaskUpdate {
  taskId: string;
  status: string;
  message: string;
  progress?: number;
  metadata?: any;
  timestamp: string;
}

// Payment status updates for real-time tracking
export interface PaymentUpdate {
  paymentId: string;
  taskId?: string;
  status: "pending" | "processing" | "3ds_required" | "success" | "failed" | "cancelled";
  message: string;
  amount?: number;
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

// Medicine order details
export interface MedicineOrder {
  taskId: string;
  pharmacyName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: "confirmed" | "packed" | "out_for_delivery" | "delivered";
  deliveryTime?: string;
  prescriptionRequired?: boolean;
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

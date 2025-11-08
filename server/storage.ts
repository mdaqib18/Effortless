import { type Task, type InsertTask, tasks, type UserSettings, type InsertUserSettings, userSettings, type Payment, type InsertPayment, payments } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // Task operations
  getTask(id: string): Promise<Task | undefined>;
  getTasksByUser(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  // User settings operations
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createOrUpdateUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  
  // Payment operations
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(insertTask).returning();
    return result[0];
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const result = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }
  
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
    return result[0];
  }
  
  async createOrUpdateUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const existing = await this.getUserSettings(settings.userId);
    
    const settingsData = {
      ...settings,
      updatedAt: new Date(),
    };
    
    if (existing) {
      const result = await db
        .update(userSettings)
        .set(settingsData)
        .where(eq(userSettings.userId, settings.userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userSettings).values(settingsData).returning();
      return result[0];
    }
  }
  
  async getPayment(id: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }
  
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(insertPayment).returning();
    return result[0];
  }
  
  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const result = await db
      .update(payments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  }
  
  async deletePayment(id: string): Promise<boolean> {
    const result = await db.delete(payments).where(eq(payments.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();

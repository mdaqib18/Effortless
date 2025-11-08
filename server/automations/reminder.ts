// Reminder automation with cron scheduling
import type { Reminder } from "@shared/schema";
import cron from "node-cron";

const scheduledReminders = new Map<string, cron.ScheduledTask>();

export function scheduleReminder(
  taskId: string,
  message: string,
  scheduledTime: string,
  recurrence: string,
  broadcast: (data: any) => void
) {
  const reminder: Reminder = {
    taskId,
    message,
    scheduledTime,
    recurring: recurrence !== "once",
    recurrence,
    status: "scheduled",
  };

  // For demo purposes, trigger reminder after a few seconds
  // In production, this would use actual cron expressions
  const cronExpression = getCronExpression(recurrence);
  
  if (cronExpression) {
    const task = cron.schedule(cronExpression, () => {
      triggerReminder(taskId, reminder, broadcast);
    });
    scheduledReminders.set(taskId, task);
  } else {
    // One-time reminder - trigger after 5 seconds for demo
    setTimeout(() => {
      triggerReminder(taskId, reminder, broadcast);
    }, 5000);
  }

  broadcast({
    taskId,
    status: "active",
    message: `Reminder scheduled: "${message}"`,
    progress: 100,
    metadata: { reminder },
    timestamp: new Date().toISOString(),
  });
}

function triggerReminder(taskId: string, reminder: Reminder, broadcast: (data: any) => void) {
  reminder.status = "triggered";
  
  broadcast({
    taskId,
    status: "active",
    message: "⏰ Reminder triggered!",
    progress: 100,
    metadata: { reminder },
    timestamp: new Date().toISOString(),
  });
}

function getCronExpression(recurrence: string): string | null {
  switch (recurrence) {
    case "daily":
      return "0 9 * * *"; // 9 AM every day
    case "weekly":
      return "0 9 * * 1"; // 9 AM every Monday
    case "monthly":
      return "0 9 1 * *"; // 9 AM on 1st of every month
    default:
      return null; // one-time
  }
}

export function cancelReminder(taskId: string) {
  const task = scheduledReminders.get(taskId);
  if (task) {
    task.stop();
    scheduledReminders.delete(taskId);
  }
}

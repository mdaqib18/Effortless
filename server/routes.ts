import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { parseAutomationPrompt } from "./gemini";
import { executeCabBooking } from "./automations/cab";
import { executeBillPayment } from "./automations/bill";
import { executeGroceryOrder } from "./automations/grocery";
import { executeFoodOrder } from "./automations/food";
import { executeMedicineOrder } from "./automations/medicine";
import { scheduleReminder } from "./automations/reminder";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Socket.io server for real-time updates
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket.io client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Socket.io client disconnected:', socket.id);
    });
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    io.emit('taskUpdate', data);
  }

  // AI prompt parsing endpoint
  app.post("/api/ai/parse", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Try Gemini first, fallback to mock if API key is missing
      try {
        const parsed = await parseAutomationPrompt(prompt);
        res.json(parsed);
      } catch (geminiError) {
        console.log("Using mock AI parser (Gemini not available)");
        // Simple mock parser for demo
        const mockParsed = mockParsePrompt(prompt);
        res.json(mockParsed);
      }
    } catch (error: any) {
      console.error("Failed to parse prompt:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Mock parser for when Gemini is unavailable
  function mockParsePrompt(prompt: string) {
    const lower = prompt.toLowerCase();
    
    // Check for conversational ordering patterns
    const hasItems = /milk|bread|eggs|pizza|burger|paracetamol|cough|tablet/i.test(prompt);
    
    // Detect category based on items mentioned (for when user just lists items)
    const hasGroceryItems = /milk|bread|eggs|soap|toothpaste|shampoo/i.test(prompt);
    const hasFoodItems = /pizza|burger|pasta|sandwich/i.test(prompt);
    const hasMedicineItems = /paracetamol|cough|vitamin|band-aid|tablet/i.test(prompt);
    
    if (lower.includes("cab") || lower.includes("ride") || lower.includes("uber") || lower.includes("ola")) {
      return {
        taskType: "cab",
        action: "book_cab",
        reply: "I can book a cab to the airport for you.",
        recurrence: "once",
      };
    } else if (lower.includes("bill") || lower.includes("pay") || lower.includes("wifi") || lower.includes("electricity")) {
      return {
        taskType: "bill",
        action: "pay_bill",
        platform: "Airtel",
        reply: "I'll help you pay that bill!",
        recurrence: "once",
      };
    } else if ((lower.includes("food") || lower.includes("restaurant") || lower.includes("pizza") || lower.includes("burger") || lower.includes("meal") || lower.includes("eat")) && !lower.includes("grocery") && !lower.includes("groceries")) {
      if (hasItems) {
        const items = [];
        if (lower.includes("pizza")) items.push({ name: "Pizza", quantity: 1, price: 350 });
        if (lower.includes("burger")) items.push({ name: "Burger", quantity: 1, price: 180 });
        
        return {
          taskType: "food",
          action: "order_food",
          category: "food",
          items,
          reply: `Perfect! I'll order ${items.map(i => i.name).join(", ")} for you.`,
          recurrence: "once",
        };
      } else {
        return {
          taskType: "food",
          action: "order_food",
          category: "food",
          needsItems: true,
          followUp: true,
          reply: "Sure! What would you like to order?",
          recurrence: "once",
        };
      }
    } else if (lower.includes("grocery") || lower.includes("groceries") || lower.includes("vegetables")) {
      if (hasItems) {
        const items = [];
        if (lower.includes("milk")) items.push({ name: "Milk", quantity: 1, price: 60 });
        if (lower.includes("bread")) items.push({ name: "Bread", quantity: 1, price: 40 });
        if (lower.includes("eggs")) items.push({ name: "Eggs", quantity: 1, price: 84 });
        
        return {
          taskType: "grocery",
          action: "order_groceries",
          category: "grocery",
          items,
          reply: `Got it! I'll order ${items.map(i => i.name).join(", ")} for you.`,
          recurrence: "once",
        };
      } else {
        return {
          taskType: "grocery",
          action: "order_groceries",
          category: "grocery",
          needsItems: true,
          followUp: true,
          reply: "Sure! What items would you like to add to your grocery list?",
          recurrence: "once",
        };
      }
    } else if (lower.includes("medicine") || lower.includes("tablet") || lower.includes("pharmacy") || lower.includes("capsule") || lower.includes("syrup")) {
      if (hasItems) {
        const items = [];
        if (lower.includes("paracetamol")) items.push({ name: "Paracetamol", quantity: 1, price: 15 });
        if (lower.includes("cough")) items.push({ name: "Cough Syrup", quantity: 1, price: 120 });
        
        return {
          taskType: "medicine",
          action: "order_medicine",
          category: "medicine",
          items,
          reply: `I'll order ${items.map(i => i.name).join(" and ")} from a nearby pharmacy.`,
          recurrence: "once",
        };
      } else {
        return {
          taskType: "medicine",
          action: "order_medicine",
          category: "medicine",
          needsItems: true,
          followUp: true,
          reply: "Sure! Please list the medicines you'd like to order.",
          recurrence: "once",
        };
      }
    } 
    // Fallback: If user just lists items without mentioning category
    else if (hasGroceryItems) {
      const items = [];
      if (lower.includes("milk")) items.push({ name: "Milk", quantity: 1, price: 60 });
      if (lower.includes("bread")) items.push({ name: "Bread", quantity: 1, price: 40 });
      if (lower.includes("eggs")) items.push({ name: "Eggs", quantity: 1, price: 84 });
      if (lower.includes("soap")) items.push({ name: "Soap", quantity: 1, price: 50 });
      if (lower.includes("toothpaste")) items.push({ name: "Toothpaste", quantity: 1, price: 75 });
      if (lower.includes("shampoo")) items.push({ name: "Shampoo", quantity: 1, price: 220 });
      
      return {
        taskType: "grocery",
        action: "order_groceries",
        category: "grocery",
        items,
        reply: `Got it! I'll order ${items.map(i => i.name).join(", ")} for you.`,
        recurrence: "once",
      };
    } else if (hasFoodItems) {
      const items = [];
      if (lower.includes("pizza")) items.push({ name: "Pizza", quantity: 1, price: 350 });
      if (lower.includes("burger")) items.push({ name: "Burger", quantity: 1, price: 180 });
      if (lower.includes("pasta")) items.push({ name: "Pasta", quantity: 1, price: 250 });
      if (lower.includes("sandwich")) items.push({ name: "Sandwich", quantity: 1, price: 120 });
      
      return {
        taskType: "food",
        action: "order_food",
        category: "food",
        items,
        reply: `Perfect! I'll order ${items.map(i => i.name).join(", ")} for you.`,
        recurrence: "once",
      };
    } else if (hasMedicineItems) {
      const items = [];
      if (lower.includes("paracetamol")) items.push({ name: "Paracetamol", quantity: 1, price: 15 });
      if (lower.includes("cough")) items.push({ name: "Cough Syrup", quantity: 1, price: 120 });
      if (lower.includes("vitamin")) items.push({ name: "Vitamin C", quantity: 1, price: 180 });
      if (lower.includes("band-aid") || lower.includes("bandaid")) items.push({ name: "Band-Aid", quantity: 1, price: 35 });
      
      return {
        taskType: "medicine",
        action: "order_medicine",
        category: "medicine",
        items,
        reply: `I'll order ${items.map(i => i.name).join(" and ")} from a nearby pharmacy.`,
        recurrence: "once",
      };
    } else {
      return {
        taskType: "reminder",
        action: "create_reminder",
        reply: "I'll set a reminder for you!",
        recurrence: "once",
      };
    }
  }

  // Get all tasks for a user
  app.get("/api/tasks", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const tasks = await storage.getTasksByUser(userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Run a task (execute automation)
  app.post("/api/tasks/:id/run", async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Update task status to active
      await storage.updateTask(id, { status: "active" });

      // Execute automation based on task type
      res.json({ message: "Task execution started", taskId: id });

      // Execute in background with real-time updates
      setTimeout(async () => {
        try {
          switch (task.taskType) {
            case "cab":
              await executeCabBooking(id, broadcast);
              break;
            case "bill":
              await executeBillPayment(id, task.platform || "Unknown", broadcast);
              break;
            case "grocery":
              await executeGroceryOrder(id, broadcast);
              break;
            case "food":
              await executeFoodOrder(id, broadcast);
              break;
            case "medicine":
              await executeMedicineOrder(id, broadcast);
              break;
            case "reminder":
              scheduleReminder(
                id,
                task.prompt,
                task.scheduledTime || new Date().toISOString(),
                task.recurrence || "once",
                broadcast
              );
              break;
            default:
              broadcast({
                taskId: id,
                status: "completed",
                message: "Task completed",
                progress: 100,
                timestamp: new Date().toISOString(),
              });
          }

          // Update task status in storage
          await storage.updateTask(id, { status: "completed" });
        } catch (error) {
          console.error("Task execution error:", error);
          await storage.updateTask(id, { status: "failed" });
          broadcast({
            taskId: id,
            status: "failed",
            message: "Task execution failed",
            progress: 100,
            timestamp: new Date().toISOString(),
          });
        }
      }, 100);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json({ message: "Task deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user settings
  app.get("/api/settings", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const settings = await storage.getUserSettings(userId);
      if (!settings) {
        return res.json({
          userId,
          emailNotifications: true,
          smsNotifications: false,
          soundEnabled: true,
          reminderLeadTime: 15,
          autoRunEnabled: true,
        });
      }
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user settings
  app.post("/api/settings", async (req, res) => {
    try {
      const settings = await storage.createOrUpdateUserSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Grocery order endpoint
  app.post("/api/grocery/order", async (req, res) => {
    try {
      const { userId, items, scheduleType } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      if (!items || items.length === 0) {
        return res.json({
          followUp: true,
          message: "Please list the grocery items you'd like to order.",
        });
      }

      const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
      const stores = ["BigBasket", "Dunzo", "Blinkit", "Zepto", "Swiggy Instamart"];
      const store = stores[Math.floor(Math.random() * stores.length)];

      const validatedTask = insertTaskSchema.parse({
        userId,
        taskType: "grocery",
        action: "order_groceries",
        prompt: `Order ${items.map((i: any) => i.name).join(", ")}`,
        status: "pending",
        scheduleType: scheduleType || "one_time",
        metadata: JSON.stringify({ items, store, totalAmount }),
      });

      const task = await storage.createTask(validatedTask);
      
      res.json({
        taskId: task.id,
        category: "grocery",
        items,
        store,
        total: totalAmount,
        eta: "30 mins",
        message: `Grocery order created at ${store}`,
      });
    } catch (error: any) {
      console.error("Grocery order error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Food order endpoint
  app.post("/api/food/order", async (req, res) => {
    try {
      const { userId, items, scheduleType } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      if (!items || items.length === 0) {
        return res.json({
          followUp: true,
          message: "Please list the food items you'd like to order.",
        });
      }

      const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
      const restaurants = ["Zomato", "Swiggy", "Uber Eats", "Domino's", "McDonald's"];
      const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

      const validatedTask = insertTaskSchema.parse({
        userId,
        taskType: "food",
        action: "order_food",
        prompt: `Order ${items.map((i: any) => i.name).join(", ")}`,
        status: "pending",
        scheduleType: scheduleType || "one_time",
        metadata: JSON.stringify({ items, restaurant, totalAmount }),
      });

      const task = await storage.createTask(validatedTask);
      
      res.json({
        taskId: task.id,
        category: "food",
        items,
        restaurant,
        total: totalAmount,
        eta: "25 mins",
        message: `Food order created from ${restaurant}`,
      });
    } catch (error: any) {
      console.error("Food order error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Medicine order endpoint
  app.post("/api/medicine/order", async (req, res) => {
    try {
      const { userId, items, scheduleType } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      if (!items || items.length === 0) {
        return res.json({
          followUp: true,
          message: "Please list the medicines you'd like to order.",
        });
      }

      const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
      const pharmacies = ["Apollo Pharmacy", "PharmEasy", "Medlife", "1mg", "Netmeds"];
      const pharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];

      const validatedTask = insertTaskSchema.parse({
        userId,
        taskType: "medicine",
        action: "order_medicine",
        prompt: `Order ${items.map((i: any) => i.name).join(", ")}`,
        status: "pending",
        scheduleType: scheduleType || "one_time",
        metadata: JSON.stringify({ items, pharmacy, totalAmount }),
      });

      const task = await storage.createTask(validatedTask);
      
      res.json({
        taskId: task.id,
        category: "medicine",
        items,
        pharmacy,
        total: totalAmount,
        eta: "30 mins",
        message: `Medicine order created at ${pharmacy}`,
      });
    } catch (error: any) {
      console.error("Medicine order error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generic order creation endpoint with internal routing
  app.post("/api/order/create", async (req, res) => {
    try {
      const { category, userId, items, scheduleType } = req.body;
      
      if (!category || !userId) {
        return res.status(400).json({ error: "category and userId are required" });
      }

      if (!items || items.length === 0) {
        return res.json({
          followUp: true,
          message: "Please list the items you'd like to order.",
          category,
        });
      }

      // Route internally based on category
      let taskType, stores, store, totalAmount, eta, responseKey;
      
      switch (category) {
        case "grocery":
          taskType = "grocery";
          stores = ["BigBasket", "Dunzo", "Blinkit", "Zepto", "Swiggy Instamart"];
          store = stores[Math.floor(Math.random() * stores.length)];
          totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
          eta = "30 mins";
          responseKey = "store";
          break;
          
        case "food":
          taskType = "food";
          stores = ["Zomato", "Swiggy", "Uber Eats", "Domino's", "McDonald's"];
          store = stores[Math.floor(Math.random() * stores.length)];
          totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
          eta = "25 mins";
          responseKey = "restaurant";
          break;
          
        case "medicine":
          taskType = "medicine";
          stores = ["Apollo Pharmacy", "PharmEasy", "Medlife", "1mg", "Netmeds"];
          store = stores[Math.floor(Math.random() * stores.length)];
          totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
          eta = "30 mins";
          responseKey = "pharmacy";
          break;
          
        default:
          return res.status(400).json({ error: "Invalid category. Must be grocery, food, or medicine." });
      }

      const validatedTask = insertTaskSchema.parse({
        userId,
        taskType,
        action: `order_${category}`,
        prompt: `Order ${items.map((i: any) => i.name).join(", ")}`,
        status: "pending",
        scheduleType: scheduleType || "one_time",
        metadata: JSON.stringify({ items, [responseKey]: store, totalAmount }),
      });

      const task = await storage.createTask(validatedTask);
      
      res.json({
        taskId: task.id,
        category,
        items,
        [responseKey]: store,
        total: totalAmount,
        eta,
        message: `${category.charAt(0).toUpperCase() + category.slice(1)} order created at ${store}`,
      });
    } catch (error: any) {
      console.error("Order creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Payment routes for mock transaction flow
  
  // Initiate a payment
  app.post("/api/payments/initiate", async (req, res) => {
    try {
      const { userId, taskId, amount } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: "userId and amount are required" });
      }

      const payment = await storage.createPayment({
        userId,
        taskId,
        amount,
        currency: "INR",
        status: "pending",
        paymentMethod: "card",
        cardLast4: "4242",
        threeDSecureRequired: true,
      });

      io.emit('paymentUpdate', {
        paymentId: payment.id,
        taskId: payment.taskId,
        status: "pending",
        message: "Payment initiated",
        amount: payment.amount,
        timestamp: new Date().toISOString(),
      });

      res.json({
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        threeDSecureRequired: payment.threeDSecureRequired,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Confirm payment (simulate 3D Secure)
  app.post("/api/payments/confirm", async (req, res) => {
    try {
      const { paymentId } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({ error: "paymentId is required" });
      }

      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      await storage.updatePayment(paymentId, { status: "processing" });

      io.emit('paymentUpdate', {
        paymentId: payment.id,
        taskId: payment.taskId,
        status: "processing",
        message: "Processing 3D Secure verification...",
        amount: payment.amount,
        timestamp: new Date().toISOString(),
      });

      setTimeout(async () => {
        const success = Math.random() > 0.1;
        const newStatus = success ? "success" : "failed";
        const transactionId = success ? `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase() : undefined;

        await storage.updatePayment(paymentId, {
          status: newStatus,
          transactionId,
        });

        io.emit('paymentUpdate', {
          paymentId: payment.id,
          taskId: payment.taskId,
          status: newStatus,
          message: success ? "Payment successful!" : "Payment failed. Please try again.",
          amount: payment.amount,
          timestamp: new Date().toISOString(),
        });
      }, 2000 + Math.random() * 1000);

      res.json({ message: "Payment confirmation in progress" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel payment
  app.post("/api/payments/cancel", async (req, res) => {
    try {
      const { paymentId } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({ error: "paymentId is required" });
      }

      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      await storage.updatePayment(paymentId, { status: "cancelled" });

      io.emit('paymentUpdate', {
        paymentId: payment.id,
        taskId: payment.taskId,
        status: "cancelled",
        message: "Payment cancelled by user",
        amount: payment.amount,
        timestamp: new Date().toISOString(),
      });

      res.json({ message: "Payment cancelled successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

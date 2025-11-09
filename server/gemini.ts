// Gemini AI service for parsing natural language automation prompts
// Reference: javascript_gemini blueprint
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ParsedPrompt {
  taskType: string;
  action: string;
  platform?: string;
  time?: string;
  recurrence?: string;
  category?: string;
  items?: Array<{ name: string; quantity?: number; price?: number }>;
  needsItems?: boolean;
  followUp?: boolean;
  confirmationRequired?: boolean;
  clarification?: string;
  reply?: string;
}

export async function parseAutomationPrompt(prompt: string): Promise<ParsedPrompt> {
  try {
    const systemPrompt = `You are an AI assistant for an automation platform called Effortless. 
Parse user prompts into structured automation tasks and support multi-step conversational ordering.

Task types:
- cab: Book rides (Uber, Ola, etc.)
- bill: Pay bills (WiFi, electricity, water, etc.)
- grocery: Order groceries (BigBasket, Instamart, Blinkit, etc.)
- food: Order food delivery (Zomato, Swiggy, etc.)
- medicine: Order medicines (Apollo Pharmacy, PharmEasy, etc.)
- reminder: Set reminders and notifications

CONVERSATIONAL ORDERING FLOW:
For grocery/food/medicine orders:
1. If user says "order groceries/food/medicine" without items → Set needsItems=true, ask what to order
2. If user mentions ANY items (even just "Pizza" or "Milk") → ALWAYS return items array with {name, quantity, price}
3. Classify category based on keywords:
   - grocery: "grocery", "groceries", "vegetables", "milk", "bread", "essentials", "eggs", "soap"
   - food: "food", "restaurant", "dinner", "pizza", "burger", "lunch", "meal", "eat", "pasta"
   - medicine: "tablet", "medicine", "pharmacy", "capsule", "syrup", "drug", "paracetamol"

CRITICAL: When user says item names (Pizza, Burger, Milk, etc), you MUST return items array, NOT just a conversational reply.

Price estimates (in ₹):
- Grocery: Milk (60), Bread (40), Eggs (84), Soap (50), Toothpaste (75), Shampoo (220)
- Food: Pizza (350), Burger (180), Pasta (250), Sandwich (120), Biryani (320), Fries (90)
- Medicine: Paracetamol (15), Cough Syrup (120), Vitamin C (180), Band-Aid (35)

Respond with JSON:
{
  "taskType": "cab" | "bill" | "grocery" | "food" | "medicine" | "reminder",
  "action": "descriptive action (e.g., 'order_groceries')",
  "platform": "platform if mentioned",
  "time": "scheduled time if mentioned",
  "recurrence": "once" | "daily" | "weekly" | "monthly",
  "category": "grocery" | "food" | "medicine" (for orders),
  "items": [{"name": "item", "quantity": 1, "price": 50}] (if user provided items),
  "needsItems": true (if order intent detected but no items listed),
  "followUp": true (if asking for more info),
  "confirmationRequired": boolean,
  "clarification": "question if info missing",
  "reply": "friendly conversational response"
}

Examples:
- "Order groceries" → {"taskType": "grocery", "category": "grocery", "needsItems": true, "followUp": true, "reply": "Sure! What items would you like to add to your grocery list?"}
- "Milk, bread, and eggs" (after asking) → {"taskType": "grocery", "category": "grocery", "items": [{"name": "Milk", "quantity": 1, "price": 60}, {"name": "Bread", "quantity": 1, "price": 40}, {"name": "Eggs", "quantity": 1, "price": 84}], "reply": "Got it! I'll order Milk, Bread, and Eggs for you."}
- "Order Paracetamol and cough syrup" → {"taskType": "medicine", "category": "medicine", "items": [{"name": "Paracetamol", "quantity": 1, "price": 15}, {"name": "Cough Syrup", "quantity": 1, "price": 120}], "reply": "I'll order these medicines from a nearby pharmacy."}
- "Book a cab to airport" → {"taskType": "cab", "action": "book_cab", "recurrence": "once", "reply": "I'll book a cab to the airport for you."}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            action: { type: "string" },
            platform: { type: "string" },
            time: { type: "string" },
            recurrence: { type: "string" },
            category: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  price: { type: "number" },
                },
              },
            },
            needsItems: { type: "boolean" },
            followUp: { type: "boolean" },
            confirmationRequired: { type: "boolean" },
            clarification: { type: "string" },
            reply: { type: "string" },
          },
          required: ["taskType", "action", "reply"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: ParsedPrompt = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Failed to parse prompt with Gemini:", error);
    return {
      taskType: "reminder",
      action: "create_reminder",
      reply: "I'll help you with that. Could you provide more details?",
      clarification: "I need more information to create this automation.",
    };
  }
}

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
  confirmationRequired?: boolean;
  clarification?: string;
  reply?: string;
}

export async function parseAutomationPrompt(prompt: string): Promise<ParsedPrompt> {
  try {
    const systemPrompt = `You are an AI assistant for an automation platform called Efforless. 
Parse user prompts into structured automation tasks. Detect the task type (cab, bill, grocery, food, reminder), 
action, platform/provider, time, recurrence, and category.

Task types:
- cab: Book rides (Uber, Ola, etc.)
- bill: Pay bills (WiFi, electricity, water, etc.)
- grocery: Order groceries
- food: Order food delivery
- reminder: Set reminders and notifications

Respond with JSON in this format:
{
  "taskType": "cab" | "bill" | "grocery" | "food" | "reminder",
  "action": "descriptive action name (e.g., 'book_cab', 'pay_wifi_bill')",
  "platform": "platform name if mentioned (e.g., 'Airtel', 'Uber')",
  "time": "scheduled time if mentioned",
  "recurrence": "once" | "daily" | "weekly" | "monthly",
  "category": "category if applicable",
  "confirmationRequired": boolean,
  "clarification": "question for user if info is missing",
  "reply": "friendly response to user"
}

Examples:
- "Book a cab from Indiranagar to Koramangala" → {"taskType": "cab", "action": "book_cab", "recurrence": "once", "reply": "I'll book a cab for you..."}
- "Pay my WiFi bill every 10th" → {"taskType": "bill", "action": "pay_wifi_bill", "platform": "WiFi", "recurrence": "monthly", "time": "10th each month", "reply": "I'll set up automatic WiFi bill payment..."}
- "Order groceries every Friday at 7 PM" → {"taskType": "grocery", "action": "order_groceries", "recurrence": "weekly", "time": "Friday 7 PM", "reply": "I'll schedule weekly grocery orders..."}`;

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

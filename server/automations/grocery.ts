// Mock grocery order automation with realistic delivery tracking
import type { GroceryOrder } from "@shared/schema";

const stores = ["BigBasket", "Dunzo", "Blinkit", "Zepto", "Swiggy Instamart"];
const groceryItems = [
  { name: "Milk", price: 60 },
  { name: "Bread", price: 40 },
  { name: "Eggs (12)", price: 84 },
  { name: "Rice (5kg)", price: 350 },
  { name: "Tomatoes (1kg)", price: 50 },
  { name: "Onions (1kg)", price: 40 },
  { name: "Potatoes (1kg)", price: 30 },
  { name: "Apples (1kg)", price: 180 },
  { name: "Bananas (6)", price: 36 },
  { name: "Yogurt", price: 50 },
];

function generateRandomCart() {
  const numItems = 4 + Math.floor(Math.random() * 5);
  const shuffled = [...groceryItems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numItems).map((item) => ({
    ...item,
    quantity: 1 + Math.floor(Math.random() * 2),
  }));
}

export async function executeGroceryOrder(taskId: string, broadcast: (data: any) => void) {
  const store = stores[Math.floor(Math.random() * stores.length)];
  const items = generateRandomCart();
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order: GroceryOrder = {
    taskId,
    storeName: store,
    items,
    totalAmount,
    status: "confirmed",
  };

  // Phase 1: Confirmed
  broadcast({
    taskId,
    status: "active",
    message: `Order confirmed at ${store}! ${items.length} items for ₹${totalAmount}`,
    progress: 25,
    metadata: order,
    timestamp: new Date().toISOString(),
  });

  await delay(3000);

  // Phase 2: Packed
  order.status = "packed";
  broadcast({
    taskId,
    status: "active",
    message: "Your order is packed and ready for delivery",
    progress: 50,
    metadata: order,
    timestamp: new Date().toISOString(),
  });

  await delay(3000);

  // Phase 3: Out for delivery
  order.status = "out_for_delivery";
  broadcast({
    taskId,
    status: "active",
    message: "Your order is out for delivery (2 stops away)",
    progress: 75,
    metadata: order,
    timestamp: new Date().toISOString(),
  });

  await delay(4000);

  // Phase 4: Delivered
  order.status = "delivered";
  order.deliveryTime = new Date().toLocaleTimeString();
  broadcast({
    taskId,
    status: "completed",
    message: `Order delivered from ${store}! Total: ₹${totalAmount}`,
    progress: 100,
    metadata: order,
    timestamp: new Date().toISOString(),
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

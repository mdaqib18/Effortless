// Mock food delivery automation
import type { FoodOrder } from "@shared/schema";

const restaurants = ["Biryani House", "Pizza Paradise", "Burger Junction", "Chinese Dragon", "South Spice"];
const menuItems = [
  { name: "Chicken Biryani", price: 280 },
  { name: "Margherita Pizza", price: 350 },
  { name: "Veg Burger Combo", price: 180 },
  { name: "Hakka Noodles", price: 220 },
  { name: "Masala Dosa", price: 120 },
];

function generateRandomOrder() {
  const numItems = 1 + Math.floor(Math.random() * 3);
  const shuffled = [...menuItems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numItems).map((item) => ({
    ...item,
    quantity: 1,
  }));
}

export async function executeFoodOrder(taskId: string, broadcast: (data: any) => void) {
  const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
  const items = generateRandomOrder();
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order: FoodOrder = {
    taskId,
    restaurantName: restaurant,
    items,
    totalAmount,
    status: "confirmed",
    estimatedTime: 30 + Math.floor(Math.random() * 20),
  };

  // Phase 1: Confirmed
  broadcast({
    taskId,
    status: "active",
    message: `Order placed at ${restaurant}! Estimated time: ${order.estimatedTime} mins`,
    progress: 20,
    metadata: order,
    timestamp: new Date().toISOString(),
  });

  await delay(2000);

  // Phase 2: Preparing
  order.status = "preparing";
  broadcast({
    taskId,
    status: "active",
    message: "Restaurant is preparing your food...",
    progress: 40,
    metadata: order,
    timestamp: new Date().toISOString(),
  });

  await delay(3000);

  // Phase 3: Rider assigned
  order.status = "rider_assigned";
  broadcast({
    taskId,
    status: "active",
    message: "Rider assigned! Picking up your order",
    progress: 60,
    metadata: order,
    timestamp: new Date().toISOString(),
  });

  await delay(3000);

  // Phase 4: On the way
  order.status = "on_the_way";
  broadcast({
    taskId,
    status: "active",
    message: "Your food is on the way!",
    progress: 80,
    metadata: order,
    timestamp: new Date().toISOString(),
  });

  await delay(4000);

  // Phase 5: Delivered
  order.status = "delivered";
  broadcast({
    taskId,
    status: "completed",
    message: `Order delivered from ${restaurant}! Enjoy your meal 🍽️`,
    progress: 100,
    metadata: order,
    timestamp: new Date().toISOString(),
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

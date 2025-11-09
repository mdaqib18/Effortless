// Mock medicine order automation with realistic pharmacy delivery tracking
import type { MedicineOrder } from "@shared/schema";

const pharmacies = ["Apollo Pharmacy", "PharmEasy", "Medlife", "1mg", "Netmeds"];
const medicineItems = [
  { name: "Paracetamol 500mg", price: 15 },
  { name: "Cough Syrup", price: 120 },
  { name: "Vitamin D3", price: 280 },
  { name: "Aspirin", price: 25 },
  { name: "Antacid", price: 45 },
  { name: "Crocin Advance", price: 18 },
  { name: "Dolo 650", price: 12 },
  { name: "Cetirizine", price: 8 },
  { name: "Thermometer", price: 180 },
  { name: "Hand Sanitizer", price: 85 },
];

function generateRandomMedicines() {
  const numItems = 2 + Math.floor(Math.random() * 3);
  const shuffled = [...medicineItems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numItems).map((item) => ({
    ...item,
    quantity: 1 + Math.floor(Math.random() * 2),
  }));
}

export async function executeMedicineOrder(taskId: string, broadcast: (data: any) => void) {
  const pharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];
  const items = generateRandomMedicines();
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order: MedicineOrder = {
    taskId,
    pharmacyName: pharmacy,
    items,
    totalAmount,
    status: "confirmed",
    prescriptionRequired: Math.random() > 0.7,
  };

  // Phase 1: Confirmed
  broadcast({
    taskId,
    status: "active",
    message: `Medicine order confirmed at ${pharmacy}! ${items.length} items for ₹${totalAmount}`,
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
    message: "Your medicines are packed and verified",
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
    message: "Delivery partner on the way (arrives in 20 mins)",
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
    message: `Medicines delivered from ${pharmacy}! Total: ₹${totalAmount}`,
    progress: 100,
    metadata: order,
    timestamp: new Date().toISOString(),
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

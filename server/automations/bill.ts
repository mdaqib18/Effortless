// Mock bill payment automation with realistic processing
import type { BillPayment } from "@shared/schema";

const providers = ["Airtel", "BESCOM", "Jio Fiber", "ACT Fibernet", "BWSSB"];

export async function executeBillPayment(taskId: string, platform: string | undefined, broadcast: (data: any) => void) {
  const provider = platform || providers[Math.floor(Math.random() * providers.length)];
  const amount = 500 + Math.floor(Math.random() * 1500);
  const success = Math.random() > 0.1; // 90% success rate

  const payment: BillPayment = {
    taskId,
    provider,
    amount,
    billType: "utility",
    status: "pending",
  };

  // Phase 1: Pending
  broadcast({
    taskId,
    status: "active",
    message: `Processing ${provider} bill payment of ₹${amount}...`,
    progress: 20,
    metadata: payment,
    timestamp: new Date().toISOString(),
  });

  await delay(2000);

  // Phase 2: Processing
  payment.status = "processing";
  broadcast({
    taskId,
    status: "active",
    message: "Verifying payment details...",
    progress: 50,
    metadata: payment,
    timestamp: new Date().toISOString(),
  });

  await delay(3000);

  // Phase 3: Success or Failed
  if (success) {
    payment.status = "success";
    payment.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    broadcast({
      taskId,
      status: "completed",
      message: `Payment successful! ₹${amount} paid to ${provider}`,
      progress: 100,
      metadata: payment,
      timestamp: new Date().toISOString(),
    });
  } else {
    payment.status = "failed";
    broadcast({
      taskId,
      status: "failed",
      message: "Payment failed. Please try again.",
      progress: 100,
      metadata: payment,
      timestamp: new Date().toISOString(),
    });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

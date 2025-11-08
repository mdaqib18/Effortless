// Mock cab booking automation with realistic lifecycle and live updates
import type { CabBooking } from "@shared/schema";
import type { WebSocket } from "ws";

const drivers = [
  { name: "Rahul Kumar", photo: "https://i.pravatar.cc/150?img=12", car: "Swift Dzire", rating: 4.8 },
  { name: "Priya Sharma", photo: "https://i.pravatar.cc/150?img=5", car: "Honda City", rating: 4.9 },
  { name: "Amit Singh", photo: "https://i.pravatar.cc/150?img=13", car: "Toyota Etios", rating: 4.7 },
  { name: "Sneha Patel", photo: "https://i.pravatar.cc/150?img=9", car: "Hyundai Verna", rating: 4.6 },
];

function getRandomDriver() {
  return drivers[Math.floor(Math.random() * drivers.length)];
}

export async function executeCabBooking(taskId: string, broadcast: (data: any) => void) {
  const driver = getRandomDriver();
  const eta = 5 + Math.floor(Math.random() * 10);
  const distance = 5 + Math.random() * 15;
  const fare = 80 + Math.floor(Math.random() * 200);

  const booking: CabBooking = {
    taskId,
    driverName: driver.name,
    driverPhoto: driver.photo,
    carModel: driver.car,
    carNumber: `KA-${Math.floor(10 + Math.random() * 90)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(1000 + Math.random() * 9000)}`,
    rating: driver.rating,
    eta,
    distance: Math.round(distance * 10) / 10,
    fare,
    status: "requesting",
  };

  // Phase 1: Requesting
  broadcast({
    taskId,
    status: "active",
    message: "Searching for nearby drivers...",
    progress: 10,
    metadata: booking,
    timestamp: new Date().toISOString(),
  });

  await delay(2000);

  // Phase 2: Driver found
  booking.status = "driver_found";
  broadcast({
    taskId,
    status: "active",
    message: `Driver ${driver.name} found! ${driver.car} arriving in ${eta} mins`,
    progress: 30,
    metadata: { ...booking, eta },
    timestamp: new Date().toISOString(),
  });

  await delay(3000);

  // Phase 3: Driver en route
  booking.status = "driver_enroute";
  let currentEta = eta;
  for (let i = 0; i < 3; i++) {
    currentEta = Math.max(1, currentEta - 2);
    broadcast({
      taskId,
      status: "active",
      message: `Driver is ${currentEta} mins away`,
      progress: 30 + (i + 1) * 15,
      metadata: { ...booking, eta: currentEta },
      timestamp: new Date().toISOString(),
    });
    await delay(2000);
  }

  // Phase 4: Ride started
  booking.status = "ride_started";
  broadcast({
    taskId,
    status: "active",
    message: "Ride started! En route to destination",
    progress: 80,
    metadata: booking,
    timestamp: new Date().toISOString(),
  });

  await delay(4000);

  // Phase 5: Completed
  booking.status = "completed";
  broadcast({
    taskId,
    status: "completed",
    message: `Ride completed! Paid ₹${fare} to ${driver.name}`,
    progress: 100,
    metadata: booking,
    timestamp: new Date().toISOString(),
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

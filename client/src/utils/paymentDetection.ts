export function requiresPayment(prompt: string, taskType?: string): boolean {
  if (taskType === "reminder") {
    return false;
  }

  const taskTypeMatch = taskType ? ["bill", "cab", "grocery", "food"].includes(taskType) : false;
  
  return taskTypeMatch;
}

export function extractAmount(prompt: string, taskType?: string): number {
  const rupeeMatch = prompt.match(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (rupeeMatch) {
    return parseFloat(rupeeMatch[1].replace(/,/g, ''));
  }
  
  const numberMatch = prompt.match(/\b(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs\.?|inr)\b/i);
  if (numberMatch) {
    return parseFloat(numberMatch[1].replace(/,/g, ''));
  }
  
  const taskTypeAmounts: Record<string, number> = {
    cab: 250 + Math.floor(Math.random() * 400),
    bill: 500 + Math.floor(Math.random() * 2000),
    grocery: 800 + Math.floor(Math.random() * 1500),
    food: 300 + Math.floor(Math.random() * 500),
  };
  
  if (taskType && taskType in taskTypeAmounts) {
    return taskTypeAmounts[taskType];
  }
  
  return 650;
}

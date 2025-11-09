import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingCart, Pizza, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  name: string;
  price: number;
  icon?: string;
}

interface ItemSelectionChipsProps {
  category: "grocery" | "food" | "medicine";
  onConfirm: (items: Array<{ name: string; quantity: number; price: number }>) => void;
  onCancel?: () => void;
}

const CATEGORY_ITEMS: Record<"grocery" | "food" | "medicine", Item[]> = {
  grocery: [
    { name: "Milk", price: 60 },
    { name: "Bread", price: 40 },
    { name: "Eggs", price: 84 },
    { name: "Rice", price: 180 },
    { name: "Sugar", price: 50 },
    { name: "Oil", price: 220 },
    { name: "Soap", price: 35 },
    { name: "Vegetables", price: 120 },
  ],
  food: [
    { name: "Pizza", price: 350 },
    { name: "Burger", price: 180 },
    { name: "Pasta", price: 280 },
    { name: "Biryani", price: 320 },
    { name: "Sandwich", price: 120 },
    { name: "Salad", price: 150 },
    { name: "Fries", price: 90 },
    { name: "Ice Cream", price: 110 },
  ],
  medicine: [
    { name: "Paracetamol", price: 15 },
    { name: "Cough Syrup", price: 120 },
    { name: "Vitamin C", price: 180 },
    { name: "Band-Aid", price: 40 },
    { name: "Antiseptic", price: 85 },
    { name: "Pain Balm", price: 95 },
    { name: "Hand Sanitizer", price: 60 },
    { name: "Thermometer", price: 250 },
  ],
};

const CATEGORY_CONFIG = {
  grocery: {
    icon: ShoppingCart,
    title: "Select Grocery Items",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  food: {
    icon: Pizza,
    title: "Select Food Items",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  medicine: {
    icon: Pill,
    title: "Select Medicines",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
};

export function ItemSelectionChips({ category, onConfirm, onCancel }: ItemSelectionChipsProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const items = CATEGORY_ITEMS[category];
  const config = CATEGORY_CONFIG[category];
  const CategoryIcon = config.icon;

  const toggleItem = (itemName: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selectedItemsArray = items
      .filter((item) => selectedItems.has(item.name))
      .map((item) => ({
        name: item.name,
        quantity: 1,
        price: item.price,
      }));
    onConfirm(selectedItemsArray);
    setSelectedItems(new Set());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full"
      data-testid={`item-selection-${category}`}
    >
      <div className={cn("rounded-2xl border border-card-border bg-card p-4 shadow-lg", config.bgColor)}>
        <div className="flex items-center gap-2 mb-3">
          <CategoryIcon className={cn("h-5 w-5", config.color)} />
          <h3 className="text-sm font-semibold text-foreground">{config.title}</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <AnimatePresence>
            {items.map((item, index) => {
              const isSelected = selectedItems.has(item.name);
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    delay: index * 0.03,
                  }}
                  data-testid={`chip-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-3 py-1.5 text-xs font-medium transition-all hover-elevate active-elevate-2",
                      isSelected && "ring-2 ring-primary/30"
                    )}
                    onClick={() => toggleItem(item.name)}
                  >
                    <span className="flex items-center gap-1.5">
                      {isSelected && <Check className="h-3 w-3" data-testid={`check-${item.name.toLowerCase().replace(/\s+/g, '-')}`} />}
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">₹{item.price}</span>
                    </span>
                  </Badge>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              data-testid="button-cancel-selection"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            disabled={selectedItems.size === 0}
            data-testid="button-confirm-selection"
          >
            Add {selectedItems.size > 0 && `(${selectedItems.size})`}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

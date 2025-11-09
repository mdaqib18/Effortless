import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Pizza, Pill, Clock, Store, CheckCircle2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryCardProps {
  category: "grocery" | "food" | "medicine";
  items: OrderItem[];
  total: number;
  onConfirm: () => void;
  onAddMore?: () => void;
  onCancel?: () => void;
}

const CATEGORY_CONFIG = {
  grocery: {
    icon: ShoppingCart,
    title: "Grocery Order",
    color: "text-green-500",
    bgGradient: "from-green-500/10 to-transparent",
    stores: ["BigBasket", "Instamart", "Blinkit", "Zepto"],
    eta: "30-45 mins",
  },
  food: {
    icon: Pizza,
    title: "Food Order",
    color: "text-orange-500",
    bgGradient: "from-orange-500/10 to-transparent",
    stores: ["Zomato", "Swiggy", "Uber Eats"],
    eta: "25-35 mins",
  },
  medicine: {
    icon: Pill,
    title: "Medicine Order",
    color: "text-blue-500",
    bgGradient: "from-blue-500/10 to-transparent",
    stores: ["Apollo Pharmacy", "PharmEasy", "Medlife", "1mg"],
    eta: "45-60 mins",
  },
};

export function OrderSummaryCard({
  category,
  items,
  total,
  onConfirm,
  onAddMore,
  onCancel,
}: OrderSummaryCardProps) {
  const config = CATEGORY_CONFIG[category];
  const CategoryIcon = config.icon;
  const randomStore = config.stores[Math.floor(Math.random() * config.stores.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full"
      data-testid={`order-summary-${category}`}
    >
      <Card className={cn(
        "border-card-border bg-gradient-to-br backdrop-blur-md shadow-xl overflow-hidden",
        config.bgGradient
      )}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CategoryIcon className={cn("h-5 w-5", config.color)} />
              <h3 className="text-base font-semibold text-foreground">{config.title}</h3>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            >
              <CheckCircle2 className="h-5 w-5 text-green-500" data-testid="icon-order-ready" />
            </motion.div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Store className="h-3.5 w-3.5" />
            <span data-testid="text-store-name">{randomStore}</span>
            <span className="mx-1">•</span>
            <Clock className="h-3.5 w-3.5" />
            <span data-testid="text-eta">{config.eta}</span>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Order Items</h4>
            <div className="space-y-1.5" data-testid="list-order-items">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center justify-between text-sm"
                  data-testid={`item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-foreground">
                      {item.name}
                      {item.quantity > 1 && (
                        <span className="text-muted-foreground"> x{item.quantity}</span>
                      )}
                    </span>
                  </div>
                  <span className="font-medium text-foreground" data-testid={`price-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
              className="text-lg font-bold text-primary"
              data-testid="text-total-amount"
            >
              ₹{total.toLocaleString('en-IN')}
            </motion.span>
          </div>

          <div className="flex gap-2 pt-2">
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="flex-1"
                data-testid="button-cancel-order"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
            {onAddMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMore}
                className="flex-1"
                data-testid="button-add-more"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add More
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={onConfirm}
              className="flex-1"
              data-testid="button-confirm-order"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Confirm Order
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

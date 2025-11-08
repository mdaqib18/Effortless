import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, X, Plus, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  onPayNow: () => void;
  onCancel: () => void;
  taskDescription?: string;
}

export function PaymentModal({
  isOpen,
  amount,
  onPayNow,
  onCancel,
  taskDescription,
}: PaymentModalProps) {
  const [selectedCard, setSelectedCard] = useState<string>("visa-4242");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent 
        className="sm:max-w-md overflow-hidden p-0 border-none bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl"
        data-testid="dialog-payment"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Complete Payment
            </DialogTitle>
            {taskDescription && (
              <p className="text-sm text-slate-400 mt-2" data-testid="text-task-description">
                {taskDescription}
              </p>
            )}
          </DialogHeader>

          <div className="p-6 pt-0 space-y-6">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-2">Amount to pay</div>
              <div className="text-4xl font-bold text-white" data-testid="text-amount">
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-300 mb-3">
                Select Payment Method
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all border-2 hover-elevate active-elevate-2 ${
                    selectedCard === "visa-4242"
                      ? "border-primary bg-primary/10"
                      : "border-slate-700/50 bg-slate-800/30"
                  }`}
                  onClick={() => setSelectedCard("visa-4242")}
                  data-testid="card-payment-method-visa"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          Visa
                          <span className="text-slate-400">****</span>
                          <span className="text-white">4242</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Expires 12/25
                        </div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedCard === "visa-4242"
                        ? "border-primary bg-primary"
                        : "border-slate-600"
                    }`}>
                      {selectedCard === "visa-4242" && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="p-4 cursor-pointer border-2 border-dashed border-slate-700/50 bg-slate-800/20 hover-elevate active-elevate-2"
                  data-testid="button-add-payment-method"
                >
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-12 h-8 bg-slate-700/50 rounded flex items-center justify-center">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div className="font-medium">Add New Payment Method</div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                data-testid="button-cancel-payment"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={onPayNow}
                className="flex-1 bg-primary hover:bg-primary/90"
                data-testid="button-pay-now"
              >
                Pay ₹{amount.toLocaleString('en-IN')} ✓
              </Button>
            </div>

            <div className="text-xs text-center text-slate-500 pt-2 flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" />
              Secured by 256-bit encryption
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

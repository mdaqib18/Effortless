import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, XCircle, Loader2, X } from "lucide-react";

interface ThreeDSecureModalProps {
  isOpen: boolean;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
  status: "confirming" | "processing" | "success" | "failed" | null;
}

export function ThreeDSecureModal({
  isOpen,
  amount,
  onConfirm,
  onCancel,
  status,
}: ThreeDSecureModalProps) {
  const [dots, setDots] = useState("...");

  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? "." : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent 
        className="sm:max-w-md overflow-hidden p-0 border-none bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl"
        data-testid="dialog-3ds"
      >
        <AnimatePresence mode="wait">
          {status === "confirming" && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="p-6 pb-4">
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Secure Payment Verification
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 pt-0 space-y-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-primary/20 rounded-xl p-6 border border-blue-500/30">
                  <div className="text-center space-y-2">
                    <div className="text-sm text-blue-200">Confirm Payment of</div>
                    <div className="text-4xl font-bold text-white" data-testid="text-3ds-amount">
                      ₹{amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-blue-200 pt-2">
                      Your card issuer requires additional verification
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      This is a secure 3D Secure authentication to verify your identity and protect against unauthorized transactions.
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    data-testid="button-3ds-cancel"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={onConfirm}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    data-testid="button-3ds-confirm"
                  >
                    Confirm ✓
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Loader2 className="h-16 w-16 text-primary" />
                </motion.div>

                <div className="space-y-2">
                  <div className="text-xl font-semibold text-white" data-testid="text-processing">
                    Processing Payment{dots}
                  </div>
                  <div className="text-sm text-slate-400">
                    Please wait while we verify your payment
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="p-12"
            >
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white" data-testid="text-payment-success">
                    Payment Successful!
                  </div>
                  <div className="text-sm text-slate-400">
                    Your payment of ₹{amount.toLocaleString('en-IN')} was processed successfully
                  </div>
                </div>

                <div className="text-xs text-green-400 bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  ✓ Task will be activated shortly
                </div>
              </div>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="p-12"
            >
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full">
                    <XCircle className="h-12 w-12 text-red-400" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white" data-testid="text-payment-failed">
                    Payment Failed
                  </div>
                  <div className="text-sm text-slate-400">
                    We couldn't process your payment. Please try again.
                  </div>
                </div>

                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="w-full"
                  data-testid="button-close-failed"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

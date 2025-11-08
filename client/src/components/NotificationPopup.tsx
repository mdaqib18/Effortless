import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, X, Pause } from "lucide-react";
import type { Reminder } from "@shared/schema";

interface NotificationPopupProps {
  reminder: Reminder | null;
  onProceed: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export function NotificationPopup({ reminder, onProceed, onSnooze, onDismiss }: NotificationPopupProps) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!reminder) return;

    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reminder, onDismiss]);

  return (
    <AnimatePresence>
      {reminder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl"
          data-testid="notification-popup"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg mx-4"
          >
            <div className="relative rounded-2xl border border-primary/30 bg-gradient-to-br from-card to-card/80 p-8 shadow-2xl backdrop-blur-lg">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
              
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 animate-pulse-glow">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground" data-testid="reminder-title">
                        Reminder
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Auto-dismiss in {countdown}s
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-lg text-foreground" data-testid="reminder-message">
                    {reminder.message}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Scheduled for {new Date(reminder.scheduledTime).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={onProceed}
                    className="flex-1"
                    size="lg"
                    data-testid="button-proceed"
                  >
                    Proceed ✅
                  </Button>
                  <Button
                    onClick={onSnooze}
                    variant="outline"
                    size="lg"
                    data-testid="button-snooze"
                  >
                    <Pause className="h-5 w-5" />
                    Snooze
                  </Button>
                  <Button
                    onClick={onDismiss}
                    variant="outline"
                    size="lg"
                    data-testid="button-dismiss"
                  >
                    <X className="h-5 w-5" />
                    Dismiss
                  </Button>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

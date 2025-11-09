import { motion } from "framer-motion";
import { Sparkles, Zap, Calendar, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motionPresets } from "@/lib/motionPresets";

interface OnboardingStateProps {
  onCreateTask: () => void;
}

export function OnboardingState({ onCreateTask }: OnboardingStateProps) {
  const features = [
    {
      icon: Zap,
      title: "Instant Automation",
      description: "Book cabs, pay bills, and manage tasks effortlessly",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Set up routines that run automatically",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      icon: ShoppingCart,
      title: "Quick Orders",
      description: "Order groceries, food, and medicine in seconds",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
  ];

  return (
    <motion.div
      variants={motionPresets.fadeInUp}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-emerald-500/20 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-500 glow-primary"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Sparkles className="h-12 w-12 text-white" />
        </motion.div>
      </motion.div>

      <motion.h3
        className="text-3xl font-bold text-foreground mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Welcome to Effortless
      </motion.h3>

      <motion.p
        className="text-muted-foreground text-center max-w-md mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Your AI-powered automation platform is ready. Start by creating your first task and experience the magic of effortless automation.
      </motion.p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="glass-card rounded-xl p-6 hover-elevate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} mb-4`}>
                <Icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 300, damping: 20 }}
      >
        <Button
          onClick={onCreateTask}
          size="lg"
          data-testid="button-create-first-onboarding"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Create Your First Task
        </Button>
      </motion.div>

      <motion.p
        className="text-xs text-muted-foreground mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Try: "Book a cab to the airport" or "Order groceries"
      </motion.p>
    </motion.div>
  );
}

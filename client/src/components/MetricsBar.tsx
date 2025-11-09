import { motion } from "framer-motion";
import { CheckCircle2, Clock, Repeat, Sparkles } from "lucide-react";
import { motionPresets } from "@/lib/motionPresets";

interface MetricsBarProps {
  userName?: string;
  activeCount: number;
  routineCount: number;
  completedCount: number;
}

export function MetricsBar({ userName, activeCount, routineCount, completedCount }: MetricsBarProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  const metrics = [
    {
      label: "Active",
      value: activeCount,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Routines",
      value: routineCount,
      icon: Repeat,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
  ];

  return (
    <motion.div
      variants={motionPresets.fadeInUp}
      initial="initial"
      animate="animate"
      className="glass-surface rounded-2xl p-6 mb-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 glow-primary-sm"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <motion.h3 
              className="text-lg font-semibold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Good {greeting}, {userName || "there"}
            </motion.h3>
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Your automation dashboard is ready
            </motion.p>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/30 border border-card-border/50 hover-elevate"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -2 }}
                data-testid={`metric-${metric.label.toLowerCase()}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

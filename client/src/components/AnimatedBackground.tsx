import { useMemo } from "react";
import { motion } from "framer-motion";
import { shouldReduceMotion } from "@/lib/motionPresets";

interface OrbConfig {
  className: string;
  animate: any;
  transition: any;
}

const ORB_CONFIGS: OrbConfig[] = [
  {
    className: "absolute top-0 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/20 blur-3xl",
    animate: {
      x: [0, 100, 0],
      y: [0, -100, 0],
      scale: [1, 1.2, 1],
    },
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  {
    className: "absolute top-1/3 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-3xl",
    animate: {
      x: [0, -150, 0],
      y: [0, 100, 0],
      scale: [1, 1.3, 1],
    },
    transition: {
      duration: 25,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  {
    className: "absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 blur-3xl",
    animate: {
      x: [0, -80, 0],
      y: [0, -120, 0],
      scale: [1, 1.1, 1],
    },
    transition: {
      duration: 18,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  {
    className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-3xl",
    animate: {
      rotate: [0, 360],
      scale: [1, 1.15, 1],
    },
    transition: {
      duration: 30,
      repeat: Infinity,
      ease: "linear",
    },
  },
];

export function AnimatedBackground() {
  const reduceMotion = useMemo(() => shouldReduceMotion(), []);

  const orbs = useMemo(() => {
    return ORB_CONFIGS.map((config, index) => ({
      ...config,
      key: `orb-${index}`,
      animate: reduceMotion ? {} : config.animate,
      transition: reduceMotion ? {} : config.transition,
    }));
  }, [reduceMotion]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1419]">
      {orbs.map((orb) => (
        <motion.div
          key={orb.key}
          className={orb.className}
          animate={orb.animate}
          transition={orb.transition}
        />
      ))}

      <div className="absolute inset-0 bg-[#0a0e27]/40 backdrop-blur-sm" />
    </div>
  );
}

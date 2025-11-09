import { Variants } from "framer-motion";
import confetti from "canvas-confetti";

export const motionPresets = {
  cardHover: {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      y: -4,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: { scale: 0.98 }
  } as Variants,

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  } as Variants,

  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,

  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    exit: { scale: 0.8, opacity: 0 }
  } as Variants,

  slideInRight: {
    initial: { x: "100%", opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { x: "100%", opacity: 0 }
  } as Variants,

  iconScale: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: { type: "spring", stiffness: 500, damping: 15 }
    },
    tap: { scale: 0.95 }
  } as Variants,

  glowPulse: {
    initial: { opacity: 0.5, scale: 1 },
    animate: { 
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } as Variants,

  tabIndicator: {
    initial: { scaleX: 0, opacity: 0 },
    animate: { 
      scaleX: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    },
    exit: { scaleX: 0, opacity: 0 }
  } as Variants,
};

export function triggerConfetti(options?: confetti.Options) {
  const defaults: confetti.Options = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#6366F1', '#10B981', '#3B82F6', '#8B5CF6'],
    disableForReducedMotion: true,
  };

  confetti({
    ...defaults,
    ...options,
  });
}

export function triggerSuccessConfetti() {
  triggerConfetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.7 },
  });
}

export function triggerTaskCreationConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  const colors = ['#6366F1', '#10B981', '#3B82F6'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(reducedMotionQuery).matches;
}

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
      data-testid="loading-spinner"
    />
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4" data-testid="loading-skeleton">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 bg-gradient-to-r from-card via-card/50 to-card rounded-2xl animate-shimmer"
          style={{
            backgroundSize: "200% 100%",
          }}
        />
      ))}
    </div>
  );
}

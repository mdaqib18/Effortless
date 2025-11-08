import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Edit2, Trash2, Car, CreditCard, ShoppingCart, UtensilsCrossed, Bell } from "lucide-react";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  progress?: number;
  onRun?: () => void;
  onPause?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  metadata?: any;
}

const taskIcons = {
  cab: Car,
  bill: CreditCard,
  grocery: ShoppingCart,
  food: UtensilsCrossed,
  reminder: Bell,
};

const statusColors = {
  pending: "bg-muted text-muted-foreground",
  active: "bg-primary text-primary-foreground",
  completed: "bg-success text-success-foreground",
  failed: "bg-destructive text-destructive-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export function TaskCard({ task, progress = 0, onRun, onPause, onEdit, onDelete, metadata }: TaskCardProps) {
  const Icon = taskIcons[task.taskType as keyof typeof taskIcons] || Bell;
  const isActive = task.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      data-testid={`task-card-${task.id}`}
    >
      <Card className="relative overflow-hidden border-card-border bg-gradient-to-br from-card to-card/80 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
        
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate" data-testid={`task-title-${task.id}`}>
                  {task.action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {task.platform || task.category || "General"}
                </p>
              </div>
            </div>
            <Badge className={statusColors[task.status as keyof typeof statusColors]} data-testid={`task-status-${task.id}`}>
              {task.status}
            </Badge>
          </div>

          <p className="text-sm text-foreground/80 line-clamp-2" data-testid={`task-prompt-${task.id}`}>
            {task.prompt}
          </p>

          {isActive && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" data-testid={`task-progress-${task.id}`} />
              
              {metadata && (
                <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-xs">
                  <p className="text-muted-foreground" data-testid={`task-metadata-${task.id}`}>
                    {metadata.message || metadata.status || "Processing..."}
                  </p>
                  {metadata.eta && (
                    <p className="text-foreground">ETA: {metadata.eta} mins</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {task.status === "pending" && onRun && (
              <Button
                size="sm"
                onClick={onRun}
                className="flex-1"
                data-testid={`button-run-${task.id}`}
              >
                <Play className="h-4 w-4 mr-1" />
                Run
              </Button>
            )}
            {task.status === "active" && onPause && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPause}
                className="flex-1"
                data-testid={`button-pause-${task.id}`}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
                data-testid={`button-edit-${task.id}`}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                data-testid={`button-delete-${task.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

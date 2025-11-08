import { motion } from "framer-motion";
import { Clock, Repeat } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskRoutineToggleProps {
  isRoutine: boolean;
  onToggle: () => void;
}

export function TaskRoutineToggle({ isRoutine, onToggle }: TaskRoutineToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={onToggle}
          className={`
            relative flex items-center gap-2 rounded-full px-4 py-2 
            transition-all duration-300 font-medium text-sm
            ${
              isRoutine
                ? "bg-gradient-to-r from-indigo-500 to-green-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }
          `}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          data-testid="toggle-task-routine"
        >
          <motion.div
            animate={{ rotate: isRoutine ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isRoutine ? (
              <Repeat className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
          </motion.div>
          <span className="whitespace-nowrap">
            {isRoutine ? "Routine" : "Task"}
          </span>
          
          {isRoutine && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50"
            />
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-card border-border">
        <p className="text-sm">
          {isRoutine ? "Switch to Task Mode" : "Switch to Routine Mode"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Mic, Sparkles, Loader2, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskRoutineToggle } from "@/components/TaskRoutineToggle";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actionDetected?: {
    type: string;
    description: string;
  };
}

interface ChatInterfaceProps {
  onSendMessage: (message: string, taskType: "one_time" | "routine") => Promise<void>;
  messages: Message[];
  isProcessing: boolean;
}

export function ChatInterface({ onSendMessage, messages, isProcessing }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isRoutine, setIsRoutine] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    await onSendMessage(input, isRoutine ? "routine" : "one_time");
    setInput("");
  };

  const handleToggle = () => {
    setIsRoutine(!isRoutine);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, x: message.role === "user" ? 50 : -50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] space-y-2",
                  message.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-card text-card-foreground border border-card-border shadow-md"
                  )}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  {message.content}
                </div>

                {message.actionDetected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {message.actionDetected.type} detected
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {message.actionDetected.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="rounded-2xl bg-card border border-card-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="h-2 w-2 rounded-full bg-primary"
                  />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                    className="h-2 w-2 rounded-full bg-primary"
                  />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="h-2 w-2 rounded-full bg-primary"
                  />
                </div>
                <span className="text-xs text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 space-y-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <TaskRoutineToggle isRoutine={isRoutine} onToggle={handleToggle} />
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRoutine ? "Set up a recurring automation..." : "Type your automation request..."}
              className="pr-12 h-12 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
              disabled={isProcessing}
              data-testid="input-chat"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 h-10 w-10"
              data-testid="button-voice"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={!input.trim() || isProcessing}
            className="h-12 px-6"
            data-testid="button-send"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>

        <AnimatePresence>
          {isRoutine && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-xs text-muted-foreground"
              data-testid="hint-routine-mode"
            >
              <Repeat className="h-3 w-3 text-green-400" />
              <span>Routine mode active — Effortless will repeat this automation automatically</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

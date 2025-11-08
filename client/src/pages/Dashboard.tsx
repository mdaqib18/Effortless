import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tab";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface";
import { TaskCard } from "@/components/TaskCard";
import { NotificationPopup } from "@/components/NotificationPopup";
import { Confetti } from "@/components/Confetti";
import { LoadingSkeleton } from "@/components/LoadingSpinner";
import { LogOut, Plus, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createSocketConnection } from "@/lib/socket";
import type { Task, Reminder, TaskUpdate } from "@shared/schema";

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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI automation assistant. Tell me what you'd like to automate today.",
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskUpdates, setTaskUpdates] = useState<Record<string, TaskUpdate>>({});
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLocation("/login");
      } else {
        setUser(user);
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
        toast({
          title: `Good ${greeting}, ${user.displayName || user.email}! 🌟`,
          description: "Ready to automate your tasks effortlessly",
        });
      }
    });

    return () => unsubscribe();
  }, [setLocation, toast]);

  useEffect(() => {
    if (!user) return;

    const socket = createSocketConnection((data: TaskUpdate) => {
      setTaskUpdates((prev) => ({
        ...prev,
        [data.taskId]: data,
      }));

      if (data.status === "completed") {
        setShowConfetti(true);
        toast({
          title: "Task completed effortlessly ✅",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      }

      if (data.metadata?.reminder) {
        setActiveReminder(data.metadata.reminder);
      }
    });

    return () => socket.disconnect();
  }, [user, toast]);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", user?.uid],
    enabled: !!user,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest("POST", "/api/tasks", taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const runTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("POST", `/api/tasks/${taskId}/run`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("DELETE", `/api/tasks/${taskId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await apiRequest("POST", "/api/ai/parse", { prompt: message });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.reply || "I've detected your automation request. Creating task...",
        timestamp: new Date(),
        actionDetected: response.taskType ? {
          type: response.taskType,
          description: response.action,
        } : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (response.taskType && !response.clarification) {
        const createdTask = await createTaskMutation.mutateAsync({
          userId: user.uid,
          taskType: response.taskType,
          action: response.action,
          prompt: message,
          platform: response.platform,
          category: response.category,
          recurrence: response.recurrence || "once",
          scheduledTime: response.time,
          status: "pending",
        });

        toast({
          title: "Task created successfully",
          description: "Your automation is starting now...",
        });

        if (createdTask && createdTask.id) {
          await runTaskMutation.mutateAsync(createdTask.id);
        }
      }
    } catch (error: any) {
      toast({
        title: "Failed to process request",
        description: error.message || String(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    setLocation("/login");
  };

  const activeTasks = tasks.filter((t) => t.status === "active");
  const routineTasks = tasks.filter((t) => t.recurrence !== "once");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/50">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Efforless</h1>
              <p className="text-sm text-muted-foreground">
                {user.displayName || user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowChat(!showChat)}
              data-testid="button-toggle-chat"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {showChat ? "Hide Chat" : "AI Chat"}
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Your Automations</h2>
                <p className="text-muted-foreground mt-1">
                  Manage and monitor all your automated tasks
                </p>
              </div>
              <Button onClick={() => setShowChat(true)} data-testid="button-new-task">
                <Plus className="h-5 w-5 mr-2" />
                New Task
              </Button>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  data-testid="tab-active"
                >
                  Active ({activeTasks.length})
                </TabsTrigger>
                <TabsTrigger
                  value="routine"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  data-testid="tab-routine"
                >
                  Routine ({routineTasks.length})
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  data-testid="tab-completed"
                >
                  Completed ({completedTasks.length})
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <TabsContent value="active" className="mt-0">
                      {activeTasks.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No active tasks yet</p>
                          <Button
                            onClick={() => setShowChat(true)}
                            variant="outline"
                            className="mt-4"
                            data-testid="button-create-first"
                          >
                            Create your first task
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <AnimatePresence>
                            {activeTasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                progress={taskUpdates[task.id]?.progress || 0}
                                metadata={taskUpdates[task.id]?.metadata}
                                onPause={() => toast({ title: "Task paused" })}
                                onDelete={() => deleteTaskMutation.mutate(task.id)}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="routine" className="mt-0">
                      {routineTasks.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No routine tasks yet</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <AnimatePresence>
                            {routineTasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                onRun={() => runTaskMutation.mutate(task.id)}
                                onDelete={() => deleteTaskMutation.mutate(task.id)}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="completed" className="mt-0">
                      {completedTasks.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No completed tasks yet</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <AnimatePresence>
                            {completedTasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                onDelete={() => deleteTaskMutation.mutate(task.id)}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </main>

        <AnimatePresence>
          {showChat && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md border-l border-border bg-card/80 backdrop-blur-lg"
              data-testid="chat-panel"
            >
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <NotificationPopup
        reminder={activeReminder}
        onProceed={() => {
          toast({ title: "Proceeding with task" });
          setActiveReminder(null);
        }}
        onSnooze={() => {
          toast({ title: "Reminder snoozed for 5 minutes" });
          setActiveReminder(null);
        }}
        onDismiss={() => setActiveReminder(null)}
      />

      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
}

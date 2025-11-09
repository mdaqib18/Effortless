import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tab";
import { Button } from "@/components/ui/button";
import { ChatInterface, type OrderContext } from "@/components/ChatInterface";
import { TaskCard } from "@/components/TaskCard";
import { NotificationPopup } from "@/components/NotificationPopup";
import { Confetti } from "@/components/Confetti";
import { LoadingSkeleton } from "@/components/LoadingSpinner";
import { PaymentModal } from "@/components/PaymentModal";
import { ThreeDSecureModal } from "@/components/ThreeDSecureModal";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { MetricsBar } from "@/components/MetricsBar";
import { OnboardingState } from "@/components/OnboardingState";
import { LogOut, Plus, MessageSquare, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createSocketConnection } from "@/lib/socket";
import { requiresPayment, extractAmount } from "@/utils/paymentDetection";
import { triggerTaskCreationConfetti } from "@/lib/motionPresets";
import type { Task, Reminder, TaskUpdate, PaymentUpdate } from "@shared/schema";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actionDetected?: {
    type: string;
    description: string;
  };
  items?: Array<{ name: string; quantity?: number; price?: number }>;
  needsItems?: boolean;
  category?: string;
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [threeDSStatus, setThreeDSStatus] = useState<"confirming" | "processing" | "success" | "failed" | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ amount: number; taskData: any; paymentId?: string } | null>(null);
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
          title: `Good ${greeting}, ${user.displayName || user.email}!`,
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
          title: "Task completed effortlessly",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      }

      if (data.metadata?.reminder) {
        setActiveReminder(data.metadata.reminder);
      }
    });

    socket.on('paymentUpdate', (data: PaymentUpdate) => {
      if (data.status === "processing") {
        setThreeDSStatus("processing");
      } else if (data.status === "success") {
        setThreeDSStatus("success");
        setTimeout(() => {
          setShow3DSModal(false);
          setThreeDSStatus(null);
          if (pendingPayment?.taskData) {
            createTaskAfterPayment(pendingPayment.taskData);
          }
        }, 2000);
      } else if (data.status === "failed") {
        setThreeDSStatus("failed");
        setTimeout(() => {
          setShow3DSModal(false);
          setThreeDSStatus(null);
          setPendingPayment(null);
          toast({
            title: "Payment failed",
            description: "Please try again",
            variant: "destructive",
          });
        }, 2000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, toast, pendingPayment]);

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

  const createTaskAfterPayment = async (taskData: any) => {
    try {
      const createdTask = await createTaskMutation.mutateAsync(taskData);
      
      const isRoutineMode = taskData.scheduleType === "routine";
      const successMessage = isRoutineMode
        ? "Payment successful - Routine scheduled!"
        : "Payment successful - Task activated!";
      const descriptionMessage = isRoutineMode
        ? "Effortless will handle this automatically"
        : "Your automation is starting now...";

      triggerTaskCreationConfetti();
      
      toast({
        title: successMessage,
        description: descriptionMessage,
      });

      if (createdTask && createdTask.id && !isRoutineMode) {
        await runTaskMutation.mutateAsync(createdTask.id);
      }
      
      setPendingPayment(null);
      setShowPaymentModal(false);
    } catch (error: any) {
      toast({
        title: "Failed to create task",
        description: error.message || String(error),
        variant: "destructive",
      });
    }
  };

  const handlePayNow = async () => {
    if (!pendingPayment) return;

    try {
      const response = await apiRequest("POST", "/api/payments/initiate", {
        userId: user.uid,
        amount: pendingPayment.amount,
      });

      setPendingPayment(prev => prev ? { ...prev, paymentId: response.paymentId } : null);
      setShowPaymentModal(false);
      setShow3DSModal(true);
      setThreeDSStatus("confirming");
    } catch (error: any) {
      toast({
        title: "Failed to initiate payment",
        description: error.message || String(error),
        variant: "destructive",
      });
    }
  };

  const handleConfirm3DS = async () => {
    if (!pendingPayment?.paymentId) return;

    try {
      await apiRequest("POST", "/api/payments/confirm", {
        paymentId: pendingPayment.paymentId,
      });
    } catch (error: any) {
      toast({
        title: "Payment confirmation failed",
        description: error.message || String(error),
        variant: "destructive",
      });
      setShow3DSModal(false);
      setThreeDSStatus(null);
    }
  };

  const handleCancelPayment = () => {
    if (pendingPayment?.paymentId) {
      apiRequest("POST", "/api/payments/cancel", {
        paymentId: pendingPayment.paymentId,
      }).catch(console.error);
    }
    setShowPaymentModal(false);
    setShow3DSModal(false);
    setThreeDSStatus(null);
    setPendingPayment(null);
    toast({
      title: "Payment cancelled",
      description: "Task creation cancelled",
    });
  };

  const handleSendMessage = async (message: string, taskType: "one_time" | "routine", orderContext?: OrderContext) => {
    console.log("📨 [handleSendMessage] Called with:", {
      message,
      taskType,
      orderContext,
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const promptWithContext = orderContext?.category 
        ? `${orderContext.category}: ${message}` 
        : message;
      
      console.log("🤖 [handleSendMessage] Sending to AI parser:", promptWithContext);
      const response = await apiRequest("POST", "/api/ai/parse", { prompt: promptWithContext });
      console.log("🤖 [handleSendMessage] AI parser response:", response);
      
      const isRoutineMode = taskType === "routine";
      const confirmationText = isRoutineMode 
        ? response.reply || "I've detected your routine automation request. Setting it up..."
        : response.reply || "I've detected your automation request. Creating task...";
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: confirmationText,
        timestamp: new Date(),
        actionDetected: response.taskType ? {
          type: response.taskType,
          description: response.action,
        } : undefined,
        items: response.items,
        needsItems: response.needsItems,
        category: response.category,
      };
      
      console.log("💬 [handleSendMessage] Creating assistant message:", assistantMessage);
      setMessages((prev) => [...prev, assistantMessage]);

      // Skip task creation if this is part of conversational ordering flow
      // (i.e., AI is asking for items OR returning items that need user confirmation)
      const isConversationalFlow = response.needsItems || response.followUp || 
        (response.items && response.items.length > 0 && 
         (response.category === 'grocery' || response.category === 'food' || response.category === 'medicine'));

      if (response.taskType && !response.clarification && !isConversationalFlow) {
        const contextItems = orderContext?.items || [];
        const responseItems = response.items || [];
        const allItems = [...contextItems, ...responseItems];
        const itemsMap = new Map();
        allItems.forEach(item => {
          const key = item.name.toLowerCase();
          if (!itemsMap.has(key)) {
            itemsMap.set(key, item);
          } else {
            const existing = itemsMap.get(key);
            itemsMap.set(key, {
              ...existing,
              quantity: (existing.quantity || 1) + (item.quantity || 1),
            });
          }
        });
        const itemsToUse = Array.from(itemsMap.values());
        
        const taskData = {
          userId: user.uid,
          taskType: response.taskType,
          action: response.action,
          prompt: message,
          platform: response.platform,
          category: response.category,
          recurrence: isRoutineMode ? (response.recurrence || "daily") : "once",
          scheduledTime: response.time,
          status: "pending",
          scheduleType: taskType,
          items: itemsToUse.length > 0 ? itemsToUse : undefined,
        };

        if (requiresPayment(message, response.taskType)) {
          const amount = extractAmount(message, response.taskType);
          setPendingPayment({ amount, taskData });
          setShowPaymentModal(true);
          
          const paymentMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: `This automation requires a payment of ₹${amount.toLocaleString('en-IN')}. Please complete the payment to proceed.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, paymentMessage]);
        } else {
          const createdTask = await createTaskMutation.mutateAsync(taskData);

          const successMessage = isRoutineMode
            ? "Routine automation scheduled"
            : "Task created successfully";
          const descriptionMessage = isRoutineMode
            ? "Effortless will handle this automatically"
            : "Your automation is starting now...";

          triggerTaskCreationConfetti();

          toast({
            title: successMessage,
            description: descriptionMessage,
          });

          if (createdTask && createdTask.id && !isRoutineMode) {
            await runTaskMutation.mutateAsync(createdTask.id);
          }

          const finalMessage: Message = {
            id: (Date.now() + 3).toString(),
            role: "assistant",
            content: isRoutineMode 
              ? `Routine set — I'll handle this ${taskData.recurrence === 'daily' ? 'every day' : taskData.recurrence === 'weekly' ? 'every week' : taskData.recurrence === 'monthly' ? 'every month' : 'automatically'}.`
              : "Task activated and running now!",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, finalMessage]);
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
    <div className="flex h-screen flex-col bg-background relative">
      <AnimatedBackground />
      
      <header className="glass-header relative z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-500 glow-primary-sm"
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Effortless</h1>
              <p className="text-sm text-muted-foreground">
                {user.displayName || user.email}
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
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
              onClick={() => setLocation("/settings")}
              data-testid="button-settings"
            >
              <SettingsIcon className="h-5 w-5 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <MetricsBar 
              userName={user.displayName || user.email?.split('@')[0]}
              activeCount={activeTasks.length}
              routineCount={routineTasks.length}
              completedCount={completedTasks.length}
            />

            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-foreground">Your Automations</h2>
                <p className="text-muted-foreground mt-1">
                  Manage and monitor all your automated tasks
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              >
                <Button 
                  onClick={() => setShowChat(true)} 
                  data-testid="button-new-task"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Task
                </Button>
              </motion.div>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="w-full justify-start border-b border-border/40 bg-transparent p-0 relative">
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:text-primary data-[state=active]:glow-primary-sm rounded-none relative px-6 py-3 transition-all hover-glow-primary"
                  data-testid="tab-active"
                >
                  <motion.span
                    className="relative z-10"
                    whileHover={{ scale: 1.05 }}
                  >
                    Active ({activeTasks.length})
                  </motion.span>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-emerald-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </TabsTrigger>
                <TabsTrigger
                  value="routine"
                  className="data-[state=active]:text-emerald-400 data-[state=active]:glow-emerald-sm rounded-none relative px-6 py-3 transition-all hover-glow-emerald"
                  data-testid="tab-routine"
                >
                  <motion.span
                    className="relative z-10"
                    whileHover={{ scale: 1.05 }}
                  >
                    Routine ({routineTasks.length})
                  </motion.span>
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:text-blue-400 rounded-none relative px-6 py-3 transition-all"
                  data-testid="tab-completed"
                >
                  <motion.span
                    className="relative z-10"
                    whileHover={{ scale: 1.05 }}
                  >
                    Completed ({completedTasks.length})
                  </motion.span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <TabsContent value="active" className="mt-0">
                      {activeTasks.length === 0 ? (
                        <OnboardingState onCreateTask={() => setShowChat(true)} />
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <AnimatePresence>
                            {activeTasks.map((task, index) => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                              >
                                <TaskCard
                                  task={task}
                                  progress={taskUpdates[task.id]?.progress || 0}
                                  metadata={taskUpdates[task.id]?.metadata}
                                  onPause={() => toast({ title: "Task paused" })}
                                  onDelete={() => deleteTaskMutation.mutate(task.id)}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="routine" className="mt-0">
                      {routineTasks.length === 0 ? (
                        <motion.div 
                          className="text-center py-16"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <p className="text-muted-foreground text-lg">No routine tasks yet</p>
                          <p className="text-sm text-muted-foreground/60 mt-2">
                            Set up recurring automations to save time
                          </p>
                        </motion.div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <AnimatePresence>
                            {routineTasks.map((task, index) => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                              >
                                <TaskCard
                                  task={task}
                                  onRun={() => runTaskMutation.mutate(task.id)}
                                  onDelete={() => deleteTaskMutation.mutate(task.id)}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="completed" className="mt-0">
                      {completedTasks.length === 0 ? (
                        <motion.div 
                          className="text-center py-16"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <p className="text-muted-foreground text-lg">No completed tasks yet</p>
                          <p className="text-sm text-muted-foreground/60 mt-2">
                            Completed tasks will appear here
                          </p>
                        </motion.div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <AnimatePresence>
                            {completedTasks.map((task, index) => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                              >
                                <TaskCard
                                  task={task}
                                  onDelete={() => deleteTaskMutation.mutate(task.id)}
                                />
                              </motion.div>
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

      <PaymentModal
        isOpen={showPaymentModal}
        amount={pendingPayment?.amount || 0}
        onPayNow={handlePayNow}
        onCancel={handleCancelPayment}
        taskDescription={pendingPayment?.taskData?.prompt}
      />

      <ThreeDSecureModal
        isOpen={show3DSModal}
        amount={pendingPayment?.amount || 0}
        onConfirm={handleConfirm3DS}
        onCancel={handleCancelPayment}
        status={threeDSStatus}
      />
    </div>
  );
}

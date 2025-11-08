import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Bell, CreditCard, Settings as SettingsIcon, Sparkles } from "lucide-react";
import type { UserSettings } from "@shared/schema";

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLocation("/login");
      }
    });
    return () => unsubscribe();
  }, [setLocation]);

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/settings", user?.uid],
    enabled: !!user,
  });

  const [formData, setFormData] = useState<Partial<UserSettings>>({});

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const { id, createdAt, updatedAt, ...cleanSettings } = settings || {};
      return apiRequest("POST", "/api/settings", {
        ...cleanSettings,
        ...formData,
        ...data,
        userId: user!.uid,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to save settings",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSwitchChange = (field: keyof UserSettings, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    updateMutation.mutate({ [field]: value });
  };

  const handleSelectChange = (field: keyof UserSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    updateMutation.mutate({ [field]: value });
  };

  const handleInputChange = (field: keyof UserSettings, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveInput = (field: keyof UserSettings) => {
    if (formData[field] !== undefined) {
      updateMutation.mutate({ [field]: formData[field] });
    }
  };

  const currentSettings = { ...settings, ...formData };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/50">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Customize your automation preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          ) : (
            <Tabs defaultValue="notifications" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notifications" data-testid="tab-notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="providers" data-testid="tab-providers">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Providers
                </TabsTrigger>
                <TabsTrigger value="automation" data-testid="tab-automation">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Automation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to be notified about your automations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email alerts for task completions
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={currentSettings.emailNotifications ?? true}
                        onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                        data-testid="switch-email-notifications"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get text messages for urgent updates
                        </p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={currentSettings.smsNotifications ?? false}
                        onCheckedChange={(checked) => handleSwitchChange("smsNotifications", checked)}
                        data-testid="switch-sms-notifications"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sound-enabled">Sound Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Play sounds for notifications
                        </p>
                      </div>
                      <Switch
                        id="sound-enabled"
                        checked={currentSettings.soundEnabled ?? true}
                        onCheckedChange={(checked) => handleSwitchChange("soundEnabled", checked)}
                        data-testid="switch-sound-enabled"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reminder-lead-time">Reminder Lead Time (minutes)</Label>
                      <p className="text-sm text-muted-foreground">
                        How early should reminders notify you
                      </p>
                      <div className="flex gap-2">
                        <Input
                          id="reminder-lead-time"
                          type="number"
                          min="1"
                          max="60"
                          value={currentSettings.reminderLeadTime ?? 15}
                          onChange={(e) => handleInputChange("reminderLeadTime", parseInt(e.target.value))}
                          onBlur={() => handleSaveInput("reminderLeadTime")}
                          data-testid="input-reminder-lead-time"
                          className="max-w-32"
                        />
                        <span className="flex items-center text-sm text-muted-foreground">minutes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="providers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Default Service Providers</CardTitle>
                    <CardDescription>
                      Set your preferred services for each automation type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="cab-service">Cab Service</Label>
                      <Select
                        value={currentSettings.preferredCabService || ""}
                        onValueChange={(value) => handleSelectChange("preferredCabService", value)}
                      >
                        <SelectTrigger id="cab-service" data-testid="select-cab-service">
                          <SelectValue placeholder="Select cab service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uber">Uber</SelectItem>
                          <SelectItem value="lyft">Lyft</SelectItem>
                          <SelectItem value="ola">Ola</SelectItem>
                          <SelectItem value="grab">Grab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-gateway">Payment Gateway</Label>
                      <Select
                        value={currentSettings.preferredPaymentGateway || ""}
                        onValueChange={(value) => handleSelectChange("preferredPaymentGateway", value)}
                      >
                        <SelectTrigger id="payment-gateway" data-testid="select-payment-gateway">
                          <SelectValue placeholder="Select payment gateway" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="razorpay">Razorpay</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grocery-store">Grocery Service</Label>
                      <Select
                        value={currentSettings.preferredGroceryStore || ""}
                        onValueChange={(value) => handleSelectChange("preferredGroceryStore", value)}
                      >
                        <SelectTrigger id="grocery-store" data-testid="select-grocery-store">
                          <SelectValue placeholder="Select grocery service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instacart">Instacart</SelectItem>
                          <SelectItem value="amazon-fresh">Amazon Fresh</SelectItem>
                          <SelectItem value="walmart">Walmart</SelectItem>
                          <SelectItem value="bigbasket">BigBasket</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="food-service">Food Delivery Service</Label>
                      <Select
                        value={currentSettings.preferredFoodService || ""}
                        onValueChange={(value) => handleSelectChange("preferredFoodService", value)}
                      >
                        <SelectTrigger id="food-service" data-testid="select-food-service">
                          <SelectValue placeholder="Select food delivery service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ubereats">Uber Eats</SelectItem>
                          <SelectItem value="doordash">DoorDash</SelectItem>
                          <SelectItem value="grubhub">Grubhub</SelectItem>
                          <SelectItem value="zomato">Zomato</SelectItem>
                          <SelectItem value="swiggy">Swiggy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Automation Controls</CardTitle>
                    <CardDescription>
                      Manage when and how your automations run
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-run">Auto-Run Tasks</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically execute tasks when created
                        </p>
                      </div>
                      <Switch
                        id="auto-run"
                        checked={currentSettings.autoRunEnabled ?? true}
                        onCheckedChange={(checked) => handleSwitchChange("autoRunEnabled", checked)}
                        data-testid="switch-auto-run"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quiet Hours</Label>
                      <p className="text-sm text-muted-foreground">
                        Disable notifications during these hours
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quiet-start" className="text-xs text-muted-foreground">Start Time</Label>
                          <Input
                            id="quiet-start"
                            type="time"
                            value={currentSettings.quietHoursStart || ""}
                            onChange={(e) => handleInputChange("quietHoursStart", e.target.value)}
                            onBlur={() => handleSaveInput("quietHoursStart")}
                            data-testid="input-quiet-hours-start"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quiet-end" className="text-xs text-muted-foreground">End Time</Label>
                          <Input
                            id="quiet-end"
                            type="time"
                            value={currentSettings.quietHoursEnd || ""}
                            onChange={(e) => handleInputChange("quietHoursEnd", e.target.value)}
                            onBlur={() => handleSaveInput("quietHoursEnd")}
                            data-testid="input-quiet-hours-end"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </main>
    </div>
  );
}

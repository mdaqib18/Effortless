import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { signInWithRedirect, signInWithEmailAndPassword, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Handle redirect result from Firebase
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          toast({
            title: `Welcome back, ${result.user.displayName || result.user.email}! 👋`,
            description: "Your automation hub is ready",
          });
          setLocation("/dashboard");
        }
      })
      .catch((error) => {
        console.error("Redirect error:", error);
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
      });
  }, [setLocation, toast]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      toast({
        title: "Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: `Welcome back, ${result.user.email}! 👋`,
        description: "Your automation hub is ready",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/50 shadow-2xl shadow-primary/50"
          >
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Effortless</h1>
          <p className="text-muted-foreground">Your AI-powered automation platform</p>
        </div>

        <Card className="border-card-border bg-gradient-to-br from-card to-card/80 backdrop-blur-lg p-8 shadow-2xl">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
          
          <div className="relative space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to continue to your automation hub</p>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-input border-input focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    disabled={isLoading}
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-input border-input focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
                    disabled={isLoading}
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                size="lg"
                disabled={isLoading || !email || !password}
                data-testid="button-signin"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              data-testid="button-google"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <button
                onClick={() => setLocation("/signup")}
                className="text-primary hover:underline font-medium"
                data-testid="link-signup"
              >
                Sign up
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

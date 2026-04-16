import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const YANTRA_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663440106934/Z38f2pvPBxWeP9byuWrrSZ/yantra-hero-mS4hu6TMqj5gR8ntzMg4SC.webp";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Welcome back");
      setLocation("/courses", { replace: true });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/courses", { replace: true });
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src={YANTRA_URL} alt="Yantra" className="w-20 h-20 mx-auto mb-4 opacity-70" />
          </Link>
          <h1 className="font-serif text-3xl tracking-wider text-foreground">Sign In</h1>
          <p className="text-muted-foreground text-sm mt-2">Return to your practice</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-xl p-8 space-y-5 shadow-lg shadow-primary/5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="bg-input/50 border-border/50 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground/80">Password</Label>
              <Link href="/forgot-password">
                <span className="text-xs text-primary/70 hover:text-primary">Forgot password?</span>
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-input/50 border-border/50 focus:border-primary"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New to the school?{" "}
          <Link href="/register">
            <span className="text-primary hover:text-primary/80">Create an account</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

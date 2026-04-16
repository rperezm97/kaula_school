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

export default function Register() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Welcome to the Kaula School");
      setLocation("/subscribe", { replace: true });
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
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    registerMutation.mutate({ email, password, name: name || undefined });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src={YANTRA_URL} alt="Yantra" className="w-20 h-20 mx-auto mb-4 opacity-70" />
          </Link>
          <h1 className="font-serif text-3xl tracking-wider text-foreground text-glow">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-2">Begin your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card/50 border border-border/50 rounded-xl p-8 space-y-5 backdrop-blur-sm">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground/80">Name (optional)</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-input/50 border-border/50 focus:border-primary"
            />
          </div>
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
            <Label htmlFor="password" className="text-foreground/80">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="bg-input/50 border-border/50 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={8}
              className="bg-input/50 border-border/50 focus:border-primary"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login">
            <span className="text-primary hover:text-primary/80">Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

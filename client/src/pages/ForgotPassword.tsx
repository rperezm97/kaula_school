import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const YANTRA_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663440106934/Z38f2pvPBxWeP9byuWrrSZ/yantra-hero-mS4hu6TMqj5gR8ntzMg4SC.webp";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const resetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSent(true);
      toast.success("If an account exists, a reset link has been sent.");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><img src={YANTRA_URL} alt="Yantra" className="w-20 h-20 mx-auto mb-4 opacity-70" /></Link>
          <h1 className="font-serif text-3xl tracking-wider text-foreground text-glow">Reset Password</h1>
        </div>

        {sent ? (
          <div className="bg-card/50 border border-border/50 rounded-xl p-8 text-center">
            <p className="text-foreground/80 mb-4">Check your email for a password reset link.</p>
            <Link href="/login"><Button variant="outline" className="border-primary/30 text-primary">Back to Sign In</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card/50 border border-border/50 rounded-xl p-8 space-y-5 backdrop-blur-sm">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="bg-input/50 border-border/50 focus:border-primary" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={resetMutation.isPending}>
              {resetMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Send Reset Link
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login"><span className="text-primary hover:text-primary/80">Back to Sign In</span></Link>
        </p>
      </div>
    </div>
  );
}

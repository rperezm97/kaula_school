import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setDone(true);
      toast.success("Password reset successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    resetMutation.mutate({ token, newPassword: password });
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="font-serif text-3xl tracking-wider text-foreground text-glow mb-4">Password Reset</h1>
          <p className="text-muted-foreground mb-6">Your password has been updated.</p>
          <Link href="/login"><Button className="bg-primary text-primary-foreground">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl tracking-wider text-foreground text-glow text-center mb-8">Set New Password</h1>
        <form onSubmit={handleSubmit} className="bg-card/50 border border-border/50 rounded-xl p-8 space-y-5">
          <div className="space-y-2">
            <Label className="text-foreground/80">New Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} className="bg-input/50 border-border/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80">Confirm Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required minLength={8} className="bg-input/50 border-border/50" />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={resetMutation.isPending}>
            {resetMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

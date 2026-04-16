import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CreditCard, Key, User } from "lucide-react";

export default function Settings() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const subStatus = trpc.subscription.status.useQuery();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => toast.error(err.message),
  });

  const portalMutation = trpc.subscription.createPortal.useMutation({
    onSuccess: (data) => { window.location.href = data.url; },
    onError: (err) => toast.error(err.message),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleManageSubscription = () => {
    portalMutation.mutate();
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container py-4 flex items-center gap-4">
          <Link href="/courses"><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-serif text-xl tracking-wider text-foreground">Settings</h1>
        </div>
      </div>

      <div className="container py-8 max-w-2xl mx-auto space-y-8">
        {/* Profile Info */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg text-foreground tracking-wide">Profile</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">Name</span>
              <span className="text-foreground">{user?.name || "Not set"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Member since</span>
              <span className="text-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg text-foreground tracking-wide">Subscription</h2>
          </div>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-medium ${subStatus.data?.status === "active" ? "text-green-400" : "text-muted-foreground"}`}>
                {subStatus.data?.status === "active" ? "Active" : subStatus.data?.status || "None"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Tier</span>
              <span className="text-foreground capitalize">{subStatus.data?.tier || "None"}</span>
            </div>
          </div>
          {user?.stripeCustomerId ? (
            <Button onClick={handleManageSubscription} variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10" disabled={portalMutation.isPending}>
              {portalMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Manage Subscription
            </Button>
          ) : (
            <Link href="/subscribe">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Subscribe Now</Button>
            </Link>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg text-foreground tracking-wide">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm">Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="bg-input/50 border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} className="bg-input/50 border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm">Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="bg-input/50 border-border/50" />
            </div>
            <Button type="submit" variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Update Password
            </Button>
          </form>
        </div>

        {/* Logout */}
        <Button onClick={handleLogout} variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
          Sign Out
        </Button>
      </div>
    </div>
  );
}

import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminUsers() {
  const usersQuery = trpc.admin.users.useQuery();
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); usersQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AdminLayout title="Users">
      {usersQuery.isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-accent/20">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">User</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Subscription</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Joined</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data?.map(u => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-accent/10">
                    <td className="px-4 py-3 text-foreground">
                      <div className="flex items-center gap-2">
                        {u.role === "admin" ? <Shield className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
                        {u.name || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{u.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-accent/50 text-muted-foreground"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${u.subscriptionStatus === "active" ? "bg-green-500/20 text-green-400" : "bg-accent/50 text-muted-foreground"}`}>
                        {u.subscriptionTier !== "none" ? `${u.subscriptionTier} (${u.subscriptionStatus})` : "None"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      {u.role === "user" ? (
                        <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary h-7"
                          onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "admin" })}>
                          Make Admin
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs border-border/50 text-muted-foreground h-7"
                          onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "user" })}>
                          Remove Admin
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!usersQuery.data || usersQuery.data.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">No users yet.</div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

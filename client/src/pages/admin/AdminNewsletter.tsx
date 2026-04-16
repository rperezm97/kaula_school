import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Newspaper } from "lucide-react";
import { toast } from "sonner";

export default function AdminNewsletter() {
  const subscribersQuery = trpc.admin.newsletterSubscribers.useQuery();
  const deleteMutation = trpc.admin.removeNewsletterSubscriber.useMutation({
    onSuccess: () => { toast.success("Subscriber removed"); subscribersQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <AdminLayout title="Newsletter Subscribers">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">{subscribersQuery.data?.length || 0} subscribers</p>
      </div>

      {subscribersQuery.isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-accent/20">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Subscribed</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribersQuery.data?.map(sub => (
                  <tr key={sub.id} className="border-b border-border/30 hover:bg-accent/10">
                    <td className="px-4 py-3 text-foreground">{sub.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => { if (confirm("Remove this subscriber?")) deleteMutation.mutate({ id: sub.id }); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!subscribersQuery.data || subscribersQuery.data.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">
              <Newspaper className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              No newsletter subscribers yet.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

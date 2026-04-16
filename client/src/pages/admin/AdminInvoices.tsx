import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, ExternalLink, Receipt } from "lucide-react";

export default function AdminInvoices() {
  const invoicesQuery = trpc.admin.invoices.useQuery({});

  return (
    <AdminLayout title="Invoices">
      {invoicesQuery.isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-accent/20">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Invoice #</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {invoicesQuery.data?.map(inv => (
                  <tr key={inv.id} className="border-b border-border/30 hover:bg-accent/10">
                    <td className="px-4 py-3 text-foreground">{inv.customer_email || "—"}</td>
                    <td className="px-4 py-3 text-foreground">€{((inv.amount_paid || 0) / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${inv.status === "paid" ? "bg-green-500/20 text-green-400" : inv.status === "open" ? "bg-yellow-500/20 text-yellow-400" : "bg-accent/50 text-muted-foreground"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{inv.number || inv.id?.slice(0, 20)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.created ? new Date(inv.created * 1000).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      {inv.hosted_invoice_url && (
                        <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!invoicesQuery.data || invoicesQuery.data.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">
              <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              No invoices yet.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

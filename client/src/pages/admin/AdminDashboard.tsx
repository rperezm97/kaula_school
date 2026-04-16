import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, Users, CreditCard, Newspaper, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const statsQuery = trpc.admin.stats.useQuery();

  return (
    <AdminLayout title="Dashboard">
      {statsQuery.isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : statsQuery.data ? (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card/50 border border-border/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Users</span>
              </div>
              <p className="text-3xl font-light text-foreground">{statsQuery.data.totalUsers}</p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Active Subscribers</span>
              </div>
              <p className="text-3xl font-light text-foreground">{statsQuery.data.activeSubscribers}</p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Newspaper className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Newsletter</span>
              </div>
              <p className="text-3xl font-light text-foreground">{statsQuery.data.newsletterSubscribers}</p>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Revenue/mo (est.)</span>
              </div>
              <p className="text-3xl font-light text-foreground">
                €{(statsQuery.data.tierBreakdown.lower * 30) + (statsQuery.data.tierBreakdown.mid * 50) + (statsQuery.data.tierBreakdown.premium * 70)}
              </p>
            </div>
          </div>

          {/* Tier Breakdown */}
          <div className="bg-card/50 border border-border/50 rounded-xl p-6">
            <h2 className="font-serif text-lg text-foreground tracking-wide mb-4">Subscription Breakdown</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/30 rounded-lg">
                <p className="text-2xl font-light text-foreground">{statsQuery.data.tierBreakdown.lower}</p>
                <p className="text-sm text-muted-foreground mt-1">Sadhaka (€30)</p>
              </div>
              <div className="text-center p-4 bg-accent/30 rounded-lg">
                <p className="text-2xl font-light text-foreground">{statsQuery.data.tierBreakdown.mid}</p>
                <p className="text-sm text-muted-foreground mt-1">Vira (€50)</p>
              </div>
              <div className="text-center p-4 bg-accent/30 rounded-lg">
                <p className="text-2xl font-light text-foreground">{statsQuery.data.tierBreakdown.premium}</p>
                <p className="text-sm text-muted-foreground mt-1">Siddha (€70)</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Failed to load stats.</p>
      )}
    </AdminLayout>
  );
}

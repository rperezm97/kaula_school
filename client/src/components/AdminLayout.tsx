import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Loader2, LayoutDashboard, Users, Layers, Video, FileText, Receipt, Mail, Newspaper, ArrowLeft, Shield } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/sections", label: "Sections", icon: Layers },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/resources", label: "Resources", icon: FileText },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
  { href: "/admin/emails", label: "Email Log", icon: Mail },
  { href: "/admin/newsletter", label: "Newsletter", icon: Newspaper },
];

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-serif text-sm tracking-widest text-sidebar-primary">ADMIN PANEL</span>
          </div>
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-primary text-xs">
              <ArrowLeft className="h-3 w-3 mr-2" /> Back to School
            </Button>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
          {user.email}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl px-8 py-4">
          <h1 className="font-serif text-xl tracking-wider text-foreground">{title}</h1>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

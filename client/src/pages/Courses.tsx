import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Loader2, Compass, BookOpen, Sparkles, Eye, Video, FolderOpen, Search, Bookmark, Settings, LogOut, Shield, Play, Clock, CheckCircle, ChevronRight } from "lucide-react";

const YANTRA_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663440106934/Z38f2pvPBxWeP9byuWrrSZ/yantra-hero-mS4hu6TMqj5gR8ntzMg4SC.webp";

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  Eye: <Eye className="h-6 w-6" />,
  Video: <Video className="h-6 w-6" />,
  FolderOpen: <FolderOpen className="h-6 w-6" />,
};

function formatDuration(s?: number | null) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function Courses() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const sectionsQuery = trpc.courses.sections.useQuery();
  const progressQuery = trpc.progress.get.useQuery();
  const recentQuery = trpc.progress.recent.useQuery({ limit: 4 });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/", { replace: true });
  };

  const topSections = sectionsQuery.data?.filter(s => !s.parentId) ?? [];
  const progressList = progressQuery.data ?? [];

  // Per-section completion stats
  const allSections = sectionsQuery.data ?? [];
  const sectionStats = topSections.map(section => {
    const subsectionIds = allSections.filter(s => s.parentId === section.id).map(s => s.id);
    const relevantSectionIds = [section.id, ...subsectionIds];
    // We don't have video counts per section without fetching all videos; show total completed videos in subtree
    const completed = progressList.filter(p => p.completed).length;
    return { sectionId: section.id, completed };
  });

  const recentItems = recentQuery.data ?? [];
  const hasRecent = recentItems.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="container flex items-center justify-between py-3">
          <Link href="/">
            <div className="flex items-center gap-3">
              <img src={YANTRA_URL} alt="" className="w-8 h-8 opacity-70" />
              <span className="font-serif text-lg tracking-widest text-primary">KAULA SCHOOL</span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/journal">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs tracking-wider">Journal</Button>
            </Link>
            <Link href="/search">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Search className="h-5 w-5" /></Button>
            </Link>
            <Link href="/bookmarks">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Bookmark className="h-5 w-5" /></Button>
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Shield className="h-5 w-5" /></Button>
              </Link>
            )}
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Settings className="h-5 w-5" /></Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-10 max-w-5xl mx-auto px-6">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl tracking-wider text-foreground mb-1">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}.` : "Welcome back."}
          </h1>
          <p className="text-muted-foreground text-sm">Continue where you left off, or begin a new section.</p>
        </div>

        {/* Continue Watching */}
        {hasRecent && (
          <section className="mb-12">
            <h2 className="font-serif text-lg text-foreground tracking-wide mb-4 flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Continue Watching
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentItems.map((item: any) => {
                if (!item.video) return null;
                const pct = item.video.durationSeconds
                  ? Math.min(100, Math.round((item.watchedSeconds / item.video.durationSeconds) * 100))
                  : 0;
                return (
                  <Link key={item.videoId} href={`/video/${item.video.slug}`}>
                    <div className="group bg-card border border-border/50 rounded-xl p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"}`}>
                          {item.completed ? <CheckCircle className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate group-hover:text-primary transition-colors">{item.video.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.video.durationSeconds && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />{formatDuration(item.video.durationSeconds)}
                              </span>
                            )}
                            {item.completed && <span className="text-xs text-primary">Completed</span>}
                          </div>
                          {!item.completed && item.video.durationSeconds && (
                            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Course Sections */}
        <section>
          <h2 className="font-serif text-lg text-foreground tracking-wide mb-4">
            {hasRecent ? "All Sections" : "Course Library"}
          </h2>

          {sectionsQuery.isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {topSections.map(section => {
                const completedCount = progressList.filter(p => p.completed).length;
                return (
                  <Link key={section.id} href={`/courses/${section.slug}`}>
                    <div className="group bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer h-full">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          {ICON_MAP[section.iconName || "FolderOpen"] || <FolderOpen className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-xl text-foreground tracking-wide group-hover:text-primary transition-colors">
                            {section.title}
                          </h3>
                          {section.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed mt-1 line-clamp-2">
                              {section.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}

              {topSections.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground">Content is being prepared. Check back soon.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

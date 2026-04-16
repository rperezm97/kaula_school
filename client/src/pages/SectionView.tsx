import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { Loader2, ArrowLeft, Play, FileText, Clock, CheckCircle, BookOpen } from "lucide-react";

export default function SectionView() {
  const { slug } = useParams<{ slug: string }>();
  const { loading } = useAuth();
  const sectionQuery = trpc.courses.sectionBySlug.useQuery({ slug: slug || "" }, { enabled: !!slug });
  const videosQuery = trpc.courses.videosBySection.useQuery(
    { sectionId: sectionQuery.data?.id ?? 0 },
    { enabled: !!sectionQuery.data?.id }
  );
  const resourcesQuery = trpc.courses.resourcesBySection.useQuery(
    { sectionId: sectionQuery.data?.id ?? 0 },
    { enabled: !!sectionQuery.data?.id }
  );
  const progressQuery = trpc.progress.get.useQuery();
  const allSectionsQuery = trpc.courses.sections.useQuery();

  if (loading || sectionQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const section = sectionQuery.data;
  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Section not found</p>
          <Link href="/courses"><Button variant="outline" className="border-primary/30 text-primary">Back to Courses</Button></Link>
        </div>
      </div>
    );
  }

  const videos = videosQuery.data || [];
  const resources = resourcesQuery.data || [];
  const progressMap = new Map((progressQuery.data || []).map(p => [p.videoId, p]));
  const subsections = (allSectionsQuery.data || []).filter(s => s.parentId === section.id);

  const completedCount = videos.filter(v => progressMap.get(v.id)?.completed).length;
  const completionPct = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container py-4 flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl tracking-wider text-foreground">{section.title}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-muted-foreground text-xs">{videos.length} videos{resources.length > 0 ? ` · ${resources.length} resources` : ""}</p>
              {videos.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{completedCount}/{videos.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-4xl mx-auto">
        {section.description && (
          <p className="text-muted-foreground leading-relaxed mb-8">{section.description}</p>
        )}

        {/* Subsections */}
        {subsections.length > 0 && (
          <div className="mb-10">
            <h2 className="font-serif text-lg text-foreground tracking-wide mb-4">Subsections</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {subsections.map(sub => (
                <Link key={sub.id} href={`/courses/${sub.slug}`}>
                  <div className="bg-card/50 border border-border/50 rounded-lg p-5 hover:border-primary/40 transition-all cursor-pointer">
                    <h3 className="font-serif text-foreground tracking-wide">{sub.title}</h3>
                    {sub.description && <p className="text-muted-foreground text-sm mt-1">{sub.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="mb-10">
            <h2 className="font-serif text-lg text-foreground tracking-wide mb-4">Videos</h2>
            <div className="space-y-3">
              {videos.map((video, index) => {
                const progress = progressMap.get(video.id);
                const isCompleted = progress?.completed;
                return (
                  <Link key={video.id} href={`/video/${video.slug}`}>
                    <div className="bg-card/50 border border-border/50 rounded-lg p-4 hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer flex items-center gap-4 group">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"} transition-colors`}>
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-foreground text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {index + 1}. {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-muted-foreground text-xs mt-0.5 truncate">{video.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                        {video.durationSeconds && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(video.durationSeconds)}</span>
                        )}
                        {progress && !isCompleted && (
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(100, (progress.watchedSeconds / (video.durationSeconds || 1)) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div>
            <h2 className="font-serif text-lg text-foreground tracking-wide mb-4">Resources</h2>
            <div className="space-y-3">
              {resources.map(resource => (
                <a key={resource.id} href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="bg-card/50 border border-border/50 rounded-lg p-4 hover:border-primary/40 transition-all flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-foreground text-sm font-medium truncate">{resource.title}</h3>
                      {resource.description && <p className="text-muted-foreground text-xs mt-0.5 truncate">{resource.description}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground uppercase">{resource.fileType}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {videos.length === 0 && resources.length === 0 && subsections.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Content coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "wouter";
import {
  Loader2, ArrowLeft, Bookmark, BookmarkCheck, Play, FileText, ChevronRight,
  Clock, CheckCircle, StickyNote, Plus, Trash2, Pencil, X, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

function formatDuration(s?: number | null) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatTimestamp(s?: number | null) {
  if (s == null) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoPlayer() {
  const { slug } = useParams<{ slug: string }>();
  const { loading } = useAuth();
  const videoQuery = trpc.courses.videoBySlug.useQuery({ slug: slug || "" }, { enabled: !!slug });
  const progressQuery = trpc.progress.videoProgress.useQuery(
    { videoId: videoQuery.data?.id ?? 0 },
    { enabled: !!videoQuery.data?.id }
  );
  const allVideosInSectionQuery = trpc.courses.videosBySection.useQuery(
    { sectionId: videoQuery.data?.sectionId ?? 0 },
    { enabled: !!videoQuery.data?.sectionId }
  );
  const bookmarksQuery = trpc.bookmarks.list.useQuery();
  const notesQuery = trpc.notes.byVideo.useQuery(
    { videoId: videoQuery.data?.id ?? 0 },
    { enabled: !!videoQuery.data?.id }
  );
  const streamTokenQuery = trpc.stream.token.useQuery(
    { videoId: videoQuery.data?.id ?? 0 },
    { enabled: !!(videoQuery.data?.id && (videoQuery.data as any).cloudflareStreamId) }
  );

  const updateProgress = trpc.progress.update.useMutation();
  const toggleBookmark = trpc.bookmarks.toggle.useMutation({
    onSuccess: (data) => {
      toast.success(data.isBookmarked ? "Bookmarked" : "Bookmark removed");
      bookmarksQuery.refetch();
    },
  });
  const createNote = trpc.notes.create.useMutation({
    onSuccess: () => { notesQuery.refetch(); setNoteText(""); setEditingNoteId(null); },
    onError: (e) => toast.error(e.message),
  });
  const updateNote = trpc.notes.update.useMutation({
    onSuccess: () => { notesQuery.refetch(); setEditingNoteId(null); setNoteText(""); },
  });
  const deleteNote = trpc.notes.delete.useMutation({
    onSuccess: () => notesQuery.refetch(),
  });

  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // Track progress every 10 seconds
  useEffect(() => {
    if (!videoQuery.data?.id) return;
    progressInterval.current = setInterval(() => {
      setWatchedSeconds(prev => {
        const newVal = prev + 10;
        updateProgress.mutate({
          videoId: videoQuery.data!.id,
          watchedSeconds: newVal,
          completed: videoQuery.data!.durationSeconds ? newVal >= videoQuery.data!.durationSeconds * 0.9 : false,
        });
        return newVal;
      });
    }, 10000);
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [videoQuery.data?.id]);

  useEffect(() => {
    if (progressQuery.data?.watchedSeconds) setWatchedSeconds(progressQuery.data.watchedSeconds);
  }, [progressQuery.data]);

  const isBookmarked = useMemo(() => {
    if (!bookmarksQuery.data || !videoQuery.data) return false;
    return bookmarksQuery.data.some(b => b.videoId === videoQuery.data!.id);
  }, [bookmarksQuery.data, videoQuery.data]);

  const sectionVideos = allVideosInSectionQuery.data ?? [];
  const currentIndex = sectionVideos.findIndex(v => v.slug === slug);
  const nextVideo = currentIndex >= 0 && currentIndex < sectionVideos.length - 1 ? sectionVideos[currentIndex + 1] : null;
  const prevVideo = currentIndex > 0 ? sectionVideos[currentIndex - 1] : null;

  if (loading || videoQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const video = videoQuery.data;
  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Video not found</p>
          <Link href="/courses"><Button variant="outline">Back to Courses</Button></Link>
        </div>
      </div>
    );
  }

  // Determine video source: Cloudflare Stream takes precedence over Google Drive
  const hasStream = !!(video as any).cloudflareStreamId;
  const getEmbedUrl = () => {
    if (hasStream && streamTokenQuery.data?.token) {
      const streamSubdomain = import.meta.env.VITE_CF_STREAM_CUSTOMER ?? "customer-stream";
      return `https://${streamSubdomain}.cloudflarestream.com/${streamTokenQuery.data.token}/iframe`;
    }
    if (video.googleDriveFileId) {
      return `https://drive.google.com/file/d/${video.googleDriveFileId}/preview`;
    }
    if (video.googleDriveUrl) {
      const match = video.googleDriveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
      return video.googleDriveUrl;
    }
    return null;
  };
  const embedUrl = getEmbedUrl();

  const handleSaveNote = () => {
    if (!noteText.trim() || !video.id) return;
    if (editingNoteId !== null) {
      updateNote.mutate({ id: editingNoteId, content: noteText.trim() });
    } else {
      createNote.mutate({ videoId: video.id, content: noteText.trim() });
    }
  };

  const pct = video.durationSeconds ? Math.min(100, Math.round((watchedSeconds / video.durationSeconds) * 100)) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header */}
      <div className="border-b border-border/50 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container py-2.5 flex items-center gap-3">
          <Link href={video.sectionSlug ? `/courses/${video.sectionSlug}` : "/courses"}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-base tracking-wide text-foreground truncate">{video.title}</h1>
            {video.durationSeconds && (
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {prevVideo && (
              <Link href={`/video/${prevVideo.slug}`}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs gap-1">
                  ← Prev
                </Button>
              </Link>
            )}
            {nextVideo && (
              <Link href={`/video/${nextVideo.slug}`}>
                <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 text-xs gap-1">
                  Next <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost" size="icon"
              onClick={() => toggleBookmark.mutate({ videoId: video.id })}
              className={`h-8 w-8 ${isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout: 65/35 split on desktop */}
      <div className="flex-1 container py-6 max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 h-full">

          {/* Left — Video Player (65%) */}
          <div className="lg:w-[65%]">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
              {hasStream && streamTokenQuery.isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                </div>
              ) : hasStream && streamTokenQuery.isError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center px-6">
                    <AlertCircle className="h-10 w-10 text-destructive/60 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-3">Could not load video stream.</p>
                    <button
                      onClick={() => streamTokenQuery.refetch()}
                      className="text-xs text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  sandbox={hasStream ? "allow-scripts allow-same-origin allow-forms allow-presentation" : "allow-scripts allow-same-origin allow-popups allow-forms"}
                  style={{ border: "none" }}
                  title={video.title}
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">No video source configured</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section playlist — prev/next in section */}
            {sectionVideos.length > 1 && (
              <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
                <p className="text-xs text-muted-foreground/60 tracking-widest uppercase px-4 pt-3 pb-1">In this section</p>
                <div className="divide-y divide-border/30 max-h-48 overflow-y-auto">
                  {sectionVideos.map((v, i) => {
                    const isCurrent = v.slug === slug;
                    return (
                      <Link key={v.id} href={`/video/${v.slug}`}>
                        <div className={`flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer ${isCurrent ? "bg-primary/10 text-primary" : "hover:bg-accent/30 text-foreground"}`}>
                          <span className="text-xs text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                          <span className={`text-sm flex-1 truncate ${isCurrent ? "text-primary font-medium" : ""}`}>{v.title}</span>
                          {v.durationSeconds && <span className="text-xs text-muted-foreground flex-shrink-0">{formatDuration(v.durationSeconds)}</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right — Info Tabs (35%) */}
          <div className="lg:w-[35%]">
            <Tabs defaultValue="description" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-3 bg-muted/40 border border-border/50 rounded-xl p-1 mb-4">
                <TabsTrigger value="description" className="text-xs data-[state=active]:bg-card data-[state=active]:text-primary rounded-lg">Info</TabsTrigger>
                <TabsTrigger value="resources" className="text-xs data-[state=active]:bg-card data-[state=active]:text-primary rounded-lg">
                  Resources {video.resources?.length ? `(${video.resources.length})` : ""}
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs data-[state=active]:bg-card data-[state=active]:text-primary rounded-lg">
                  Notes {(notesQuery.data?.length ?? 0) > 0 ? `(${notesQuery.data!.length})` : ""}
                </TabsTrigger>
              </TabsList>

              {/* Description tab */}
              <TabsContent value="description" className="flex-1 overflow-y-auto space-y-4">
                <div>
                  <h2 className="font-serif text-xl text-foreground tracking-wide mb-3">{video.title}</h2>
                  {video.durationSeconds && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                      <Clock className="h-3 w-3" /> {formatDuration(video.durationSeconds)}
                    </p>
                  )}
                  {video.description ? (
                    <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{video.description}</div>
                  ) : (
                    <p className="text-muted-foreground/50 text-sm italic">No description.</p>
                  )}
                </div>

                {video.subtitleUrl && (
                  <div className="pt-3 border-t border-border/30">
                    <a href={video.subtitleUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      Download subtitles (.vtt)
                    </a>
                  </div>
                )}

                {/* Related */}
                {video.relatedVideos?.length > 0 && (
                  <div className="pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground/60 tracking-widest uppercase mb-2">Related</p>
                    <div className="space-y-2">
                      {video.relatedVideos.map((related: any) => (
                        <Link key={related.id} href={`/video/${related.slug}`}>
                          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer group">
                            <Play className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate">{related.title}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Resources tab */}
              <TabsContent value="resources" className="flex-1 overflow-y-auto">
                {video.resources?.length > 0 ? (
                  <div className="space-y-2">
                    {video.resources.map((res: any) => (
                      <a key={res.id} href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="block group">
                        <div className="bg-card/50 border border-border/50 rounded-lg p-3 hover:border-primary/40 transition-all flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground group-hover:text-primary transition-colors truncate">{res.title}</p>
                            {res.description && <p className="text-xs text-muted-foreground truncate">{res.description}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground uppercase flex-shrink-0">{res.fileType}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground/50 text-sm">No resources attached to this video.</p>
                  </div>
                )}
              </TabsContent>

              {/* Notes tab */}
              <TabsContent value="notes" className="flex-1 overflow-y-auto flex flex-col gap-3">
                {/* Note input */}
                <div className="bg-card/50 border border-border/50 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder={editingNoteId ? "Edit note…" : "Add a note for this video…"}
                      rows={3}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                    {editingNoteId !== null && (
                      <Button size="sm" variant="ghost" className="text-xs text-muted-foreground h-7 px-2"
                        onClick={() => { setEditingNoteId(null); setNoteText(""); }}>
                        <X className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    )}
                    <Button size="sm"
                      className="ml-auto h-7 px-3 text-xs bg-primary/20 text-primary hover:bg-primary/30"
                      disabled={!noteText.trim() || createNote.isPending || updateNote.isPending}
                      onClick={handleSaveNote}>
                      <Plus className="h-3 w-3 mr-1" />
                      {editingNoteId !== null ? "Save" : "Add Note"}
                    </Button>
                  </div>
                </div>

                {/* Notes list */}
                {notesQuery.isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin h-5 w-5 text-primary" /></div>
                ) : notesQuery.isError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-5 w-5 text-destructive/50 mx-auto mb-2" />
                    <p className="text-muted-foreground/50 text-sm">Could not load notes.</p>
                    <button onClick={() => notesQuery.refetch()} className="text-xs text-primary hover:underline mt-1">Retry</button>
                  </div>
                ) : notesQuery.data?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground/50 text-sm">No notes yet. Add one above.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notesQuery.data?.map((note: any) => (
                      <div key={note.id} className="bg-card/50 border border-border/30 rounded-lg p-3 group">
                        {note.timestampSeconds != null && (
                          <p className="text-xs text-primary mb-1 font-mono">{formatTimestamp(note.timestampSeconds)}</p>
                        )}
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                            onClick={() => { setEditingNoteId(note.id); setNoteText(note.content); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => { if (confirm("Delete this note?")) deleteNote.mutate({ id: note.id }); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-muted-foreground/40 ml-auto">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

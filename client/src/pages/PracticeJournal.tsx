import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, ArrowLeft, StickyNote, Clock, Pencil, Trash2, X, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTimestamp(s?: number | null) {
  if (s == null) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PracticeJournal() {
  const { loading } = useAuth();
  const notesQuery = trpc.notes.all.useQuery();
  const recentQuery = trpc.progress.recent.useQuery({ limit: 10 });
  const updateNote = trpc.notes.update.useMutation({ onSuccess: () => { notesQuery.refetch(); setEditingId(null); setEditText(""); } });
  const deleteNote = trpc.notes.delete.useMutation({ onSuccess: () => { toast.success("Note deleted"); notesQuery.refetch(); } });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  if (loading || notesQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const notes = notesQuery.data ?? [];
  const recentVideos = recentQuery.data ?? [];

  // Group notes by video
  const notesByVideo = notes.reduce<Record<number, typeof notes>>((acc, note) => {
    if (!acc[note.videoId]) acc[note.videoId] = [];
    acc[note.videoId].push(note);
    return acc;
  }, {});

  const videoIds = Object.keys(notesByVideo).map(Number);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container py-3 flex items-center gap-3">
          <Link href="/courses">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-serif text-lg tracking-wider text-foreground">Practice Journal</h1>
        </div>
      </nav>

      <div className="container max-w-4xl mx-auto py-10 px-6">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left — Recent Activity */}
          <div className="lg:col-span-1">
            <h2 className="font-serif text-base tracking-wide text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </h2>
            {recentVideos.length === 0 ? (
              <p className="text-muted-foreground/50 text-sm">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {recentVideos.map((item: any) => {
                  if (!item.video) return null;
                  const pct = item.video.durationSeconds
                    ? Math.min(100, Math.round((item.watchedSeconds / item.video.durationSeconds) * 100))
                    : 0;
                  return (
                    <Link key={item.videoId} href={`/video/${item.video.slug}`}>
                      <div className="group bg-card/50 border border-border/50 rounded-lg p-3 hover:border-primary/40 transition-all cursor-pointer">
                        <p className="text-sm text-foreground group-hover:text-primary transition-colors truncate">{item.video.title}</p>
                        <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(item.lastWatchedAt)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right — Notes */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-base tracking-wide text-foreground mb-4 flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-primary" /> Your Notes
              <span className="text-xs text-muted-foreground font-sans ml-1">({notes.length})</span>
            </h2>

            {notes.length === 0 ? (
              <div className="text-center py-16 bg-card/30 border border-border/40 rounded-xl">
                <StickyNote className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No notes yet.</p>
                <p className="text-muted-foreground/50 text-xs mt-1">Open a video and add notes from the Notes tab.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {notes.map((note: any) => (
                  <div key={note.id} className="bg-card/50 border border-border/50 rounded-xl p-4 group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {note.timestampSeconds != null && (
                          <span className="text-xs text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded flex-shrink-0">
                            {formatTimestamp(note.timestampSeconds)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {editingId !== note.id && (
                          <>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                              onClick={() => { setEditingId(note.id); setEditText(note.content); }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => { if (confirm("Delete this note?")) deleteNote.mutate({ id: note.id }); }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingId === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          rows={3}
                          className="w-full bg-input/50 border border-border/50 rounded-lg p-2 text-sm text-foreground resize-none outline-none focus:border-primary/50"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs bg-primary/20 text-primary hover:bg-primary/30"
                            onClick={() => updateNote.mutate({ id: note.id, content: editText })}>
                            <Check className="h-3 w-3 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground"
                            onClick={() => { setEditingId(null); setEditText(""); }}>
                            <X className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

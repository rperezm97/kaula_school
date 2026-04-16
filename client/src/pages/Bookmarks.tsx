import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, ArrowLeft, Play, Bookmark } from "lucide-react";

export default function Bookmarks() {
  const { loading } = useAuth();
  const bookmarksQuery = trpc.bookmarks.list.useQuery();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container py-4 flex items-center gap-4">
          <Link href="/courses"><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-serif text-xl tracking-wider text-foreground">Bookmarks</h1>
        </div>
      </div>

      <div className="container py-8 max-w-3xl mx-auto">
        {bookmarksQuery.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : bookmarksQuery.data && bookmarksQuery.data.length > 0 ? (
          <div className="space-y-3">
            {bookmarksQuery.data.map(bm => (
              <Link key={bm.id} href={`/video/${bm.video?.slug || ""}`}>
                <div className="bg-card/50 border border-border/50 rounded-lg p-4 hover:border-primary/40 transition-all cursor-pointer flex items-center gap-4">
                  <Play className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground text-sm font-medium truncate">{bm.video?.title || "Unknown"}</h3>
                    {bm.video?.description && <p className="text-muted-foreground text-xs mt-0.5 truncate">{bm.video.description}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No bookmarks yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Bookmark videos to find them quickly later</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Loader2, ArrowLeft, Search, Play, FileText } from "lucide-react";

export default function SearchPage() {
  const { loading } = useAuth();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const searchQuery = trpc.courses.search.useQuery({ query: searchTerm }, { enabled: searchTerm.length >= 2 });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length >= 2) setSearchTerm(query);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container py-4 flex items-center gap-4">
          <Link href="/courses"><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos, resources..."
              className="bg-input/50 border-border/50 focus:border-primary"
              autoFocus
            />
            <Button type="submit" variant="outline" className="border-primary/30 text-primary"><Search className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>

      <div className="container py-8 max-w-3xl mx-auto">
        {searchQuery.isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>}

        {searchQuery.data && (
          <>
            {searchQuery.data.videos.length > 0 && (
              <div className="mb-8">
                <h2 className="font-serif text-lg text-foreground tracking-wide mb-3">Videos</h2>
                <div className="space-y-2">
                  {searchQuery.data.videos.map(v => (
                    <Link key={v.id} href={`/video/${v.slug}`}>
                      <div className="bg-card/50 border border-border/50 rounded-lg p-4 hover:border-primary/40 transition-all cursor-pointer flex items-center gap-3">
                        <Play className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-foreground text-sm font-medium truncate">{v.title}</h3>
                          {v.description && <p className="text-muted-foreground text-xs mt-0.5 truncate">{v.description}</p>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.data.resources.length > 0 && (
              <div>
                <h2 className="font-serif text-lg text-foreground tracking-wide mb-3">Resources</h2>
                <div className="space-y-2">
                  {searchQuery.data.resources.map(r => (
                    <a key={r.id} href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                      <div className="bg-card/50 border border-border/50 rounded-lg p-4 hover:border-primary/40 transition-all flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-foreground text-sm font-medium truncate">{r.title}</h3>
                          {r.description && <p className="text-muted-foreground text-xs mt-0.5 truncate">{r.description}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground uppercase">{r.fileType}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.data.videos.length === 0 && searchQuery.data.resources.length === 0 && (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
              </div>
            )}
          </>
        )}

        {!searchTerm && (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Search across all course content</p>
          </div>
        )}
      </div>
    </div>
  );
}

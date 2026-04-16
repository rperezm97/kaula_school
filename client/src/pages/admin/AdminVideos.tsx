import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const defaultForm = {
  title: "", slug: "", description: "", sectionId: 0,
  googleDriveUrl: "", googleDriveFileId: "", cloudflareStreamId: "", subtitleUrl: "",
  durationSeconds: 0, sortOrder: 0, isVisible: true, requiredTier: "none" as string,
};

export default function AdminVideos() {
  const videosQuery = trpc.admin.videos.useQuery();
  const sectionsQuery = trpc.admin.sections.useQuery();
  const createMutation = trpc.admin.createVideo.useMutation({
    onSuccess: () => { toast.success("Video created"); videosQuery.refetch(); setOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.admin.updateVideo.useMutation({
    onSuccess: () => { toast.success("Video updated"); videosQuery.refetch(); setEditOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.admin.deleteVideo.useMutation({
    onSuccess: () => { toast.success("Video deleted"); videosQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [editForm, setEditForm] = useState<any>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      sectionId: form.sectionId,
      durationSeconds: form.durationSeconds || undefined,
      googleDriveFileId: form.googleDriveFileId || undefined,
      cloudflareStreamId: form.cloudflareStreamId || undefined,
      subtitleUrl: form.subtitleUrl || undefined,
      requiredTier: form.requiredTier as any,
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    updateMutation.mutate({
      id: editForm.id,
      title: editForm.title,
      slug: editForm.slug,
      description: editForm.description,
      sectionId: editForm.sectionId,
      googleDriveUrl: editForm.googleDriveUrl,
      googleDriveFileId: editForm.googleDriveFileId || undefined,
      cloudflareStreamId: editForm.cloudflareStreamId || undefined,
      subtitleUrl: editForm.subtitleUrl || undefined,
      durationSeconds: editForm.durationSeconds || undefined,
      sortOrder: editForm.sortOrder,
      isVisible: editForm.isVisible,
      requiredTier: editForm.requiredTier as any,
    });
  };

  return (
    <AdminLayout title="Videos">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">{videosQuery.data?.length || 0} videos</p>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setForm({...defaultForm}); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Video</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif text-foreground">New Video</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="bg-input/50 border-border/50" /></div>
                <div><Label className="text-foreground/80 text-sm">Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required className="bg-input/50 border-border/50" placeholder="intro-to-tantra" /></div>
              </div>
              <div><Label className="text-foreground/80 text-sm">Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-input/50 border-border/50" /></div>
              <div><Label className="text-foreground/80 text-sm">Section</Label>
                <Select value={form.sectionId ? String(form.sectionId) : "0"} onValueChange={v => setForm({...form, sectionId: parseInt(v)})}>
                  <SelectTrigger className="bg-input/50 border-border/50"><SelectValue placeholder="Select section" /></SelectTrigger>
                  <SelectContent className="bg-card border-border/50">
                    {sectionsQuery.data?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.parentId ? "  ↳ " : ""}{s.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-foreground/80 text-sm">Cloudflare Stream ID</Label><Input value={form.cloudflareStreamId} onChange={e => setForm({...form, cloudflareStreamId: e.target.value})} className="bg-input/50 border-border/50" placeholder="abc123def… (use this instead of Drive for new videos)" /></div>
              <div><Label className="text-foreground/80 text-sm">Google Drive URL (legacy)</Label><Input value={form.googleDriveUrl} onChange={e => setForm({...form, googleDriveUrl: e.target.value})} className="bg-input/50 border-border/50" placeholder="https://drive.google.com/file/d/..." /></div>
              <div><Label className="text-foreground/80 text-sm">Google Drive File ID (auto-extracted)</Label><Input value={form.googleDriveFileId} onChange={e => setForm({...form, googleDriveFileId: e.target.value})} className="bg-input/50 border-border/50" placeholder="1a2b3c4d5e..." /></div>
              <div><Label className="text-foreground/80 text-sm">Subtitle URL (.vtt)</Label><Input value={form.subtitleUrl} onChange={e => setForm({...form, subtitleUrl: e.target.value})} className="bg-input/50 border-border/50" placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">Duration (seconds)</Label><Input type="number" value={form.durationSeconds} onChange={e => setForm({...form, durationSeconds: parseInt(e.target.value)||0})} className="bg-input/50 border-border/50" /></div>
                <div><Label className="text-foreground/80 text-sm">Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value)||0})} className="bg-input/50 border-border/50" /></div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Create Video
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {videosQuery.isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-accent/20">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Section</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Duration</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Visible</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videosQuery.data?.map(video => (
                  <tr key={video.id} className="border-b border-border/30 hover:bg-accent/10">
                    <td className="px-4 py-3 text-foreground">{video.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sectionsQuery.data?.find(s => s.id === video.sectionId)?.title || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{video.durationSeconds ? `${Math.floor(video.durationSeconds/60)}:${(video.durationSeconds%60).toString().padStart(2,'0')}` : "—"}</td>
                    <td className="px-4 py-3">{video.isVisible ? <Eye className="h-4 w-4 text-primary/60" /> : <EyeOff className="h-4 w-4 text-muted-foreground/40" />}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => { setEditForm({...video}); setEditOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => { if (confirm("Delete this video?")) deleteMutation.mutate({ id: video.id }); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!videosQuery.data || videosQuery.data.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">No videos yet. Add your first video.</div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border/50 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-serif text-foreground">Edit Video</DialogTitle></DialogHeader>
          {editForm && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">Title</Label><Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required className="bg-input/50 border-border/50" /></div>
                <div><Label className="text-foreground/80 text-sm">Slug</Label><Input value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})} required className="bg-input/50 border-border/50" /></div>
              </div>
              <div><Label className="text-foreground/80 text-sm">Description</Label><Input value={editForm.description || ""} onChange={e => setEditForm({...editForm, description: e.target.value})} className="bg-input/50 border-border/50" /></div>
              <div><Label className="text-foreground/80 text-sm">Cloudflare Stream ID</Label><Input value={editForm.cloudflareStreamId || ""} onChange={e => setEditForm({...editForm, cloudflareStreamId: e.target.value})} className="bg-input/50 border-border/50" placeholder="abc123… (takes priority over Drive)" /></div>
              <div><Label className="text-foreground/80 text-sm">Google Drive URL (legacy)</Label><Input value={editForm.googleDriveUrl || ""} onChange={e => setEditForm({...editForm, googleDriveUrl: e.target.value})} className="bg-input/50 border-border/50" /></div>
              <div><Label className="text-foreground/80 text-sm">Google Drive File ID</Label><Input value={editForm.googleDriveFileId || ""} onChange={e => setEditForm({...editForm, googleDriveFileId: e.target.value})} className="bg-input/50 border-border/50" /></div>
              <div><Label className="text-foreground/80 text-sm">Subtitle URL (.vtt)</Label><Input value={editForm.subtitleUrl || ""} onChange={e => setEditForm({...editForm, subtitleUrl: e.target.value})} className="bg-input/50 border-border/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">Duration (seconds)</Label><Input type="number" value={editForm.durationSeconds || 0} onChange={e => setEditForm({...editForm, durationSeconds: parseInt(e.target.value)||0})} className="bg-input/50 border-border/50" /></div>
                <div><Label className="text-foreground/80 text-sm">Sort Order</Label><Input type="number" value={editForm.sortOrder} onChange={e => setEditForm({...editForm, sortOrder: parseInt(e.target.value)||0})} className="bg-input/50 border-border/50" /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editForm.isVisible} onChange={e => setEditForm({...editForm, isVisible: e.target.checked})} className="accent-primary" />
                <Label className="text-foreground/80 text-sm">Visible</Label>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

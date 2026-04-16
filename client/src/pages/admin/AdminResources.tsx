import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const defaultForm = { title: "", description: "", fileUrl: "", fileType: "pdf", sectionId: 0, videoId: null as number | null, sortOrder: 0, requiredTier: "none" as string };

export default function AdminResources() {
  const resourcesQuery = trpc.admin.resources.useQuery();
  const sectionsQuery = trpc.admin.sections.useQuery();
  const videosQuery = trpc.admin.videos.useQuery();
  const createMutation = trpc.admin.createResource.useMutation({ onSuccess: () => { toast.success("Resource created"); resourcesQuery.refetch(); setOpen(false); }, onError: (err) => toast.error(err.message) });
  const updateMutation = trpc.admin.updateResource.useMutation({ onSuccess: () => { toast.success("Resource updated"); resourcesQuery.refetch(); setEditOpen(false); }, onError: (err) => toast.error(err.message) });
  const deleteMutation = trpc.admin.deleteResource.useMutation({ onSuccess: () => { toast.success("Resource deleted"); resourcesQuery.refetch(); }, onError: (err) => toast.error(err.message) });

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [editForm, setEditForm] = useState<any>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, sectionId: form.sectionId || undefined, videoId: form.videoId || undefined, requiredTier: form.requiredTier as any });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    updateMutation.mutate({ id: editForm.id, title: editForm.title, description: editForm.description, fileUrl: editForm.fileUrl, fileType: editForm.fileType, sortOrder: editForm.sortOrder, requiredTier: editForm.requiredTier as any });
  };

  return (
    <AdminLayout title="Resources">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">{resourcesQuery.data?.length || 0} resources</p>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setForm({...defaultForm}); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-lg">
            <DialogHeader><DialogTitle className="font-serif text-foreground">New Resource</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><Label className="text-foreground/80 text-sm">Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="bg-input/50 border-border/50" /></div>
              <div><Label className="text-foreground/80 text-sm">Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-input/50 border-border/50" /></div>
              <div><Label className="text-foreground/80 text-sm">File URL (Google Drive, S3, etc.)</Label><Input value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} required className="bg-input/50 border-border/50" placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">File Type</Label>
                  <Select value={form.fileType} onValueChange={v => setForm({...form, fileType: v})}>
                    <SelectTrigger className="bg-input/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="doc">Document</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-foreground/80 text-sm">Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value)||0})} className="bg-input/50 border-border/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">Section</Label>
                  <Select value={form.sectionId ? String(form.sectionId) : "0"} onValueChange={v => setForm({...form, sectionId: parseInt(v)||0})}>
                    <SelectTrigger className="bg-input/50 border-border/50"><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      <SelectItem value="0">None</SelectItem>
                      {sectionsQuery.data?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-foreground/80 text-sm">Linked Video</Label>
                  <Select value={form.videoId ? String(form.videoId) : "0"} onValueChange={v => setForm({...form, videoId: parseInt(v)||null})}>
                    <SelectTrigger className="bg-input/50 border-border/50"><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      <SelectItem value="0">None</SelectItem>
                      {videosQuery.data?.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Create Resource
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {resourcesQuery.isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-accent/20">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Section</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resourcesQuery.data?.map(resource => (
                  <tr key={resource.id} className="border-b border-border/30 hover:bg-accent/10">
                    <td className="px-4 py-3 text-foreground">{resource.title}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs bg-accent/50 text-muted-foreground uppercase">{resource.fileType}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{sectionsQuery.data?.find(s => s.id === resource.sectionId)?.title || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={() => { setEditForm({...resource}); setEditOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: resource.id }); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!resourcesQuery.data || resourcesQuery.data.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">No resources yet.</div>
          )}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border/50 max-w-lg">
          <DialogHeader><DialogTitle className="font-serif text-foreground">Edit Resource</DialogTitle></DialogHeader>
          {editForm && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div><Label className="text-foreground/80 text-sm">Title</Label><Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required className="bg-input/50 border-border/50" /></div>
              <div><Label className="text-foreground/80 text-sm">Description</Label><Input value={editForm.description || ""} onChange={e => setEditForm({...editForm, description: e.target.value})} className="bg-input/50 border-border/50" /></div>
              <div><Label className="text-foreground/80 text-sm">File URL</Label><Input value={editForm.fileUrl} onChange={e => setEditForm({...editForm, fileUrl: e.target.value})} required className="bg-input/50 border-border/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">Sort Order</Label><Input type="number" value={editForm.sortOrder} onChange={e => setEditForm({...editForm, sortOrder: parseInt(e.target.value)||0})} className="bg-input/50 border-border/50" /></div>
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

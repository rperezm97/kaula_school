import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

export default function AdminSections() {
  const sectionsQuery = trpc.admin.sections.useQuery();
  const createMutation = trpc.admin.createSection.useMutation({ onSuccess: () => { toast.success("Section created"); sectionsQuery.refetch(); setOpen(false); } });
  const updateMutation = trpc.admin.updateSection.useMutation({ onSuccess: () => { toast.success("Section updated"); sectionsQuery.refetch(); setEditOpen(false); } });
  const deleteMutation = trpc.admin.deleteSection.useMutation({ onSuccess: () => { toast.success("Section deleted"); sectionsQuery.refetch(); } });

  const moveSection = (id: number, direction: "up" | "down") => {
    const sections = sectionsQuery.data ?? [];
    const topLevel = sections.filter(s => !s.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = topLevel.findIndex(s => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= topLevel.length) return;
    const a = topLevel[idx];
    const b = topLevel[swapIdx];
    updateMutation.mutate({ id: a.id, sortOrder: b.sortOrder });
    updateMutation.mutate({ id: b.id, sortOrder: a.sortOrder });
  };

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", description: "", iconName: "FolderOpen", sortOrder: 0, parentId: null as number | null, requiredTier: "none" as string, isVisible: true });
  const [editForm, setEditForm] = useState<any>(null);

  const resetForm = () => setForm({ title: "", slug: "", description: "", iconName: "FolderOpen", sortOrder: 0, parentId: null, requiredTier: "none", isVisible: true });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, parentId: form.parentId || null, requiredTier: form.requiredTier as any });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    updateMutation.mutate({ id: editForm.id, title: editForm.title, slug: editForm.slug, description: editForm.description, iconName: editForm.iconName, sortOrder: editForm.sortOrder, parentId: editForm.parentId || null, requiredTier: editForm.requiredTier as any, isVisible: editForm.isVisible });
  };

  return (
    <AdminLayout title="Sections">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">{sectionsQuery.data?.length || 0} sections</p>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Section</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader><DialogTitle className="font-serif text-foreground">New Section</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="bg-input/50 border-border/50" /></div>
                <div><Label className="text-foreground/80 text-sm">Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required className="bg-input/50 border-border/50" placeholder="start-here" /></div>
              </div>
              <div><Label className="text-foreground/80 text-sm">Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-input/50 border-border/50" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="text-foreground/80 text-sm">Icon</Label>
                  <Select value={form.iconName} onValueChange={v => setForm({...form, iconName: v})}>
                    <SelectTrigger className="bg-input/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      {["Compass","BookOpen","Sparkles","Eye","Video","FolderOpen"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-foreground/80 text-sm">Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value)||0})} className="bg-input/50 border-border/50" /></div>
                <div><Label className="text-foreground/80 text-sm">Parent</Label>
                  <Select value={form.parentId ? String(form.parentId) : "none"} onValueChange={v => setForm({...form, parentId: v === "none" ? null : parseInt(v)})}>
                    <SelectTrigger className="bg-input/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      <SelectItem value="none">None (top level)</SelectItem>
                      {sectionsQuery.data?.filter(s => !s.parentId).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Create Section
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sectionsQuery.isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {sectionsQuery.data?.map(section => (
            <div key={section.id} className={`bg-card/50 border border-border/50 rounded-lg p-4 flex items-center justify-between ${section.parentId ? "ml-8" : ""}`}>
              <div className="flex items-center gap-3">
                {section.isVisible ? <Eye className="h-4 w-4 text-primary/60" /> : <EyeOff className="h-4 w-4 text-muted-foreground/40" />}
                <div>
                  <p className="text-foreground text-sm font-medium">{section.title}</p>
                  <p className="text-muted-foreground text-xs">/{section.slug} · Order: {section.sortOrder}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!section.parentId && (
                  <>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      onClick={() => moveSection(section.id, "up")}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      onClick={() => moveSection(section.id, "down")}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                  onClick={() => { setEditForm({...section}); setEditOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => { if (confirm("Delete this section?")) deleteMutation.mutate({ id: section.id }); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader><DialogTitle className="font-serif text-foreground">Edit Section</DialogTitle></DialogHeader>
          {editForm && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">Title</Label><Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required className="bg-input/50 border-border/50" /></div>
                <div><Label className="text-foreground/80 text-sm">Slug</Label><Input value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})} required className="bg-input/50 border-border/50" /></div>
              </div>
              <div><Label className="text-foreground/80 text-sm">Description</Label><Input value={editForm.description || ""} onChange={e => setEditForm({...editForm, description: e.target.value})} className="bg-input/50 border-border/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-foreground/80 text-sm">Sort Order</Label><Input type="number" value={editForm.sortOrder} onChange={e => setEditForm({...editForm, sortOrder: parseInt(e.target.value)||0})} className="bg-input/50 border-border/50" /></div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={editForm.isVisible} onChange={e => setEditForm({...editForm, isVisible: e.target.checked})} className="accent-primary" />
                  <Label className="text-foreground/80 text-sm">Visible</Label>
                </div>
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

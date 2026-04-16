import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Send, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AdminEmails() {
  const emailsQuery = trpc.admin.emailLogs.useQuery({});
  // Bulk email sending - placeholder until Resend is configured
  const handleSendBulk = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Bulk email sending requires Resend API key. Configure RESEND_API_KEY in your environment.");
    setOpen(false);
  };

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "subscribers">("subscribers");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendBulk(e);
  };

  return (
    <AdminLayout title="Email Log">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">{emailsQuery.data?.length || 0} emails sent</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground"><Send className="h-4 w-4 mr-2" /> Send Email</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-lg">
            <DialogHeader><DialogTitle className="font-serif text-foreground">Send Bulk Email</DialogTitle></DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <Label className="text-foreground/80 text-sm">Target</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                    <input type="radio" checked={target === "subscribers"} onChange={() => setTarget("subscribers")} className="accent-primary" />
                    Active Subscribers
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                    <input type="radio" checked={target === "all"} onChange={() => setTarget("all")} className="accent-primary" />
                    All Users
                  </label>
                </div>
              </div>
              <div><Label className="text-foreground/80 text-sm">Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} required className="bg-input/50 border-border/50" /></div>
              <div>
                <Label className="text-foreground/80 text-sm">Body (HTML supported)</Label>
                <textarea value={body} onChange={e => setBody(e.target.value)} required className="w-full bg-input/50 border border-border/50 rounded-md p-3 text-foreground text-sm min-h-[120px] focus:border-primary outline-none" />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" > Send
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {emailsQuery.isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-accent/20">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">To</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Subject</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {emailsQuery.data?.map((email: any) => (
                  <tr key={email.id} className="border-b border-border/30 hover:bg-accent/10">
                    <td className="px-4 py-3 text-foreground">{email.toEmail}</td>
                    <td className="px-4 py-3 text-foreground truncate max-w-[200px]">{email.subject}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs bg-accent/50 text-muted-foreground">{email.emailType}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${email.status === "sent" ? "bg-green-500/20 text-green-400" : email.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {email.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{email.sentAt ? new Date(email.sentAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!emailsQuery.data || emailsQuery.data.length === 0) && (
            <div className="text-center py-10 text-muted-foreground">
              <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              No emails sent yet.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

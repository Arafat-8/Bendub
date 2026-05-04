
'use client';

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { logAdminAction } from "@/firebase/activity-logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Ticket, 
  Trash2, 
  Calendar, 
  Users, 
  Copy,
  CheckCircle2,
  Clock
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function InviteManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  
  const [limit, setLimit] = useState(1);
  const [expiryDays, setExpiryDays] = useState(7);

  const invitesRef = useMemoFirebase(() => collection(firestore, "invites"), [firestore]);
  const { data: invites, isLoading } = useCollection(invitesRef);

  const handleGenerate = () => {
    const id = crypto.randomUUID();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const docRef = doc(firestore, "invites", id);
    
    const expiryDate = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);

    setDocumentNonBlocking(docRef, {
      id,
      code,
      usageLimit: limit,
      usedCount: 0,
      expiryDate,
      isActive: true,
      createdBy: currentUser?.email || "System",
      createdAt: Date.now()
    }, { merge: true });

    logAdminAction(firestore, {
      action: "INVITE_GENERATED",
      details: `Created code ${code} (Limit: ${limit})`,
      adminEmail: currentUser?.email || "System",
    });

    toast({ title: "Invite Code Ready", description: `Code ${code} has been registered.` });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to Clipboard" });
  };

  const handleDelete = (id: string, code: string) => {
    if (!confirm(`Revoke invite code ${code}?`)) return;
    deleteDocumentNonBlocking(doc(firestore, "invites", id));
    toast({ title: "Invite Revoked" });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter font-headline uppercase">Invite System</h1>
          <p className="text-muted-foreground font-medium">Generate expiring links to onboard new members to the vault.</p>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Generate Link</CardTitle>
            <CardDescription className="font-medium text-xs">Create a new access protocol code.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 space-y-6">
            <div className="space-y-3">
              <Label className="font-black text-[10px] tracking-widest uppercase ml-1">Usage Limit</Label>
              <Input 
                type="number" 
                value={limit} 
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="h-14 rounded-2xl bg-muted/20 border-white/5"
              />
            </div>
            <div className="space-y-3">
              <Label className="font-black text-[10px] tracking-widest uppercase ml-1">Expiry (Days)</Label>
              <Input 
                type="number" 
                value={expiryDays} 
                onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                className="h-14 rounded-2xl bg-muted/20 border-white/5"
              />
            </div>
            <Button onClick={handleGenerate} className="w-full h-14 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
              <Plus className="mr-2 h-4 w-4" />
              Generate Invite
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Active Codes</CardTitle>
            <CardDescription className="font-medium text-xs">Managed access tokens for the infrastructure.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-20 text-center text-muted-foreground animate-pulse font-black uppercase tracking-widest text-xs">Scanning logs...</div>
            ) : invites && invites.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-8">Protocol Code</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Usage</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-6 pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => {
                    const isExpired = invite.expiryDate < Date.now();
                    const isExhausted = invite.usedCount >= invite.usageLimit;
                    return (
                      <TableRow key={invite.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="py-6 pl-8">
                          <div className="flex items-center gap-3">
                            <span className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-primary font-mono text-xs font-black tracking-widest shadow-inner">
                              {invite.code}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(invite.code)}>
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                           <div className="flex items-center gap-2 text-xs font-bold">
                             <Users className="h-3.5 w-3.5 text-muted-foreground" />
                             {invite.usedCount} / {invite.usageLimit}
                           </div>
                        </TableCell>
                        <TableCell className="py-6">
                          {isExpired || isExhausted ? (
                            <span className="text-[9px] font-black uppercase text-destructive flex items-center gap-1.5">
                              <Clock className="h-3 w-3" /> Inactive
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-6 pr-8">
                           <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDelete(invite.id, invite.code)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-24 text-center text-muted-foreground italic font-medium">No active invite protocols in registry.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

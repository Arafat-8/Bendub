
'use client';

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { logAdminAction } from "@/firebase/activity-logger";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, UserPlus, ShieldCheck, Key, RefreshCw, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";

export default function WhitelistManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentAdmin } = useUser();
  const [email, setEmail] = useState("");

  const allowedRef = useMemoFirebase(() => collection(firestore, "allowed_users"), [firestore]);
  const { data: users, isLoading } = useCollection(allowedRef);

  const generateKey = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast({ variant: "destructive", title: "Invalid Protocol Identity" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const docRef = doc(firestore, "allowed_users", normalizedEmail);
    const accessKey = generateKey();

    setDocumentNonBlocking(docRef, {
      email: normalizedEmail,
      addedAt: Date.now(),
      accessKey,
    }, { merge: true });

    logAdminAction(firestore, {
      action: "IDENTITY_AUTHORIZED",
      details: `Granted access to ${normalizedEmail} with protocol key ${accessKey}`,
      adminEmail: currentAdmin?.email || "System",
    });

    setEmail("");
    toast({
      title: "Access Granted",
      description: `Protocol Key for ${normalizedEmail}: ${accessKey}`,
    });
  };

  const handleRegenerateKey = (userEmail: string) => {
    const docRef = doc(firestore, "allowed_users", userEmail);
    const newKey = generateKey();

    setDocumentNonBlocking(docRef, {
      accessKey: newKey,
    }, { merge: true });

    logAdminAction(firestore, {
      action: "KEY_REGENERATED",
      details: `New protocol key ${newKey} generated for ${userEmail}`,
      adminEmail: currentAdmin?.email || "System",
    });

    toast({
      title: "Key Updated",
      description: `New protocol key for ${userEmail}: ${newKey}`,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Revoke all access for this identity?")) return;
    
    const docRef = doc(firestore, "allowed_users", id);
    deleteDocumentNonBlocking(docRef);
    
    logAdminAction(firestore, {
      action: "IDENTITY_REVOKED",
      details: `Permanently revoked access for ${id}`,
      adminEmail: currentAdmin?.email || "System",
    });

    toast({
      title: "Identity Revoked",
    });
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tighter font-headline uppercase">Protocol Whitelist</h1>
        <p className="text-muted-foreground font-medium">Manage authorized identities and their corresponding access keys.</p>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        <Card className="md:col-span-1 border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Authorize Link</CardTitle>
            <CardDescription className="font-medium text-xs">Whitelist a new identity for vault access.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="font-black text-[10px] tracking-widest uppercase ml-1">Identity Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" />
                  <Input 
                    id="email" 
                    type="email"
                    className="h-14 rounded-2xl bg-muted/20 border-white/5 pl-12 focus-visible:ring-primary/30 font-medium"
                    placeholder="user@vault.bendub" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                <UserPlus className="mr-2 h-4 w-4" />
                Initialize Authorization
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Registry Logs</CardTitle>
            <CardDescription className="font-medium text-xs">Active identities and their synchronized protocol keys.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-20 text-center text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Scanning Registry...</div>
            ) : users && users.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-8">Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Protocol Key</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-6 pr-8">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-sm py-6 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-primary/10">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                          </div>
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-primary font-mono text-xs font-black tracking-widest shadow-inner">
                            {user.accessKey || "PENDING"}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-full hover:bg-primary/20 hover:text-primary transition-all"
                            onClick={() => handleRegenerateKey(user.id)}
                            title="Regenerate Protocol Key"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-6 pr-8">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl h-10 w-10"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-24 text-center text-muted-foreground flex flex-col items-center gap-6">
                <div className="p-6 rounded-full bg-white/5 border border-white/5">
                   <Key className="h-10 w-10 opacity-20" />
                </div>
                <p className="italic font-medium text-sm">Registry is empty. No external identities authorized.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

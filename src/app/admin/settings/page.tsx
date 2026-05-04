'use client';

import { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { logAdminAction } from "@/firebase/activity-logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Save, Loader2, Cloud, ExternalLink, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SystemSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "config"), [firestore]);
  const { data: settings, isLoading } = useDoc(settingsRef);
  
  const [newKey, setNewKey] = useState("");
  const [driveApiKey, setDriveApiKey] = useState("");

  useEffect(() => {
    if (settings?.googleDriveApiKey) {
      setDriveApiKey(settings.googleDriveApiKey);
    }
  }, [settings]);

  const handleUpdateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKey.length < 8) {
      toast({ variant: "destructive", title: "Security Risk", description: "Master key must be at least 8 characters." });
      return;
    }

    setLoading(true);
    setDocumentNonBlocking(settingsRef, {
      adminMasterKey: newKey,
    }, { merge: true });

    logAdminAction(firestore, {
      action: "MASTER_KEY_UPDATED",
      details: "System administrator master access key has been rotated.",
      adminEmail: "Lead Admin",
    });

    toast({ title: "Infrastructure Updated", description: "Master security key has been changed successfully." });
    setNewKey("");
    setLoading(false);
  };

  const handleUpdateDriveApi = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDocumentNonBlocking(settingsRef, {
      googleDriveApiKey: driveApiKey,
    }, { merge: true });

    logAdminAction(firestore, {
      action: "DRIVE_API_UPDATED",
      details: "Google Drive API Key has been updated for the sync engine.",
      adminEmail: "Lead Admin",
    });

    toast({ title: "Service Updated", description: "Google Drive API credentials have been synchronized." });
    setLoading(false);
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter font-headline uppercase">System Configuration</h1>
          <p className="text-muted-foreground font-medium">Manage core security protocols and infrastructure parameters.</p>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Master Access Protocol</CardTitle>
            <CardDescription className="font-medium text-xs">Rotate the primary entry key for the admin infrastructure.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleUpdateKey} className="space-y-6">
              <div className="space-y-3">
                <Label className="font-black text-[10px] tracking-widest uppercase ml-1">Current Protocol Status</Label>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-primary font-black tracking-widest">ENCRYPTED_ACTIVE</span>
                  <Shield className="h-4 w-4 text-primary" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="newKey" className="font-black text-[10px] tracking-widest uppercase ml-1">New Security Key</Label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" />
                  <Input 
                    id="newKey"
                    type="password"
                    className="h-14 rounded-2xl bg-muted/20 border-white/5 pl-12 focus-visible:ring-primary/30"
                    placeholder="Min 8 characters"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading || isLoading} className="w-full h-14 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                Commit Protocol Rotation
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Cloud Integrations</CardTitle>
                <CardDescription className="font-medium text-xs">Configure external service APIs for the sync engine.</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="glass p-4 max-w-xs space-y-2">
                    <p className="font-black text-[10px] uppercase tracking-widest text-primary">How to get a key:</p>
                    <ol className="text-[9px] list-decimal pl-4 space-y-1 font-medium">
                      <li>Go to Google Cloud Console.</li>
                      <li>Enable "Google Drive API".</li>
                      <li>Go to Credentials &gt; Create Credentials &gt; API Key.</li>
                      <li>Copy and paste here.</li>
                    </ol>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleUpdateDriveApi} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="driveApi" className="font-black text-[10px] tracking-widest uppercase">Google Drive API Key</Label>
                  <a 
                    href="https://console.cloud.google.com/apis/credentials" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                  >
                    Console <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
                <div className="relative">
                  <Cloud className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" />
                  <Input 
                    id="driveApi"
                    type="password"
                    className="h-14 rounded-2xl bg-muted/20 border-white/5 pl-12 focus-visible:ring-primary/30"
                    placeholder="Enter your Google Cloud API Key"
                    value={driveApiKey}
                    onChange={(e) => setDriveApiKey(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed px-1">
                  Required for scanning Drive folders. Ensure the <strong>Google Drive API</strong> is enabled in your Google Cloud Console.
                </p>
              </div>

              <Button type="submit" disabled={loading || isLoading} className="w-full h-14 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                Synchronize Credentials
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


'use client';

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { logAdminAction } from "@/firebase/activity-logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { 
  FolderPlus, 
  RefreshCw, 
  Trash2, 
  FolderOpen, 
  ShieldAlert, 
  Loader2, 
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { extractFolderId, fetchVideosFromFolder } from "@/lib/google-drive-sync";

const SERIES_TAGS = ["Classic", "Alien Force", "Ultimate Alien", "Omniverse", "Reboot", "Movies"];
const SEASONS = ["1", "2", "3", "4"];

export default function DriveFoldersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentAdmin } = useUser();
  const [folderUrl, setFolderUrl] = useState("");
  const [folderName, setFolderName] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  // Batch sync defaults
  const [defaultCategory, setDefaultCategory] = useState("Classic");
  const [defaultSeason, setDefaultSeason] = useState("1");

  const foldersRef = useMemoFirebase(() => collection(firestore, "drive_folders"), [firestore]);
  const { data: folders, isLoading } = useCollection(foldersRef);

  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "config"), [firestore]);
  const { data: settings } = useDoc(settingsRef);

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const driveId = extractFolderId(folderUrl);

    if (!driveId) {
      toast({ variant: "destructive", title: "Invalid Link", description: "Could not extract a valid Folder ID." });
      return;
    }

    const id = crypto.randomUUID();
    const docRef = doc(firestore, "drive_folders", id);

    setDocumentNonBlocking(docRef, {
      id,
      driveId,
      name: folderName || "Untitled Archive",
      category: defaultCategory,
      season: defaultSeason ? parseInt(defaultSeason) : null,
      createdAt: Date.now(),
      lastSyncedAt: null,
    }, { merge: true });

    logAdminAction(firestore, {
      action: "FOLDER_LINKED",
      details: `Linked Drive folder: ${folderName || driveId}`,
      adminEmail: currentAdmin?.email || "System",
    });

    setFolderUrl("");
    setFolderName("");
    toast({ title: "Folder Registered", description: "The folder is now ready for synchronization." });
  };

  const handleSync = async (folder: any) => {
    if (!settings?.googleDriveApiKey) {
      toast({ 
        variant: "destructive", 
        title: "API Key Missing", 
        description: "Please configure your Google Drive API Key in System Settings first." 
      });
      return;
    }

    setSyncingId(folder.id);
    try {
      const driveFiles = await fetchVideosFromFolder(folder.driveId, settings.googleDriveApiKey);
      
      let addedCount = 0;
      for (const file of driveFiles) {
        const videoId = `drive-${file.id}`;
        const videoRef = doc(firestore, "videos", videoId);
        
        setDocumentNonBlocking(videoRef, {
          id: videoId,
          title: file.name,
          link: `https://drive.google.com/file/d/${file.id}/view`,
          thumbnail: "https://picsum.photos/seed/drive/600/400", 
          category: folder.category || "Other",
          season: folder.season || null,
          driveFileId: file.id,
          parentFolderId: folder.id,
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }, { merge: true });
        
        addedCount++;
      }

      const folderRef = doc(firestore, "drive_folders", folder.id);
      setDocumentNonBlocking(folderRef, {
        lastSyncedAt: Date.now(),
      }, { merge: true });

      logAdminAction(firestore, {
        action: "FOLDER_SYNCED",
        details: `Synchronized ${addedCount} videos from ${folder.name}`,
        adminEmail: currentAdmin?.email || "System",
      });

      toast({
        title: "Synchronization Complete",
        description: `Successfully indexed ${addedCount} videos from the vault.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message,
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Unlink "${name}"? This will not delete the videos already indexed.`)) return;
    
    const docRef = doc(firestore, "drive_folders", id);
    deleteDocumentNonBlocking(docRef);
    
    logAdminAction(firestore, {
      action: "FOLDER_UNLINKED",
      details: `Removed folder link: ${name}`,
      adminEmail: currentAdmin?.email || "System",
    });

    toast({ title: "Folder Unlinked" });
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter font-headline uppercase">Drive Sync Engine</h1>
          <p className="text-muted-foreground font-medium">Link Google Drive folders to automatically index archives.</p>
        </div>
        {!settings?.googleDriveApiKey && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
            <ShieldAlert className="h-3 w-3" />
            Config Required: Drive API Key Missing
          </div>
        )}
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Link Vault</CardTitle>
            <CardDescription className="font-medium text-xs">Register a new Google Drive directory.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleAddFolder} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="folderUrl" className="font-black text-[10px] tracking-widest uppercase ml-1">Folder Link / ID</Label>
                <Input 
                  id="folderUrl" 
                  className="h-14 rounded-2xl bg-muted/20 border-white/5 focus-visible:ring-primary/30 font-medium"
                  placeholder="https://drive.google.com/drive/folders/..." 
                  value={folderUrl}
                  onChange={(e) => setFolderUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="folderName" className="font-black text-[10px] tracking-widest uppercase ml-1">Archive Name</Label>
                <Input 
                  id="folderName" 
                  className="h-14 rounded-2xl bg-muted/20 border-white/5 focus-visible:ring-primary/30 font-medium"
                  placeholder="e.g. Season 01 Archives" 
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="font-black text-[10px] tracking-widest uppercase ml-1">Series</Label>
                  <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      {SERIES_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="font-black text-[10px] tracking-widest uppercase ml-1">Season</Label>
                  <Select value={defaultSeason} onValueChange={setDefaultSeason} disabled={defaultCategory === "Movies"}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      {SEASONS.map(s => <SelectItem key={s} value={s}>S{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                <FolderPlus className="mr-2 h-4 w-4" />
                Initialize Link
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Linked Repositories</CardTitle>
            <CardDescription className="font-medium text-xs">Currently synchronized Google Drive sources.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-20 text-center text-muted-foreground animate-pulse font-black uppercase tracking-widest text-xs">Scanning registry...</div>
            ) : folders && folders.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-8">Archive Source</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Timeline Target</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-6 pr-8">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {folders.map((folder) => (
                    <TableRow key={folder.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-sm py-6 pl-8">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-white">{folder.name}</p>
                            <p className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">{folder.driveId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                           {folder.category} {folder.season ? `• S${folder.season}` : ""}
                         </span>
                      </TableCell>
                      <TableCell className="text-right py-6 pr-8">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-2xl hover:bg-primary/20 hover:text-primary"
                            onClick={() => handleSync(folder)}
                            disabled={syncingId === folder.id}
                          >
                            {syncingId === folder.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl h-10 w-10"
                            onClick={() => handleDelete(folder.id, folder.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-24 text-center text-muted-foreground italic font-medium">
                No Drive repositories linked to the vault.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

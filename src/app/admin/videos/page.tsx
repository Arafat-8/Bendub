'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
import { Trash2, Play, Video as VideoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function VideosManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentAdmin } = useUser();

  const videosRef = useMemoFirebase(() => collection(firestore, "videos"), [firestore]);
  const { data: videos, isLoading } = useCollection(videosRef);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    const docRef = doc(firestore, "videos", id);
    deleteDocumentNonBlocking(docRef);
    
    logAdminAction(firestore, {
      action: "VIDEO_DELETED",
      details: `Removed archive entry: ${title}`,
      adminEmail: currentAdmin?.email || "System",
    });

    toast({
      title: "Deletion initiated",
      description: "Video is being removed from the library.",
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter font-headline uppercase">Archive Library</h1>
          <p className="text-muted-foreground font-medium mt-1">Full registry of published high-definition experiences.</p>
        </div>
        <Button className="rounded-full h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20" asChild>
          <Link href="/admin/add">New Entry</Link>
        </Button>
      </div>

      <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Vault Contents</CardTitle>
          <CardDescription className="font-medium text-xs">Total synchronized archives in the repository.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center text-muted-foreground animate-pulse font-black uppercase tracking-widest text-xs">Scanning vault...</div>
          ) : videos && videos.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-white/5">
                  <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-widest py-4">Preview</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Protocol Title</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Classification</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Date</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="py-4">
                      <div className="h-14 w-24 bg-black rounded-xl overflow-hidden relative ring-1 ring-white/10">
                        <Image 
                          src={video.thumbnail} 
                          alt="" 
                          fill
                          className="object-cover opacity-60" 
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-sm text-white">{video.title}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] uppercase font-black tracking-widest border border-primary/20">
                        {video.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/20 hover:text-primary" asChild>
                          <Link href={`/video/${video.id}`} target="_blank">
                            <Play className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => handleDelete(video.id, video.title)}
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
            <div className="p-20 text-center text-muted-foreground italic font-medium flex flex-col items-center gap-4">
              <VideoIcon className="h-10 w-10 opacity-20" />
              Archive contains zero entries.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
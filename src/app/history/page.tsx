
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { VideoCard } from "@/components/video-card";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History as HistoryIcon, Trash2, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // Fetch all videos first to map history data
  const videosRef = useMemoFirebase(() => collection(firestore, "videos"), [firestore]);
  const { data: allVideos } = useCollection(videosRef);

  // Fetch History records
  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "users", user.uid, "history"),
      orderBy("lastWatched", "desc")
    );
  }, [firestore, user]);

  const { data: historyRecords, isLoading } = useCollection(historyQuery);

  // Map records to video objects
  const historyVideos = historyRecords?.map(record => {
    const video = allVideos?.find(v => v.id === record.videoId);
    return video ? { ...video, lastWatched: record.lastWatched } : null;
  }).filter(v => v !== null) || [];

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col font-body">
      <Navbar />
      
      <main className="flex-1 overflow-y-auto scrollbar-hide container mx-auto px-6 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-2">
              <HistoryIcon className="h-3 w-3" />
              Archive Retrieval
            </div>
            <h1 className="text-5xl font-black tracking-tighter font-headline uppercase italic">Watch History</h1>
            <p className="text-muted-foreground font-medium mt-1">Review your past mission logs and timeline engagements.</p>
          </div>
          <Button variant="outline" className="rounded-full border-white/5 bg-white/5 hover:bg-destructive hover:text-white transition-all font-black uppercase tracking-widest text-[10px] h-11 px-8">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-2xl bg-white/5" />
                <Skeleton className="h-4 w-3/4 bg-white/5" />
                <Skeleton className="h-3 w-1/2 bg-white/5" />
              </div>
            ))}
          </div>
        ) : historyVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {historyVideos.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-10 rounded-full bg-white/[0.02] border border-white/5 mb-8">
              <Clock className="h-16 w-16 text-muted-foreground/20" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Empty Timeline</h3>
            <p className="text-muted-foreground text-[11px] font-black uppercase tracking-widest mt-4 max-w-xs leading-relaxed">
              Your engagement logs are currently empty. Start a mission to populate the vault.
            </p>
            <Button className="mt-8 rounded-full bg-primary text-black font-black uppercase tracking-widest h-12 px-10 hover:bg-white" asChild>
              <Link href="/">Back to Library</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

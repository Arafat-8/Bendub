
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, where, limit } from "firebase/firestore";
import { VideoCard } from "@/components/video-card";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Home as HomeIcon, 
  Compass, 
  PlaySquare, 
  History, 
  Clock, 
  ThumbsUp, 
  ListVideo,
  Sparkles,
  Lock,
  PlayCircle,
  Database,
  Zap,
  LayoutGrid,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const SERIES_TAGS = ["All", "Classic", "Alien Force", "Ultimate Alien", "Omniverse", "Reboot", "Movies"];

export default function Home() {
  const [activeTag, setActiveTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // Fetch History for "Continue Watching"
  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "users", user.uid, "history"), 
      orderBy("lastWatched", "desc"),
      limit(6)
    );
  }, [firestore, user]);
  const { data: historyData } = useCollection(historyQuery);

  // Fetch all videos for the history lookup and main feed
  const videosQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const base = collection(firestore, "videos");
    
    if (activeTag === "All") {
      return query(base, orderBy("createdAt", "desc"));
    }
    return query(base, where("category", "==", activeTag));
  }, [firestore, activeTag, user]);
  
  const { data: videos, isLoading } = useCollection(videosQuery);

  // Filter videos by search query locally for performance
  const filteredVideos = videos?.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Map history to actual video objects
  const continueWatching = historyData?.map(h => {
    const video = videos?.find(v => v.id === h.videoId);
    return video ? { ...video, progress: h.progressSeconds } : null;
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
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col font-body selection:bg-primary/20 selection:text-primary">
      <Navbar onSearch={setSearchQuery} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col gap-2 p-4 overflow-y-auto scrollbar-hide border-r border-white/5 bg-[#0f0f0f]">
          <div className="space-y-1">
            <button 
              onClick={() => {
                setActiveTag("All");
                router.push("/");
              }}
              className={cn(
                "w-full yt-sidebar-item",
                activeTag === "All" && "active text-primary bg-primary/10"
              )}
            >
              <HomeIcon className="h-5 w-5" />
              Home
            </button>
            <Link href="/" className="yt-sidebar-item">
              <Compass className="h-5 w-5" />
              Explore
            </Link>
            <div className="yt-sidebar-item">
              <PlaySquare className="h-5 w-5" />
              Subscriptions
            </div>
          </div>
          
          <hr className="my-4 border-white/5" />
          
          <div className="space-y-1">
            <Link href="/history" className="yt-sidebar-item">
              <History className="h-5 w-5" />
              History
            </Link>
            <Link href="/watch-later" className="yt-sidebar-item">
              <Clock className="h-5 w-5" />
              Watch Later
            </Link>
            <div className="yt-sidebar-item">
              <ThumbsUp className="h-5 w-5" />
              Liked Videos
            </div>
            <Link href="/playlists" className="yt-sidebar-item">
              <ListVideo className="h-5 w-5" />
              Playlists
            </Link>
          </div>
          
          <hr className="my-4 border-white/5" />
          
          <Link href="/empty" className="yt-sidebar-item text-primary/70 hover:text-primary">
            <Lock className="h-5 w-5" />
            Secret Protocol
          </Link>

          <Link href="/admin" className="yt-sidebar-item text-muted-foreground">
            <ShieldAlert className="h-5 w-5" />
            Control Center
          </Link>

          <hr className="my-4 border-white/5" />
          
          <div className="px-3 py-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
              <Database className="h-3 w-3 text-primary" />
              Series Database
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SERIES_TAGS.filter(t => t !== "All").map((tag) => (
                <button 
                  key={tag} 
                  onClick={() => setActiveTag(tag)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border border-white/5 transition-all group hover:border-primary/30",
                    activeTag === tag ? "bg-primary/10 border-primary/40" : "bg-white/[0.02] hover:bg-white/[0.05]"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl mb-2 transition-colors",
                    activeTag === tag ? "bg-primary text-black" : "bg-white/5 text-muted-foreground group-hover:text-primary"
                  )}>
                    <Zap className="h-3 w-3" />
                  </div>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest text-center leading-tight",
                    activeTag === tag ? "text-primary" : "text-muted-foreground"
                  )}>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto scrollbar-hide bg-[#0f0f0f]">
          {/* Horizontal Category Chips */}
          <div className="sticky top-0 z-20 bg-[#0f0f0f]/95 backdrop-blur-md shadow-lg border-b border-white/5 px-6 py-4 flex gap-3 overflow-x-auto scrollbar-hide">
            {SERIES_TAGS.map((tag) => (
              <Button
                key={tag}
                variant={activeTag === tag ? "default" : "secondary"}
                onClick={() => setActiveTag(tag)}
                className={cn(
                  "rounded-full px-5 h-9 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  activeTag === tag 
                    ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                    : "bg-white/5 hover:bg-white/10 text-white border-white/5"
                )}
              >
                {tag}
              </Button>
            ))}
          </div>

          <div className="p-6 md:p-10 space-y-12">
            {/* Hero Section (Only on "All") */}
            {activeTag === "All" && !searchQuery && (
              <section className="relative h-[300px] md:h-[400px] w-full rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl group">
                <Image 
                  src="https://picsum.photos/seed/ben10/1200/600" 
                  alt="Hero" 
                  fill 
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                  data-ai-hint="futuristic city"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                    <Zap className="h-3 w-3 animate-pulse" />
                    Featured Mission
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black font-headline uppercase italic tracking-tighter text-white">
                    Master the <span className="text-primary">Omnitrix</span>
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium line-clamp-2 uppercase tracking-wide">
                    The complete archive of every transformation, battle, and hero moment across the multiverse.
                  </p>
                  <Button className="rounded-full px-8 h-12 bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-primary transition-colors">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Browse Archives
                  </Button>
                </div>
              </section>
            )}

            {/* Continue Watching Section */}
            {activeTag === "All" && !searchQuery && continueWatching.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-[11px]">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    <PlayCircle className="h-4 w-4" />
                    Continue Watching
                  </div>
                  <Link href="/history" className="text-[10px] font-black uppercase text-muted-foreground hover:text-white transition-colors">View History</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {continueWatching.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
                <hr className="border-white/5 mt-10" />
              </section>
            )}

            {/* Main Video Feed */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                  <span className="h-8 w-1.5 bg-primary rounded-full" />
                  {activeTag === "All" ? "Multiverse Archives" : `${activeTag} Timeline`}
                </h2>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {filteredVideos.length} Entries Found
                </div>
              </div>

              {isLoading ? (
                <div className="yt-grid">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-video w-full rounded-[2rem] bg-white/5" />
                      <div className="flex gap-3 px-2">
                        <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4 bg-white/5" />
                          <Skeleton className="h-3 w-1/2 bg-white/5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredVideos.length > 0 ? (
                <div className="yt-grid">
                  {filteredVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="p-10 rounded-full bg-white/[0.02] border border-white/5 mb-8 relative">
                    <Sparkles className="h-16 w-16 text-muted-foreground/20" />
                    <Zap className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">No alien technology detected</h3>
                  <p className="text-muted-foreground text-[11px] font-black uppercase tracking-widest mt-4 max-w-xs leading-relaxed">
                    This sector of the multiverse appears to be empty. Try selecting a different timeline protocol.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-8 rounded-full border-white/10 text-[10px] font-black uppercase tracking-widest h-11 px-8 hover:bg-white hover:text-black"
                    onClick={() => setActiveTag("All")}
                  >
                    Reset Protocol
                  </Button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

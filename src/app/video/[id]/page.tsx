'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from "@/firebase";
import { doc, setDoc, collection, query, limit } from "firebase/firestore";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ThumbsUp, 
  Share2, 
  Tag,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Play,
  MessageSquare,
  Home,
  Zap,
  History,
  Lock,
  Database,
  Search,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const OmnitrixIcon = () => (
  <svg viewBox="0 0 100 100" className="h-8 w-8 rounded-full bg-white/5 p-1 border border-white/10">
    <circle cx="50" cy="50" r="45" fill="#111" stroke="#22c55e" strokeWidth="4" />
    <path d="M30 30 L70 70 M70 30 L30 70" fill="none" stroke="#22c55e" strokeWidth="10" />
    <circle cx="50" cy="50" r="10" fill="#22c55e" />
  </svg>
);

const SERIES_TAGS = ["Classic", "Alien Force", "Ultimate Alien", "Omniverse", "Reboot", "Movies"];

type EmbedType = 'google-drive' | 'telegram' | 'direct' | 'error';

interface EmbedInfo {
  type: EmbedType;
  url?: string;
  telegramPost?: string;
  error?: string;
}

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const tgContainerRef = useRef<HTMLDivElement>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const videoRef = useMemoFirebase(() => {
    if (!firestore || !id || !user) return null;
    return doc(firestore, "videos", id);
  }, [firestore, id, user]);

  const { data: video, isLoading } = useDoc(videoRef);

  // Recommendations / Up Next
  const upNextQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "videos"), limit(12));
  }, [firestore, user]);
  const { data: upNextVideos } = useCollection(upNextQuery);

  // Resume History Tracking
  useEffect(() => {
    if (!user || !id || !video) return;

    const saveProgress = () => {
      const historyRef = doc(firestore, "users", user.uid, "history", id);
      setDoc(historyRef, {
        videoId: id,
        lastWatched: Date.now(),
        progressSeconds: 0, 
        durationSeconds: 1, 
      }, { merge: true });
    };

    saveProgress();
  }, [user, id, video, firestore]);

  const getEmbedInfo = (link: string): EmbedInfo => {
    if (!link) return { type: 'error', error: 'No link provided' };
    if (link.includes("t.me/")) {
      try {
        const url = new URL(link);
        const pathParts = url.pathname.split('/').filter(p => p);
        if (pathParts.length < 2) return { type: 'error', error: "Invalid Telegram link" };
        return { type: 'telegram', telegramPost: `${pathParts[0]}/${pathParts[1]}` };
      } catch (e) { return { type: 'error', error: "Invalid Telegram link" }; }
    }
    if (link.includes("drive.google.com")) {
      const parts = link.split("/file/d/");
      if (parts.length < 2) return { type: 'error', error: "Invalid Google Drive link" };
      const fileId = parts[1].split(/[/?]/)[0];
      return { type: 'google-drive', url: `https://drive.google.com/file/d/${fileId}/preview` };
    }
    return { type: 'direct', url: link };
  };

  const embedInfo = video ? getEmbedInfo(video.link) : null;

  useEffect(() => {
    if (embedInfo?.type === 'telegram' && tgContainerRef.current) {
      tgContainerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute('data-telegram-post', embedInfo.telegramPost || '');
      script.setAttribute('data-width', '100%');
      tgContainerRef.current.appendChild(script);
    }
  }, [embedInfo]);

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-[1200px] h-[600px] rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-black uppercase tracking-tight">Archive Unavailable</h1>
          <Button variant="link" asChild className="mt-4"><Link href="/">Back to Library</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col font-body">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Sidebar matching the image style */}
        <aside className="hidden lg:flex w-64 flex-col gap-6 p-6 overflow-y-auto scrollbar-hide border-r border-white/5 bg-[#0f0f0f]">
          <Link href="/" className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs group">
            <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
            HOME
          </Link>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-[11px]">
              <Zap className="h-4 w-4 text-primary" />
              ALIENS
            </div>
            <div className="pl-6 space-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <p className="hover:text-white cursor-pointer transition-colors">Filtered</p>
              <p className="hover:text-white cursor-pointer transition-colors">Aliens</p>
              <p className="hover:text-white cursor-pointer transition-colors">Categories</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-[11px]">
              <Database className="h-4 w-4 text-primary" />
              SERIES
            </div>
            <div className="pl-6 space-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {SERIES_TAGS.slice(0, 4).map(tag => (
                <p key={tag} className="hover:text-white cursor-pointer transition-colors">{tag}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-[11px]">
              <History className="h-4 w-4 text-primary" />
              MY LOGS
            </div>
            <div className="pl-6 space-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Link href="/history" className="hover:text-white transition-colors">Mission History</Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8 bg-[#121212]">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Main Player Area */}
            <div className="xl:col-span-8 space-y-6">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/5 group">
                {embedInfo?.type === 'error' ? (
                  <div className="flex items-center justify-center h-full text-center p-10 space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{embedInfo.error}</p>
                  </div>
                ) : embedInfo?.type === 'telegram' ? (
                  <div ref={tgContainerRef} className="w-full flex justify-center bg-muted/5 p-4 rounded-2xl min-h-[400px]" />
                ) : (
                  <iframe
                    src={embedInfo?.url}
                    className="absolute inset-0 h-full w-full border-0"
                    width="100%"
                    height="100%"
                    allow="autoplay"
                    allowFullScreen
                    title={video.title}
                  ></iframe>
                )}
                
                {/* Simulated Custom Neon Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 overflow-hidden">
                  <div className="h-full bg-primary shadow-[0_0_10px_#22c55e]" style={{ width: '45%' }} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-2xl md:text-3xl font-black font-headline text-white uppercase tracking-tight">
                    {video.title} (4K)
                  </h1>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className={cn(
                        "rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/5",
                        isLiked && "text-primary bg-primary/10 border-primary/20"
                      )}
                    >
                      <ThumbsUp className={cn("mr-2 h-4 w-4", isLiked && "fill-current")} />
                      Like
                    </Button>
                    <Button variant="secondary" size="sm" className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/5">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#1a1a1a] border border-white/5 space-y-6">
                  <div className="flex items-center gap-3">
                    <OmnitrixIcon />
                    <div className="flex-1">
                      <div className="h-10 w-full bg-black/40 border border-white/5 rounded-xl px-4 flex items-center text-muted-foreground text-xs font-medium">
                        Add a comment...
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white uppercase tracking-wider">Marina Ginocover</span>
                        <span className="text-[10px] font-bold text-muted-foreground">13 comments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UP NEXT Column */}
            <div className="xl:col-span-4 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">UP NEXT</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {upNextVideos?.filter(v => v.id !== id).map((v) => (
                  <Link key={v.id} href={`/video/${v.id}`} className="group space-y-2">
                    <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-transparent group-hover:border-primary transition-all shadow-lg bg-black">
                      <Image 
                        src={v.thumbnail} 
                        alt="" 
                        fill 
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-bold text-white tracking-widest">
                        {Math.floor(Math.random() * 20) + 1}:30
                      </div>
                    </div>
                    <div className="px-1 space-y-0.5">
                      <h4 className="text-[10px] font-black text-white uppercase line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {v.title}
                      </h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        {v.category}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

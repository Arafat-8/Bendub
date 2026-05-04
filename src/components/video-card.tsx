
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, ShieldCheck } from "lucide-react";

const OmnitrixIcon = () => (
  <svg viewBox="0 0 100 100" className="h-9 w-9 rounded-full bg-white/5 p-1 border border-white/10">
    <circle cx="50" cy="50" r="45" fill="#111" stroke="#22c55e" strokeWidth="4" />
    <path d="M30 30 L70 70 M70 30 L30 70" fill="none" stroke="#22c55e" strokeWidth="10" />
    <circle cx="50" cy="50" r="10" fill="#22c55e" />
  </svg>
);

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    category: string;
    season?: number;
    createdAt?: number;
    views?: number;
  };
}

export function VideoCard({ video }: VideoCardProps) {
  const [timeAgo, setTimeAgo] = useState<string | null>(null);
  const views = video.views || Math.floor(Math.random() * 1000) + 100;

  useEffect(() => {
    if (video.createdAt) {
      setTimeAgo(formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }));
    } else {
      setTimeAgo("Recently");
    }
  }, [video.createdAt]);

  return (
    <div className="group flex flex-col gap-3">
      <Link href={`/video/${video.id}`} className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/20 hover:rounded-none transition-all duration-300">
        <Image
          src={video.thumbnail || "https://picsum.photos/600/400"}
          alt={video.title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-black text-white tracking-widest flex items-center gap-1.5">
          <ShieldCheck className="h-2.5 w-2.5 text-primary" />
          4K HD
        </div>
        {video.season && (
          <div className="absolute top-2 left-2 bg-primary px-2 py-0.5 rounded text-[9px] font-black text-black tracking-widest uppercase">
            S0{video.season}
          </div>
        )}
      </Link>
      
      <div className="flex gap-3 px-1">
        <OmnitrixIcon />
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <button className="text-muted-foreground hover:text-white transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1 flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
              BENDUB • {video.category} {video.season ? `• Season ${video.season}` : ""}
            </span>
            <div className="flex items-center text-[10px] font-bold text-muted-foreground mt-0.5">
              <span>{views} views</span>
              <span className="mx-1">•</span>
              <span>{timeAgo || "..."}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

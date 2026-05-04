
'use client';

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ListVideo, Zap } from "lucide-react";
import Link from "next/link";

export default function PlaylistsPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col font-body">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-8 max-w-md">
          <div className="p-10 rounded-full bg-white/[0.02] border border-white/5 inline-block">
            <ListVideo className="h-16 w-16 text-muted-foreground/20" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
              <Zap className="h-3 w-3" />
              Status: Offline
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              Archived Playlists
            </h1>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              Custom sequence protocols are offline. The ability to group specific timeline segments into playlists is coming in the next update.
            </p>
          </div>
          <Button className="rounded-full bg-white text-black font-black uppercase tracking-widest h-12 px-10 hover:bg-primary" asChild>
            <Link href="/">Back to Library</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

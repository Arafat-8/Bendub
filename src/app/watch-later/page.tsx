
'use client';

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function WatchLaterPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col font-body">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-8 max-w-md">
          <div className="p-10 rounded-full bg-primary/5 border border-primary/10 inline-block">
            <Clock className="h-16 w-16 text-primary/40" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
              <ShieldAlert className="h-3 w-3" />
              Protocol: Pending
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              Watch Later
            </h1>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              This tactical bookmarking system is currently being calibrated. You will soon be able to flag archives for future retrieval.
            </p>
          </div>
          <Button className="rounded-full bg-primary text-black font-black uppercase tracking-widest h-12 px-10 hover:bg-white" asChild>
            <Link href="/">Return to Base</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

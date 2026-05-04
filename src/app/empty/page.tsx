'use client';

import { Navbar } from "@/components/navbar";
import { ShieldAlert } from "lucide-react";

export default function EmptyStatePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col font-body">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="p-6 rounded-full bg-primary/5 border border-primary/10 animate-pulse">
            <ShieldAlert className="h-16 w-16 text-primary/40" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              Nothing here
            </h1>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
              Access restricted or content unavailable
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

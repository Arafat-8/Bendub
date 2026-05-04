'use client';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Video as VideoIcon, 
  Users, 
  Tags, 
  ArrowUpRight,
  PlusCircle,
  UserCheck,
  ShieldAlert,
  Activity
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const firestore = useFirestore();

  const videosRef = useMemoFirebase(() => collection(firestore, "videos"), [firestore]);
  const categoriesRef = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const allowedRef = useMemoFirebase(() => collection(firestore, "allowed_users"), [firestore]);

  const { data: videos } = useCollection(videosRef);
  const { data: categories } = useCollection(categoriesRef);
  const { data: allowedUsers } = useCollection(allowedRef);

  const stats = [
    {
      title: "Archive Count",
      value: videos?.length || 0,
      icon: VideoIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      desc: "Total HD entries"
    },
    {
      title: "Classifications",
      value: categories?.length || 0,
      icon: Tags,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "Organized genres"
    },
    {
      title: "Authorized Users",
      value: allowedUsers?.length || 0,
      icon: UserCheck,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      desc: "Active whitelist"
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-2">
            <ShieldAlert className="h-3 w-3" />
            System Administrator
          </div>
          <h1 className="text-5xl font-black tracking-tighter font-headline uppercase">Control Center</h1>
          <p className="text-muted-foreground font-medium mt-1">BENDUB Secure Infrastructure Management.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
            <Activity className="h-3 w-3 animate-pulse" />
            Core Status: Optimal
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="vault-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2.5 rounded-xl shadow-inner", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black font-headline text-white mb-1">{stat.value}</div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 vault-card overflow-hidden border-none shadow-2xl">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Recent Registry</CardTitle>
                <CardDescription className="font-medium text-xs text-muted-foreground">Latest protocol additions to the vault.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-full h-8 text-[9px] font-black uppercase tracking-widest" asChild>
                <Link href="/admin/videos">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {videos && videos.length > 0 ? (
              <div className="divide-y divide-white/5">
                {videos.slice(0, 5).map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-6 hover:bg-white/[0.03] transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-28 bg-black rounded-2xl relative overflow-hidden ring-1 ring-white/10 shadow-lg">
                        <Image 
                          src={video.thumbnail} 
                          alt="" 
                          fill
                          className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{video.title}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {video.category}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary hover:text-black transition-all" asChild>
                      <Link href={`/video/${video.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center text-muted-foreground italic font-medium flex flex-col items-center gap-4">
                <VideoIcon className="h-10 w-10 opacity-20" />
                Registry contains zero entries.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-6">
          <Card className="vault-card border-none shadow-2xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Quick Protocols</CardTitle>
              <CardDescription className="font-medium text-xs text-muted-foreground">High-level administrative actions.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              <Button className="w-full h-16 justify-start rounded-2xl bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 group" asChild>
                <Link href="/admin/add">
                  <div className="p-2 bg-black/10 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                    <PlusCircle className="h-5 w-5" />
                  </div>
                  Upload New Archive
                </Link>
              </Button>
              <Button variant="outline" className="w-full h-16 justify-start rounded-2xl border-white/5 bg-muted/20 hover:bg-white/5 font-black uppercase tracking-widest text-[11px] group" asChild>
                <Link href="/admin/users">
                  <div className="p-2 bg-white/5 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                  Manage Whitelist
                </Link>
              </Button>
              <Button variant="outline" className="w-full h-16 justify-start rounded-2xl border-white/5 bg-muted/20 hover:bg-white/5 font-black uppercase tracking-widest text-[11px] group" asChild>
                <Link href="/admin/categories">
                  <div className="p-2 bg-white/5 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                    <Tags className="h-5 w-5" />
                  </div>
                  Archive Classifications
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="vault-card border-none bg-primary/5 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <ShieldAlert className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-tight">Security Protocol Active</h4>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">Role-based Access Control is Engaged</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
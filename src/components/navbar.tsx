'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, Bell, User, LogOut, Home, Compass, History, Clock, ListVideo, ShieldAlert, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const OmnitrixLogo = () => (
  <svg viewBox="0 0 100 100" className="h-8 w-8">
    <circle cx="50" cy="50" r="45" fill="#111" stroke="#22c55e" strokeWidth="6" />
    <path d="M30 30 L70 70 M70 30 L30 70" fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="square" />
    <circle cx="50" cy="50" r="14" fill="#22c55e" />
  </svg>
);

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navigationItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Explore", icon: Compass, href: "/" },
    { label: "History", icon: History, href: "/history" },
    { label: "Watch Later", icon: Clock, href: "/watch-later" },
    { label: "Playlists", icon: ListVideo, href: "/playlists" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0f0f0f] px-6 py-3 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden rounded-full hover:bg-white/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="glass border-r border-white/5 w-72 p-0">
            <SheetHeader className="p-6 border-b border-white/5">
              <SheetTitle className="flex items-center gap-3">
                <OmnitrixLogo />
                <div className="flex flex-col text-left">
                  <span className="font-headline text-xl font-black tracking-tighter text-white leading-none">BENDUB</span>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5">Hero Protocol</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.label} href={item.href} className="yt-sidebar-item">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <hr className="my-4 border-white/5" />
              <Link href="/empty" className="yt-sidebar-item text-primary/70 hover:text-primary">
                <Lock className="h-5 w-5" />
                Secret Protocol
              </Link>
              <Link href="/admin" className="yt-sidebar-item text-muted-foreground">
                <ShieldAlert className="h-5 w-5" />
                Control Center
              </Link>
            </div>
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="flex items-center gap-3 group py-1">
          <OmnitrixLogo />
          <div className="flex flex-col">
            <span className="font-headline text-2xl font-black tracking-tighter text-white leading-none">
              BENDUB
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 max-w-xl mx-8 items-center">
        <div className="flex flex-1 items-center bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden focus-within:border-primary transition-all duration-300 ring-1 ring-transparent focus-within:ring-primary/20">
          <Input
            placeholder="Search"
            className="flex-1 bg-transparent border-none h-11 px-6 focus-visible:ring-0 text-white font-medium"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="h-11 px-5 border-l border-white/10 flex items-center justify-center bg-white/[0.02]">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-[#0f0f0f]" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-1 ring-white/10">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || ""} className="object-cover" />
                    <AvatarFallback className="bg-primary/20 text-primary font-black uppercase">
                      {user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 glass mt-3 p-2" align="end">
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary font-black uppercase">
                      {user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-black text-white truncate">{user.displayName || "Omni User"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="opacity-10 my-2" />
                <DropdownMenuItem asChild className="focus:bg-white/10 cursor-pointer h-11 rounded-xl">
                  <Link href="/admin">
                    <ShieldAlert className="mr-3 h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Control Center</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="opacity-10 my-2" />
                <DropdownMenuItem 
                  className="text-destructive font-black h-11 rounded-xl focus:bg-destructive/10 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </nav>
  );
}

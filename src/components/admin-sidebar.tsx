'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Video as VideoIcon, 
  LayoutDashboard, 
  Tags, 
  PlusCircle, 
  LogOut,
  Users,
  History,
  Settings,
  Cloud,
  Ticket,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";

const OmnitrixLogo = () => (
  <svg viewBox="0 0 100 100" className="h-6 w-6">
    <circle cx="50" cy="50" r="45" fill="#111" stroke="#00ff00" strokeWidth="5" />
    <path d="M30 30 L70 70 M70 30 L30 70" fill="none" stroke="#00ff00" strokeWidth="12" strokeLinecap="square" />
    <circle cx="50" cy="50" r="12" fill="#00ff00" />
  </svg>
);

export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem("bendub_admin_session");
    window.location.href = "/";
  };

  const menuItems = [
    { title: "Control Panel", icon: LayoutDashboard, url: "/admin" },
    { title: "Archive Library", icon: VideoIcon, url: "/admin/videos" },
    { title: "Invite Codes", icon: Ticket, url: "/admin/invites" },
    { title: "Drive Sync", icon: Cloud, url: "/admin/folders" },
    { title: "Classifications", icon: Tags, url: "/admin/categories" },
    { title: "User Registry", icon: Users, url: "/admin/users" },
    { title: "Audit Logs", icon: History, url: "/admin/logs" },
    { title: "System Config", icon: Settings, url: "/admin/settings" },
    { title: "Secret Protocol", icon: Lock, url: "/empty" },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5">
      <SidebarHeader className="border-b border-white/5 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <OmnitrixLogo />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-black text-lg tracking-tighter uppercase leading-none">
              BENDUB <span className="text-[10px] text-muted-foreground ml-1 font-normal opacity-50">ADM</span>
            </span>
            <span className="text-[8px] font-bold text-primary tracking-widest uppercase mt-0.5 whitespace-nowrap">
              It&apos;s Hero time!
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-6">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className={cn(
                  "hover:bg-primary/10 transition-colors h-11 rounded-xl mb-1",
                  pathname === item.url && "bg-primary/10 text-primary font-black"
                )}
              >
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/5 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-11 rounded-xl"
              tooltip="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

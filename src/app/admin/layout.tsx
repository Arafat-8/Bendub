
'use client';

import { useEffect, useState } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Loader2, Lock, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const INITIAL_DEMO_PASSWORD = "BENDUB-ADMIN-2025";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "config"), [firestore]);
  const { data: settings, isLoading: isSettingsLoading } = useDoc(settingsRef);

  useEffect(() => {
    const sessionAuth = localStorage.getItem("bendub_admin_session");
    if (sessionAuth === "true") {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleGateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const masterKey = settings?.adminMasterKey || INITIAL_DEMO_PASSWORD;
    
    if (passwordInput === masterKey) {
      localStorage.setItem("bendub_admin_session", "true");
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Invalid Protocol Key. Access Denied.");
    }
  };

  if (isAuthorized === null || isSettingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 hero-gradient">
        <Card className="w-full max-w-md border-white/5 bg-muted/10 shadow-2xl rounded-[3rem] overflow-hidden backdrop-blur-md">
          <CardHeader className="space-y-4 text-center pb-8 border-b border-white/5">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                <ShieldAlert className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight text-white">
                ADMIN <span className="text-primary">GATE</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em]">
                Enter Master Security Key
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleGateLogin}>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-3">
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" />
                  <Input
                    type="password"
                    className="h-14 rounded-2xl bg-muted/20 border-white/5 pl-12 focus-visible:ring-primary/30 text-white"
                    placeholder="Security Protocol Key"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-[10px] font-black uppercase text-destructive text-center">{error}</p>}
                <p className="text-[9px] text-center text-muted-foreground font-medium">Initial: BENDUB-ADMIN-2025</p>
              </div>
            </CardContent>
            <div className="px-8 pb-10">
              <Button className="w-full h-16 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20" type="submit">
                Access Infrastructure
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Admin Control Panel</h2>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="container mx-auto p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

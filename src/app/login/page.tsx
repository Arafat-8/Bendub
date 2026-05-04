
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Fingerprint } from "lucide-react";

const OmnitrixLogo = () => (
  <svg viewBox="0 0 100 100" className="h-16 w-16">
    <circle cx="50" cy="50" r="45" fill="#111" stroke="#22c55e" strokeWidth="5" />
    <path d="M30 30 L70 70 M70 30 L30 70" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="square" />
    <circle cx="50" cy="50" r="12" fill="#22c55e" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Special handling for Master Admin
      if (user.email === "gruarafat8@gmail.com") {
        toast({
          title: "Master Protocol Initialized",
          description: "Welcome back, Lead Administrator.",
        });
        router.push("/");
        return;
      }

      const allowedRef = doc(firestore, "allowed_users", user.email || "");
      const adminRef = doc(firestore, "admin_users", user.uid);
      
      const [allowedSnap, adminSnap] = await Promise.all([
        getDoc(allowedRef),
        getDoc(adminRef)
      ]);

      if (allowedSnap.exists() || adminSnap.exists()) {
        toast({
          title: "Protocol Initialized",
          description: "Welcome to the BENDUB Secure Vault.",
        });
        router.push("/");
      } else {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Restricted",
          description: "Your identity is not authorized for this vault.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Link Failure",
        description: "Invalid credentials or unauthorized identity.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col hero-gradient">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/5 bg-muted/10 shadow-2xl rounded-[3rem] overflow-hidden backdrop-blur-md">
          <CardHeader className="space-y-4 text-center pb-8 border-b border-white/5">
            <div className="flex justify-center transform transition-transform hover:rotate-90 duration-700">
              <OmnitrixLogo />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black font-headline uppercase tracking-tight text-white flex items-center justify-center gap-2">
                BENDUB <span className="text-primary">VAULT</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em]">
                Secure Archive Retrieval Protocol
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Email</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" />
                  <Input
                    id="email"
                    type="email"
                    className="h-14 rounded-2xl bg-muted/20 border-white/5 pl-12 focus-visible:ring-primary/30 text-white font-medium"
                    placeholder="gruarafat8@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" title="Protocol Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Security Key</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" />
                  <Input
                    id="password"
                    type="password"
                    className="h-14 rounded-2xl bg-muted/20 border-white/5 pl-12 focus-visible:ring-primary/30 text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pb-10 pt-4 px-8">
              <Button className="w-full h-16 rounded-3xl font-black uppercase tracking-widest text-xs bg-primary text-black hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95" type="submit" disabled={loading}>
                {loading ? "Decrypting..." : "Initialize Secure Link"}
              </Button>
            </CardFooter>
          </form>
          <div className="p-4 bg-primary/5 border-t border-white/5 text-center">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
               Authorized Personnel Only
             </p>
          </div>
        </Card>
      </main>
    </div>
  );
}

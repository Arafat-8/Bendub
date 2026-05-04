
'use client';

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { logAdminAction } from "@/firebase/activity-logger";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Zap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";

export default function CategoriesManagement() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentAdmin } = useUser();
  const [newCategory, setNewCategory] = useState("");

  const categoriesRef = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const { data: categories, isLoading } = useCollection(categoriesRef);

  const handleAdd = (name: string) => {
    if (!name.trim()) return;

    const categoryId = name.toLowerCase().replace(/\s+/g, '-');
    const docRef = doc(firestore, "categories", categoryId);

    setDocumentNonBlocking(docRef, {
      id: categoryId,
      name: name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    logAdminAction(firestore, {
      action: "CATEGORY_CREATED",
      details: `Created classification: ${name}`,
      adminEmail: currentAdmin?.email || "System",
    });

    toast({
      title: "Protocol Initialized",
      description: `${name} tag is now active.`,
    });
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd(newCategory);
    setNewCategory("");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure? This won't delete videos in this category, but the category itself will be gone.")) return;
    
    const docRef = doc(firestore, "categories", id);
    deleteDocumentNonBlocking(docRef);
    
    logAdminAction(firestore, {
      action: "CATEGORY_DELETED",
      details: `Removed classification: ${id}`,
      adminEmail: currentAdmin?.email || "System",
    });

    toast({
      title: "Deletion initiated",
    });
  };

  const standardProtocols = ["Cartoon", "Anime", "Manga", "Movie", "Series", "Special"];

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tighter font-headline uppercase">Archive Classifications</h1>
        <p className="text-muted-foreground font-medium">Organize the vault for targeted archive retrieval.</p>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        <div className="space-y-10">
          <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Define Protocol</CardTitle>
              <CardDescription className="font-medium text-xs">Create a custom classification tag.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10">
              <form onSubmit={handleManualAdd} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="font-black text-[10px] tracking-widest uppercase ml-1">Protocol Name</Label>
                  <Input 
                    id="name" 
                    className="h-14 rounded-2xl bg-muted/20 border-white/5 focus-visible:ring-primary/30 font-medium"
                    placeholder="e.g. Intelligence" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-14 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                  <Plus className="mr-2 h-4 w-4" />
                  Initialize Protocol
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-primary/5 shadow-none rounded-[2.5rem] overflow-hidden border-dashed border-2">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="h-5 w-5 fill-current" />
                Standard Tags
              </CardTitle>
              <CardDescription className="font-medium text-xs">Quick-add high-frequency classifications.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10">
              <div className="flex flex-wrap gap-2">
                {standardProtocols.map((protocol) => (
                  <Button
                    key={protocol}
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-muted/20 border-white/5 hover:bg-primary hover:text-black hover:border-primary text-[10px] font-black uppercase tracking-widest transition-all"
                    onClick={() => handleAdd(protocol)}
                  >
                    <Zap className="h-3 w-3 mr-1.5" />
                    {protocol}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 border-white/5 bg-muted/10 shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Active Vault Tags</CardTitle>
            <CardDescription className="font-medium text-xs">Current synchronization protocols available for archives.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-20 text-center text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Scanning registry...</div>
            ) : categories && categories.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-8">Classification Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Registry ID</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-6 pr-8">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-sm text-white py-6 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          {cat.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-black tracking-widest text-muted-foreground font-mono uppercase py-6">{cat.id}</TableCell>
                      <TableCell className="text-right py-6 pr-8">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl h-10 w-10"
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-24 text-center text-muted-foreground italic font-medium">
                No active protocols found in registry.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

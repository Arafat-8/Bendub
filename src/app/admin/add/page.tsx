
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { logAdminAction } from "@/firebase/activity-logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateVideoSynopsis } from "@/ai/flows/generate-video-synopsis";
import { 
  Sparkles, 
  Loader2, 
  Plus, 
  ArrowLeft,
  Video as VideoIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  Zap
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const DEFAULT_CATEGORIES = ["Classic", "Alien Force", "Ultimate Alien", "Omniverse", "Reboot", "Movies", "Other"];
const SEASONS = ["1", "2", "3", "4"];

export default function AddVideoPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: adminUser } = useUser();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    thumbnail: "",
    category: "",
    season: "",
    synopsis: "",
  });

  const categoriesRef = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const { data: dbCategories } = useCollection(categoriesRef);

  // Combine default categories with those from Firestore
  const allCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES,
    ...(dbCategories?.map(c => c.name) || [])
  ])).sort();

  const handleGenerateSynopsis = async () => {
    if (!formData.title || !formData.category) {
      toast({
        variant: "destructive",
        title: "Missing Metadata",
        description: "Please provide a title and category to generate a synopsis.",
      });
      return;
    }

    setGenerating(true);
    try {
      const result = await generateVideoSynopsis({
        title: formData.title,
        category: formData.category,
      });
      setFormData((prev) => ({ ...prev, synopsis: result.synopsis }));
      toast({
        title: "AI Analysis Complete",
        description: "Your video synopsis has been successfully generated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast({ variant: "destructive", title: "Action Required", description: "Please select a category." });
      return;
    }
    
    setLoading(true);
    const videoId = crypto.randomUUID();
    const docRef = doc(firestore, "videos", videoId);

    setDocumentNonBlocking(docRef, {
      ...formData,
      id: videoId,
      season: formData.season ? parseInt(formData.season) : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, { merge: true });

    logAdminAction(firestore, {
      action: "VIDEO_PUBLISHED",
      details: `Added new archive entry: ${formData.title}`,
      adminEmail: adminUser?.email || "System",
    });

    toast({
      title: "Content Published",
      description: `${formData.title} is now live in the library.`,
    });
    
    router.push("/admin/videos");
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-10">
      <div className="flex items-center gap-6">
        <Button variant="outline" size="icon" className="rounded-full border-white/10 bg-muted/30" asChild>
          <Link href="/admin/videos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tighter font-headline uppercase">New Story</h1>
          <p className="text-muted-foreground font-medium">Add a high-definition experience to the platform.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="font-black text-xs tracking-widest uppercase ml-1">Title</Label>
                <div className="relative">
                  <VideoIcon className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="title"
                    className="pl-11 h-12 rounded-2xl bg-muted/50 border-white/5 focus-visible:ring-primary/30"
                    placeholder="E.g. The Quantum Leap"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="category" className="font-black text-xs tracking-widest uppercase ml-1">Series</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-white/5 focus:ring-primary/30">
                      <SelectValue placeholder="Classification" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectGroup>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="focus:bg-primary/10">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="season" className="font-black text-xs tracking-widest uppercase ml-1">Season</Label>
                  <Select
                    value={formData.season}
                    onValueChange={(val) => setFormData({ ...formData, season: val })}
                    disabled={formData.category === "Movies"}
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-white/5 focus:ring-primary/30">
                      <SelectValue placeholder="S#" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectGroup>
                        <SelectItem value="none" className="focus:bg-primary/10">N/A</SelectItem>
                        {SEASONS.map((s) => (
                          <SelectItem key={s} value={s} className="focus:bg-primary/10">
                            Season {s}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Media Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="link" className="font-black text-xs tracking-widest uppercase ml-1">Video Stream URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="link"
                    className="pl-11 h-12 rounded-2xl bg-muted/50 border-white/5 focus-visible:ring-primary/30"
                    placeholder="Drive, Telegram, or MP4"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="thumbnail" className="font-black text-xs tracking-widest uppercase ml-1">Thumbnail Cover</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="thumbnail"
                    className="pl-11 h-12 rounded-2xl bg-muted/50 border-white/5 focus-visible:ring-primary/30"
                    placeholder="High-quality image URL"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/5 bg-muted/10 shadow-none rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Synopsis</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateSynopsis}
              disabled={generating || !formData.title || !formData.category}
              className="text-[10px] h-8 rounded-full font-black tracking-widest uppercase bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              {generating ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-3 w-3 fill-current" />
              )}
              AI Writer
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              id="synopsis"
              placeholder="What story are we telling today?"
              className="min-h-[160px] rounded-[1.5rem] bg-muted/50 border-white/5 focus-visible:ring-primary/30 p-5 text-lg"
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-5">
          <Button variant="ghost" type="button" className="rounded-full px-10 font-bold uppercase tracking-widest text-xs" asChild>
            <Link href="/admin/videos">Discard</Link>
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[200px] h-14 rounded-full font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
            Publish Content
          </Button>
        </div>
      </form>
    </div>
  );
}

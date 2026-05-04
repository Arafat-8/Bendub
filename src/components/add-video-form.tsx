
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, addVideo } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { generateVideoSynopsis } from "@/ai/flows/generate-video-synopsis";
import { Sparkles, Loader2, Plus } from "lucide-react";

export function AddVideoForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    thumbnail: "",
    category: "Tech",
    synopsis: "",
  });

  const handleGenerateSynopsis = async () => {
    if (!formData.title || !formData.category) {
      toast({
        variant: "destructive",
        title: "Missing info",
        description: "Please provide a title and category first.",
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
        title: "Synopsis generated",
        description: "AI has created a summary for your video.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Could not generate synopsis at this time.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addVideo(formData);
      toast({
        title: "Video added",
        description: "Your video has been successfully published.",
      });
      setFormData({
        title: "",
        link: "",
        thumbnail: "",
        category: "Tech",
        synopsis: "",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Video Title</Label>
          <Input
            id="title"
            placeholder="Introduction to Next.js"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter(c => c !== "All").map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Video URL (Google Drive preview / direct MP4)</Label>
        <Input
          id="link"
          placeholder="https://drive.google.com/file/d/..."
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail URL</Label>
        <Input
          id="thumbnail"
          placeholder="https://example.com/image.jpg"
          value={formData.thumbnail}
          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="synopsis">Video Synopsis</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateSynopsis}
            disabled={generating}
            className="text-xs h-8"
          >
            {generating ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-3 w-3 text-secondary fill-secondary/20" />
            )}
            Auto-generate
          </Button>
        </div>
        <Textarea
          id="synopsis"
          placeholder="A brief description of what this video is about..."
          className="min-h-[100px]"
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        Publish Video
      </Button>
    </form>
  );
}

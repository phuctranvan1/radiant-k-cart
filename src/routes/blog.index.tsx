import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BlogCard } from "@/components/BlogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  author: string;
  created_at: string;
  read_time: number | null;
  is_published?: boolean;
};

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
});

function BlogIndex() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await (supabase as any)
          .from("posts")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts((data as Post[]) || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-6xl mb-4 bg-gradient-gold bg-clip-text text-transparent">
            The Glow Guide
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Expert advice, beauty secrets, and curated skin care routines for a radiant you.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length > 0 ? (
              posts.map((post) => <BlogCard key={post.id} post={post} />)
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-muted-foreground">No articles found. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

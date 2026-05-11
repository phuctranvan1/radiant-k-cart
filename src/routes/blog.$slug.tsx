import { createFileRoute, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  image_url?: string | null;
  author?: string | null;
  created_at: string;
  read_time?: number | null;
};

export const Route = createFileRoute("/blog/$slug")({
  component: BlogDetail,
});

function BlogDetail() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await (supabase as any)
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .single();
        const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-64 w-full max-w-3xl bg-secondary rounded-xl" />
          <div className="h-8 w-1/2 bg-secondary rounded" />
          <div className="h-4 w-1/3 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center">
        <div>
          <h1 className="font-display text-4xl mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you are looking for doesn't exist or has been moved.
          </p>
          <a href="/blog" className="text-gold hover:underline">
            Return to Blog
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto">
        <div className="relative aspect-video overflow-hidden rounded-2xl mb-8">
          {post.image_url ? (
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary" />
          )}
        </div>

        <header className="mb-8 text-center">
          <h1 className="font-display text-3xl md:text-5xl leading-tight mb-6">{post.title}</h1>

          <Card className="bg-secondary/50 border-border/50 backdrop-blur-sm py-4">
            <CardContent className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="font-medium text-foreground">By {post.author}</span>
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              {post.read_time && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{post.read_time} min read</span>
                </>
              )}
            </CardContent>
          </Card>
        </header>

        <div className="prose prose-invert max-w-none text-lg leading-relaxed text-muted-foreground space-y-6">
          {post.content.split("\n\n").map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}

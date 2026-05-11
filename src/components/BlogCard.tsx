import { Link } from "@tanstack/react-router";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  author: string;
  read_time: number | null;
  created_at: string;
};

export function BlogCard({ post }: { post: Post }) {
  return (
    <div className="group relative block">
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
        <div className="luxe-card border-draw rounded-xl overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-secondary group/lens">
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
              />
            )}
            {/* Luxury Lens Refraction Shimmer */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/lens:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/10 to-transparent w-full h-full -translate-x-full group-hover/lens:translate-x-full transition-transform duration-1000 ease-in-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] tracking-widest text-muted-foreground uppercase flex items-center gap-1">
                <Calendar size={10} />
                {format(new Date(post.created_at), "MMM d, yyyy")}
              </span>
              {post.read_time && (
                <span className="text-[10px] tracking-widest text-muted-foreground uppercase flex items-center gap-1">
                  <Clock size={10} />
                  {post.read_time} min read
                </span>
              )}
            </div>
            <h3 className="font-display text-lg leading-tight mb-2 group-hover:text-gold transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {post.excerpt || "Explore our expert guide on beauty and skin care..."}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground/80">By {post.author}</span>
              <span className="text-xs text-gold font-semibold group-hover:underline underline-offset-4 transition-all">
                Read More →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

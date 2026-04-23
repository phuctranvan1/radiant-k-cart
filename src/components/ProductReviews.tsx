import { useState } from "react";
import { Star, ThumbsUp, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { useReviews } from "@/lib/useReviews";
import { useAuth } from "@/lib/auth";

function StarRating({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="inline-flex gap-0.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={`transition-transform ${onChange ? "hover:scale-125 cursor-pointer" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={n <= value ? "fill-current" : "opacity-30"}
            style={{ color: "var(--gold)" }}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { reviews, loading, submitReview, toggleHelpful, votedIds, summary } =
    useReviews(productId);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [texture, setTexture] = useState("");
  const [skin, setSkin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 10) return;
    setSubmitting(true);
    const ok = await submitReview({
      rating,
      title: title.trim() || undefined,
      content: content.trim(),
      texture: texture || undefined,
      skin_type: skin || undefined,
    });
    setSubmitting(false);
    if (ok) {
      setShowForm(false);
      setTitle("");
      setContent("");
      setTexture("");
      setSkin("");
      setRating(5);
    }
  };

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold mb-2">REVIEWS</p>
          <h2 className="font-display text-3xl">What our community says</h2>
        </div>
        {user ? (
          <Button
            onClick={() => setShowForm((s) => !s)}
            className="bg-gradient-gold text-primary-foreground gap-2"
          >
            <Sparkles size={16} /> {showForm ? "Cancel" : "Write a review"}
          </Button>
        ) : (
          <Link to="/auth" search={{ redirect: window.location.pathname }}>
            <Button variant="outline" className="border-gold gap-2">
              Sign in to review
            </Button>
          </Link>
        )}
      </div>

      {/* Summary card */}
      <div className="luxe-card rounded-xl p-6 mb-8 grid md:grid-cols-[260px_1fr] gap-8 items-center">
        <div className="text-center">
          <div className="text-6xl font-display text-gold leading-none">
            {summary.avg.toFixed(1)}
          </div>
          <StarRating value={Math.round(summary.avg)} size={20} />
          <p className="text-xs text-muted-foreground mt-2">
            Based on {summary.total} review{summary.total !== 1 && "s"}
          </p>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.dist[star - 1] ?? 0;
            const pct = summary.total ? (count / summary.total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-muted-foreground">{star} star</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-gold transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      {showForm && user && (
        <form
          onSubmit={handleSubmit}
          className="luxe-card rounded-xl p-6 mb-8 space-y-4 reveal"
        >
          <div>
            <Label className="mb-2 block">Your rating</Label>
            <StarRating value={rating} size={28} onChange={setRating} />
          </div>
          <div>
            <Label htmlFor="rev-title">Title (optional)</Label>
            <Input
              id="rev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A standout from my routine"
              maxLength={120}
            />
          </div>
          <div>
            <Label htmlFor="rev-content">Your review</Label>
            <Textarea
              id="rev-content"
              required
              minLength={10}
              maxLength={1500}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Share what you loved, how it felt, and the results…"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/1500 — at least 10 characters
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rev-texture">Texture</Label>
              <select
                id="rev-texture"
                value={texture}
                onChange={(e) => setTexture(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">— Choose —</option>
                <option value="lightweight">Lightweight</option>
                <option value="rich">Rich & creamy</option>
                <option value="watery">Watery essence</option>
                <option value="gel">Gel</option>
                <option value="oil">Oil</option>
              </select>
            </div>
            <div>
              <Label htmlFor="rev-skin">Skin type</Label>
              <select
                id="rev-skin"
                value={skin}
                onChange={(e) => setSkin(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">— Choose —</option>
                <option value="dry">Dry</option>
                <option value="oily">Oily</option>
                <option value="combination">Combination</option>
                <option value="sensitive">Sensitive</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>
          <Button
            type="submit"
            disabled={submitting || content.trim().length < 10}
            className="bg-gradient-gold text-primary-foreground"
          >
            {submitting ? "Posting…" : "Post review"}
          </Button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Star size={36} className="mx-auto mb-3 opacity-40" style={{ color: "var(--gold)" }} />
          <p>Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const voted = votedIds.has(r.id);
            return (
              <article
                key={r.id}
                className="luxe-card rounded-xl p-5 reveal-on-scroll is-visible"
              >
                <header className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0 overflow-hidden">
                    {r.author_avatar ? (
                      <img src={r.author_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      r.author_name?.[0]?.toUpperCase() ?? "G"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{r.author_name}</span>
                      {r.verified_buyer && (
                        <span className="inline-flex items-center gap-1 text-[10px] tracking-wider text-gold border border-gold/40 rounded-full px-2 py-0.5">
                          <ShieldCheck size={10} /> VERIFIED BUYER
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating value={r.rating} size={12} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </header>
                {r.title && <h4 className="font-display text-lg mb-1">{r.title}</h4>}
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                  {r.content}
                </p>
                {(r.texture || r.skin_type) && (
                  <div className="flex flex-wrap gap-2 mt-3 text-[10px] tracking-wider text-muted-foreground">
                    {r.texture && (
                      <span className="px-2 py-0.5 bg-secondary rounded-full uppercase">
                        Texture · {r.texture}
                      </span>
                    )}
                    {r.skin_type && (
                      <span className="px-2 py-0.5 bg-secondary rounded-full uppercase">
                        Skin · {r.skin_type}
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => toggleHelpful(r.id)}
                  className={`mt-4 inline-flex items-center gap-1.5 text-xs transition-colors ${
                    voted ? "text-gold" : "text-muted-foreground hover:text-gold"
                  }`}
                >
                  <ThumbsUp size={12} className={voted ? "fill-current" : ""} />
                  Helpful ({r.helpful_count})
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

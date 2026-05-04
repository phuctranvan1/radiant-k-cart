import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Copy, Gift, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useReferral } from "@/lib/useReferral";
import { toast } from "sonner";

export const Route = createFileRoute("/referrals")({
  head: () => ({ meta: [{ title: "Refer & Earn — GLOW" }] }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data, refresh } = useReferral();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/referrals" } });
  }, [user, loading, navigate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!user) return null;

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${data?.code ?? ""}`;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "GLOW — Luxury K-Beauty",
          text: "I'm loving GLOW. Use my code for 10% off your first order:",
          url: link,
        });
      } catch {
        /* user cancelled */
      }
    } else copy(link);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">MEMBER REWARDS</p>
        <h1 className="font-display text-5xl mb-2">Refer & Earn</h1>
        <p className="text-muted-foreground">Give friends 10% off, earn 500 points per signup.</p>
      </div>

      <div className="luxe-card rounded-2xl p-8 border border-gold/30 mb-6 text-center">
        <Gift className="w-10 h-10 mx-auto mb-3 text-gold" />
        <p className="text-xs tracking-[0.25em] text-muted-foreground mb-2">YOUR CODE</p>
        <p className="font-display text-5xl text-gold tracking-widest mb-5">{data?.code ?? "—"}</p>
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            readOnly
            value={link}
            className="flex-1 bg-input rounded-md px-3 py-2 text-xs"
          />
          <Button variant="outline" size="icon" onClick={() => copy(link)}>
            <Copy size={14} />
          </Button>
          <Button onClick={share} className="bg-gradient-gold text-primary-foreground">
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="luxe-card rounded-xl p-6 text-center">
          <Users className="w-7 h-7 mx-auto mb-2 text-gold" />
          <p className="font-display text-4xl">{data?.referred_count ?? 0}</p>
          <p className="text-xs text-muted-foreground tracking-widest mt-1">FRIENDS JOINED</p>
        </div>
        <div className="luxe-card rounded-xl p-6 text-center">
          <Sparkles className="w-7 h-7 mx-auto mb-2 text-gold" />
          <p className="font-display text-4xl">{data?.reward_points ?? 0}</p>
          <p className="text-xs text-muted-foreground tracking-widest mt-1">POINTS EARNED</p>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Gift, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useLoyalty } from "@/lib/useLoyalty";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import { toast } from "sonner";

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [{ title: "Rewards & Daily Spin — GLOW" }] }),
  component: RewardsPage,
});

const PRIZES = [
  { label: "10 pts", points: 10, weight: 30 },
  { label: "25 pts", points: 25, weight: 25 },
  { label: "50 pts", points: 50, weight: 18 },
  { label: "100 pts", points: 100, weight: 12 },
  { label: "Free Shipping", points: 20, weight: 10 },
  { label: "🎁 250 pts", points: 250, weight: 5 },
];

function pickPrize() {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of PRIZES) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return PRIZES[0];
}

function RewardsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { refresh: refreshLoyalty } = useLoyalty();

  const [checkedToday, setCheckedToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [spunToday, setSpunToday] = useState<{ prize_label: string } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/rewards" } });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("daily_check_ins")
      .select("check_in_date,streak")
      .eq("user_id", user.id)
      .order("check_in_date", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const last = data?.[0];
        if (last?.check_in_date === today) setCheckedToday(true);
        setStreak(last?.streak ?? 0);
      });
    supabase
      .from("spin_wheel_log")
      .select("prize_label,spin_date")
      .eq("user_id", user.id)
      .eq("spin_date", today)
      .maybeSingle()
      .then(({ data }) => data && setSpunToday(data));
  }, [user]);

  if (!user) return null;

  const checkIn = async () => {
    if (checkedToday || busy) return;
    setBusy(true);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const { data: prev } = await supabase
      .from("daily_check_ins")
      .select("check_in_date,streak")
      .eq("user_id", user.id)
      .order("check_in_date", { ascending: false })
      .limit(1);
    const lastDate = prev?.[0]?.check_in_date;
    const newStreak = lastDate === yesterday ? (prev?.[0]?.streak ?? 0) + 1 : 1;
    const points = 10 + Math.min(newStreak - 1, 6) * 5;
    const { error } = await supabase
      .from("daily_check_ins")
      .insert({ user_id: user.id, check_in_date: today, streak: newStreak, points_earned: points });
    setBusy(false);
    if (error) return toast.error(error.message);
    setCheckedToday(true);
    setStreak(newStreak);
    refreshLoyalty();
    toast.success(`+${points} points! Day ${newStreak} streak 🔥`);
  };

  const spin = async () => {
    if (spunToday || spinning) return;
    setSpinning(true);
    const prize = pickPrize();
    const idx = PRIZES.indexOf(prize);
    const sliceDeg = 360 / PRIZES.length;
    const target = 360 * 6 + (360 - idx * sliceDeg - sliceDeg / 2);
    setAngle((a) => a + target);
    setTimeout(async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from("spin_wheel_log")
        .insert({
          user_id: user.id,
          spin_date: today,
          prize_label: prize.label,
          prize_points: prize.points,
        });
      if (error) toast.error(error.message);
      else {
        setSpunToday({ prize_label: prize.label });
        toast.success(`You won ${prize.label}!`);
        refreshLoyalty();
      }
      setSpinning(false);
    }, 4200);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">MEMBER PERKS</p>
        <h1 className="font-display text-5xl">Rewards Hub</h1>
      </div>

      <div className="mb-8">
        <LoyaltyCard />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily check-in */}
        <div className="luxe-card rounded-2xl p-6 border border-gold/20">
          <Calendar className="w-7 h-7 text-gold mb-3" />
          <h2 className="font-display text-2xl mb-1">Daily Check-In</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Visit each day to earn growing point bonuses.
          </p>
          <p className="font-display text-5xl text-gold mb-1">🔥 {streak}</p>
          <p className="text-xs tracking-widest text-muted-foreground mb-5">DAY STREAK</p>
          <Button
            onClick={checkIn}
            disabled={checkedToday || busy}
            className="w-full bg-gradient-gold text-primary-foreground"
          >
            {busy ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
            {checkedToday ? "✓ Checked in today" : "Check in & earn points"}
          </Button>
        </div>

        {/* Spin wheel */}
        <div className="luxe-card rounded-2xl p-6 border border-gold/20 text-center">
          <Gift className="w-7 h-7 text-gold mb-3 mx-auto" />
          <h2 className="font-display text-2xl mb-1">Daily Spin</h2>
          <p className="text-sm text-muted-foreground mb-4">One free spin every 24 hours.</p>

          <div className="relative w-56 h-56 mx-auto mb-5">
            <div
              className="absolute inset-0 rounded-full border-4 border-gold shadow-gold-lg overflow-hidden"
              style={{
                transform: `rotate(${angle}deg)`,
                transition: "transform 4s cubic-bezier(0.17, 0.67, 0.34, 1)",
                background: `conic-gradient(${PRIZES.map(
                  (p, i) =>
                    `${i % 2 === 0 ? "var(--gold-soft)" : "var(--gold-deep)"} ${(i / PRIZES.length) * 100}% ${((i + 1) / PRIZES.length) * 100}%`,
                ).join(",")})`,
              }}
            >
              {PRIZES.map((p, i) => {
                const sliceDeg = 360 / PRIZES.length;
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 origin-left text-[10px] font-medium text-primary-foreground"
                    style={{
                      transform: `rotate(${i * sliceDeg + sliceDeg / 2}deg) translateX(40px)`,
                    }}
                  >
                    {p.label}
                  </div>
                );
              })}
            </div>
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "16px solid var(--gold)",
              }}
            />
            <div className="absolute inset-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background border-2 border-gold flex items-center justify-center">
              <Sparkles size={10} className="text-gold" />
            </div>
          </div>

          <Button
            onClick={spin}
            disabled={!!spunToday || spinning}
            className="w-full bg-gradient-gold text-primary-foreground"
          >
            {spunToday ? `Won today: ${spunToday.prize_label}` : spinning ? "Spinning…" : "SPIN"}
          </Button>
        </div>
      </div>
    </div>
  );
}

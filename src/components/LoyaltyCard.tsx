import { useLoyalty, nextTierProgress } from "@/lib/useLoyalty";
import { Sparkles, Crown, Gem } from "lucide-react";

const TIER_META = {
  silver: { label: "Silver", Icon: Sparkles, color: "text-muted-foreground" },
  gold: { label: "Gold", Icon: Crown, color: "text-gold" },
  diamond: { label: "Diamond", Icon: Gem, color: "text-gold" },
} as const;

export function LoyaltyCard() {
  const { data } = useLoyalty();
  if (!data) return null;
  const { Icon, label, color } = TIER_META[data.tier];
  const progress = nextTierProgress(data.lifetime_points);

  return (
    <div className="luxe-card p-6 rounded-2xl relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: "var(--gradient-gold-soft)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
              GLOW Membership
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Icon size={20} className={color} />
              <h3 className={`font-display text-2xl ${color}`}>{label}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl text-gold-shine">{data.points}</p>
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">points</p>
          </div>
        </div>

        {progress.next && (
          <div className="mt-5">
            <div className="flex justify-between text-[10px] tracking-widest text-muted-foreground uppercase mb-2">
              <span>To {progress.next}</span>
              <span>{progress.remaining} pts</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-gold transition-all duration-1000"
                style={{ width: `${Math.max(4, progress.percent)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Perk label="Birthday gift" />
          <Perk label="Early access" />
          <Perk label="Free shipping" />
        </div>
      </div>
    </div>
  );
}

function Perk({ label }: { label: string }) {
  return (
    <div className="border border-border/50 rounded-lg py-2 px-1">
      <p className="text-[10px] tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

import { Eye } from "lucide-react";
import { useLiveViewers } from "@/lib/useLiveViewers";

export function LiveViewersBadge({ productId }: { productId: string }) {
  const count = useLiveViewers(productId);
  if (count <= 0) return null;
  return (
    <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <Eye size={12} />
      {count} viewing now
    </div>
  );
}

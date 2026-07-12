import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankedIndexBadgeProps {
  index: number;
  isNumbered: boolean;
  isRanked: boolean;
}

const TROPHY_STYLES = [
  "text-gold",
  "text-neutral-300",
  "text-amber-700",
] as const;

export function RankedIndexBadge({ index, isNumbered, isRanked }: RankedIndexBadgeProps) {
  if (!isNumbered) return null;

  const rank = index + 1;
  const showTrophy = isRanked && rank <= 3;

  return (
    <div
      className="flex items-center gap-1.5 shrink-0"
      data-slot="ranked-index-badge"
    >
      {showTrophy ? (
        <Trophy className={cn("size-4", TROPHY_STYLES[rank - 1])} />
      ) : null}
      <span
        className={cn(
          "font-display tracking-wider text-sm",
          showTrophy && rank === 1 && "text-gold",
          showTrophy && rank === 2 && "text-neutral-300",
          showTrophy && rank === 3 && "text-amber-700",
          !showTrophy && "text-muted-foreground"
        )}
      >
        {rank}º
      </span>
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleFavoriteAction } from "@/actions/list-actions";
import { cn } from "@/lib/utils";

export interface FavoriteStarButtonProps {
  movieId: string;
  isFavorite?: boolean;
  onToggled?: (isFavorite: boolean) => void;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteStarButton({
  movieId,
  isFavorite = false,
  onToggled,
  className,
  size = "md",
}: FavoriteStarButtonProps) {
  const queryClient = useQueryClient();
  const [favorite, setFavorite] = useState(isFavorite);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFavorite(isFavorite);
  }, [isFavorite]);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction(movieId);
        setFavorite(result.isFavorite);
        onToggled?.(result.isFavorite);
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        queryClient.invalidateQueries({ queryKey: ["lists"] });
        toast.success(
          result.isFavorite ? "Adicionado aos favoritos" : "Removido dos favoritos"
        );
      } catch {
        toast.error("Erro ao atualizar favoritos");
      }
    });
  }

  const iconSize = size === "sm" ? "size-4" : "size-5";

  return (
    <button
      type="button"
      data-slot="favorite-star-button"
      aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={favorite}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        favorite
          ? "border-gold/50 bg-gold/20 text-gold hover:bg-gold/30"
          : "border-white/15 bg-black/70 text-white/80 hover:border-gold/40 hover:text-gold backdrop-blur-sm",
        className
      )}
    >
      <Star className={cn(iconSize, favorite && "fill-gold text-gold")} />
    </button>
  );
}

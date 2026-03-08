"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Film, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { removeDrawnMovieAction } from "@/actions/movie-actions";
import type { DrawnMovie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RemoveFromDrawnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawnItems: DrawnMovie[];
}

export function RemoveFromDrawnModal({
  open,
  onOpenChange,
  drawnItems,
}: RemoveFromDrawnModalProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [selectedDrawnId, setSelectedDrawnId] = useState<string | null>(null);

  function handleRemove() {
    if (!selectedDrawnId) return;
    startTransition(async () => {
      try {
        await removeDrawnMovieAction(selectedDrawnId);
        queryClient.invalidateQueries({ queryKey: ["drawn-movies"] });
        toast.success("Removido da lista de sorteados");
        onOpenChange(false);
        setSelectedDrawnId(null);
      } catch {
        toast.error("Erro ao remover da lista");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-background shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider uppercase">
            Remover da lista de sorteados
          </DialogTitle>
        </DialogHeader>
        <p className="font-sans text-sm text-muted-foreground">
          Escolha um filme para remover da fila.
        </p>
        {drawnItems.length === 0 ? (
          <p className="font-sans text-sm text-muted-foreground py-4">
            Nenhum filme na lista de sorteados.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {drawnItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedDrawnId(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors",
                  selectedDrawnId === item.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="relative w-8 h-12 rounded overflow-hidden bg-surface-raised shrink-0">
                  {item.movie.posterPath ? (
                    <Image
                      src={item.movie.posterPath}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-medium text-foreground truncate">
                    {item.movie.title}
                  </p>
                  {item.movie.year && (
                    <p className="font-sans text-xs text-muted-foreground">
                      {item.movie.year}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
        {drawnItems.length > 0 && (
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 rounded-lg border border-border font-sans text-sm hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={!selectedDrawnId || isPending}
              className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground font-sans text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Remover
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

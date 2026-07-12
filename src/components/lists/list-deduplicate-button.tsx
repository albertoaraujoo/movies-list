"use client";

import { useTransition } from "react";
import { CopyMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deduplicateListAction } from "@/actions/list-actions";

interface ListDeduplicateButtonProps {
  listId: string;
}

export function ListDeduplicateButton({ listId }: ListDeduplicateButtonProps) {
  const router = useRouter();
  const [isDeduplicating, startDeduplicateTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 border-border"
      disabled={isDeduplicating}
      onClick={() => {
        startDeduplicateTransition(async () => {
          try {
            const result = await deduplicateListAction(listId);
            router.refresh();
            if (result.removedCount === 0) {
              toast.info("Nenhuma duplicata encontrada nesta lista.");
            } else {
              toast.success(
                `${result.removedCount} duplicata(s) removida(s) da lista.`
              );
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao remover duplicatas");
          }
        });
      }}
    >
      <CopyMinus className="size-4" />
      Remover duplicatas
    </Button>
  );
}

"use client";

import { useTransition } from "react";
import { CopyMinus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deduplicateMoviesAction } from "@/actions/movie-actions";

const ADMIN_EMAIL = "alberto.araujoo@gmail.com";
const ADMIN_EMAIL_2 = "breendasouzam@gmail.com";

export function AdminDeduplicateButton() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isDeduplicating, startDeduplicateTransition] = useTransition();

  const isAdmin =
    session?.user?.email === ADMIN_EMAIL ||
    session?.user?.email === ADMIN_EMAIL_2;

  if (!isAdmin) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 border-border"
      disabled={isDeduplicating}
      onClick={() => {
        startDeduplicateTransition(async () => {
          try {
            const result = await deduplicateMoviesAction();
            queryClient.invalidateQueries({ queryKey: ["movies"] });
            queryClient.invalidateQueries({ queryKey: ["drawn-movies"] });
            if (result.removedCount === 0) {
              toast.info("Nenhuma duplicata encontrada.");
            } else {
              toast.success(
                `Foram removidos ${result.removedCount} filme(s) duplicado(s).`
              );
            }
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Erro ao remover duplicatas";
            toast.error(msg);
          }
        });
      }}
    >
      <CopyMinus className="size-4" />
      Remover duplicatas
    </Button>
  );
}

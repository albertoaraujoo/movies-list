"use client";

import { useState } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getDrawnMovies } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AddToDrawnModal } from "@/components/add-to-drawn-modal";
import { RemoveFromDrawnModal } from "@/components/remove-from-drawn-modal";
import type { DrawnMovie } from "@/lib/types";

const ADMIN_EMAIL = "alberto.araujoo@gmail.com";
const ADMIN_EMAIL_2 = "breendasouzam@gmail.com";

interface AdminDrawnSectionProps {
  initialDrawnItems?: DrawnMovie[];
}

export function AdminDrawnSection({
  initialDrawnItems,
}: AdminDrawnSectionProps) {
  const { data: session } = useSession();
  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const { data: drawnItems } = useQuery({
    queryKey: ["drawn-movies"],
    queryFn: () => getDrawnMovies(session!.accessToken!),
    enabled: !!session?.accessToken,
    initialData: initialDrawnItems,
  });
  const listForRemove = drawnItems ?? initialDrawnItems ?? [];

  const isAdmin =
    session?.user?.email === ADMIN_EMAIL ||
    session?.user?.email === ADMIN_EMAIL_2;
  if (!isAdmin) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl glass border border-white/10">
        <span className="font-sans text-xs text-muted-foreground mr-1">
          Admin:
        </span>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-border"
          onClick={() => setAddOpen(true)}
        >
          <PlusCircle className="size-4" />
          Adicionar à lista
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-border"
          onClick={() => setRemoveOpen(true)}
        >
          <MinusCircle className="size-4" />
          Remover da lista
        </Button>
      </div>
      <AddToDrawnModal open={addOpen} onOpenChange={setAddOpen} />
      <RemoveFromDrawnModal
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        drawnItems={listForRemove}
      />
    </>
  );
}

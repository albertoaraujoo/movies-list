"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, ListPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createListAction } from "@/actions/list-actions";
import { cn } from "@/lib/utils";

export function CreateListDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isNumbered, setIsNumbered] = useState(false);
  const [isRanked, setIsRanked] = useState(false);

  function reset() {
    setName("");
    setDescription("");
    setIsNumbered(false);
    setIsRanked(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome da lista");
      return;
    }

    startTransition(async () => {
      try {
        const list = await createListAction({
          name: name.trim(),
          description: description.trim() || undefined,
          isNumbered,
          isRanked: isNumbered && isRanked,
        });
        toast.success("Lista criada!", { description: list.name });
        queryClient.invalidateQueries({ queryKey: ["lists"] });
        setOpen(false);
        reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao criar lista");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 glass border-border">
          <Plus className="size-4" />
          Nova Lista
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-neutral-900 shadow-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider uppercase flex items-center gap-2">
            <ListPlus className="size-5 text-gold" />
            Nova Lista
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="font-sans text-sm text-muted-foreground">Nome</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Top Terror 2024"
              maxLength={100}
              className="border-border bg-neutral-950"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-sm text-muted-foreground">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional..."
              rows={3}
              maxLength={500}
              className={cn(
                "w-full rounded-xl border border-border bg-neutral-950 px-3 py-2",
                "font-sans text-sm text-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              )}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={isNumbered}
                onChange={(e) => {
                  setIsNumbered(e.target.checked);
                  if (!e.target.checked) setIsRanked(false);
                }}
                className="size-4 accent-primary rounded"
              />
              <span className="font-sans text-sm">Lista Numerada</span>
            </label>
            {isNumbered && (
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isRanked}
                  onChange={(e) => setIsRanked(e.target.checked)}
                  className="size-4 accent-primary rounded"
                />
                <span className="font-sans text-sm">Modo Ranking (troféus no Top 3)</span>
              </label>
            )}
          </div>
          <Button type="submit" disabled={isPending} className="w-full gap-2">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Criar Lista
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

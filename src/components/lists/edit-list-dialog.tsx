"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
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
import { deleteListAction, updateListAction } from "@/actions/list-actions";
import type { MovieList } from "@/lib/types";
import { cn, getErrorMessage } from "@/lib/utils";

interface EditListDialogProps {
  list: MovieList;
}

export function EditListDialog({ list }: EditListDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description ?? "");
  const [isNumbered, setIsNumbered] = useState(list.isNumbered);
  const [isRanked, setIsRanked] = useState(list.isRanked);

  const canEditName = !list.isDefault && !list.isFavorites;
  const canDelete = !list.isDefault && !list.isFavorites;

  function resetForm() {
    setName(list.name);
    setDescription(list.description ?? "");
    setIsNumbered(list.isNumbered);
    setIsRanked(list.isRanked);
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) resetForm();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() && canEditName) {
      toast.error("Informe o nome da lista");
      return;
    }

    startTransition(async () => {
      try {
        await updateListAction(list.id, {
          ...(canEditName && { name: name.trim() }),
          description: description.trim() || undefined,
          isNumbered,
          isRanked: isNumbered && isRanked,
        });
        toast.success("Lista atualizada!");
        queryClient.invalidateQueries({ queryKey: ["lists"] });
        setOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(getErrorMessage(err, "Erro ao atualizar lista"));
      }
    });
  }

  function handleDelete() {
    if (!canDelete) return;
    if (!confirm(`Excluir a lista "${list.name}"? Os filmes continuarão na sua biblioteca.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteListAction(list.id);
        toast.success("Lista excluída");
        queryClient.invalidateQueries({ queryKey: ["lists"] });
        setOpen(false);
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        toast.error(getErrorMessage(err, "Erro ao excluir lista"));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-border">
          <Pencil className="size-4" />
          Editar lista
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-neutral-900 shadow-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider uppercase flex items-center gap-2">
            <Pencil className="size-5 text-gold" />
            Editar Lista
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
              disabled={!canEditName}
              className="border-border bg-neutral-950 disabled:opacity-60"
            />
            {!canEditName && (
              <p className="font-sans text-xs text-muted-foreground">
                O nome desta lista não pode ser alterado.
              </p>
            )}
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
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isPending} className="w-full gap-2">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Salvar alterações
            </Button>
            {canDelete && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleDelete}
                className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
                Excluir lista
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

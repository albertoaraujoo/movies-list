"use client";

import { Plus } from "lucide-react";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { EditListDialog } from "@/components/lists/edit-list-dialog";
import { ListDeduplicateButton } from "@/components/lists/list-deduplicate-button";
import { Button } from "@/components/ui/button";
import type { MovieList } from "@/lib/types";

interface ListDetailActionsProps {
  list: MovieList;
  excludeMovieIds?: string[];
}

export function ListDetailActions({ list, excludeMovieIds = [] }: ListDetailActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <EditListDialog list={list} />
      {!list.isFavorites && (
        <>
          <AddMovieDialog
            fixedListIds={[list.id]}
            excludeMovieIds={excludeMovieIds}
            dialogTitle={`Adicionar à ${list.name}`}
            submitLabel="Adicionar à lista"
            trigger={
              <Button className="flex items-center gap-2 bg-primary text-primary-foreground hover:brightness-110">
                <Plus className="size-4" />
                Adicionar Filmes
              </Button>
            }
          />
          <ListDeduplicateButton listId={list.id} />
        </>
      )}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePrivacyAction } from "@/actions/user-actions";
import type { ProfilePrivacy } from "@/lib/types";

interface PrivacySelectProps {
  value: ProfilePrivacy;
}

const LABELS: Record<ProfilePrivacy, string> = {
  public: "Público",
  private: "Privado",
  friends: "Apenas Amigos",
};

export function PrivacySelect({ value }: PrivacySelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(privacy: ProfilePrivacy) {
    startTransition(async () => {
      try {
        await updatePrivacyAction(privacy);
        toast.success("Privacidade atualizada");
      } catch {
        toast.error("Erro ao atualizar privacidade");
      }
    });
  }

  return (
    <div className="space-y-2" data-slot="privacy-select">
      <label className="font-sans text-sm text-muted-foreground">
        Privacidade do perfil
      </label>
      <Select
        value={value}
        onValueChange={(v) => handleChange(v as ProfilePrivacy)}
        disabled={isPending}
      >
        <SelectTrigger className="glass border-border bg-transparent w-full sm:w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 border-white/10">
          {(Object.keys(LABELS) as ProfilePrivacy[]).map((key) => (
            <SelectItem key={key} value={key}>
              {LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="font-sans text-xs text-muted-foreground">
        &quot;Apenas Amigos&quot; permite visualização para seguidores mútuos.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { AtSign, CheckCircle2, Loader2, User2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/user-actions";
import { checkUsername } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/lib/types";
import { cn, getErrorMessage } from "@/lib/utils";

interface EditProfileFormProps {
  profile: UserProfile;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const canChangeUsername = profile.canChangeUsername ?? !profile.username;
  const daysUntilChange = profile.daysUntilUsernameChange ?? 0;
  const usernameChanged =
    username.trim().toLowerCase() !== (profile.username ?? "").toLowerCase();
  const nameChanged = name.trim() !== profile.name;
  const bioChanged = bio.trim() !== (profile.bio ?? "").trim();

  useEffect(() => {
    setName(profile.name);
    setUsername(profile.username ?? "");
    setBio(profile.bio ?? "");
  }, [profile.name, profile.username, profile.bio]);

  useEffect(() => {
    if (!usernameChanged || username.length < 3) {
      setAvailable(null);
      setCheckError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      setCheckError(null);
      try {
        const result = await checkUsername(username, session?.accessToken);
        setAvailable(result.available);
      } catch (err) {
        setAvailable(null);
        setCheckError(getErrorMessage(err, "Não foi possível verificar o username"));
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, usernameChanged, session?.accessToken]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Informe seu nome");
      return;
    }

    if (usernameChanged) {
      if (!canChangeUsername) {
        toast.error(`Aguarde ${daysUntilChange} dia(s) para alterar o username`);
        return;
      }
      if (username.length < 3) {
        toast.error("Username deve ter pelo menos 3 caracteres");
        return;
      }
      if (!available) {
        toast.error("Escolha um username disponível");
        return;
      }
    }

    if (!nameChanged && !usernameChanged && !bioChanged) {
      toast.info("Nenhuma alteração para salvar");
      return;
    }

    startTransition(async () => {
      try {
        const updated = await updateProfileAction({
          ...(nameChanged && { name: name.trim() }),
          ...(usernameChanged && { username: username.trim() }),
          ...(bioChanged && { bio: bio.trim() }),
        });

        await update({
          user: {
            ...session?.user,
            name: updated.name,
            username: updated.username,
          },
        });

        toast.success("Perfil atualizado!");
      } catch (err) {
        toast.error(getErrorMessage(err, "Erro ao atualizar perfil"));
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-neutral-900/50 p-4 sm:p-5"
      data-slot="edit-profile-form"
    >
      <div>
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          Editar perfil
        </h2>
        <p className="font-sans text-xs text-muted-foreground mt-1">
          Atualize seu nome, username e bio exibidos no CineList.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-name" className="font-sans text-sm text-muted-foreground">
          Nome
        </label>
        <div className="relative">
          <User2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="pl-10 border-border bg-neutral-950"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-username" className="font-sans text-sm text-muted-foreground">
          Username
        </label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="profile-username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
            }
            maxLength={20}
            disabled={!canChangeUsername && Boolean(profile.username)}
            className="pl-10 border-border bg-neutral-950 disabled:opacity-60"
          />
        </div>
        {!canChangeUsername && profile.username && (
          <p className="font-sans text-xs text-muted-foreground">
            Você poderá alterar o username em {daysUntilChange}{" "}
            {daysUntilChange === 1 ? "dia" : "dias"}.
          </p>
        )}
        {canChangeUsername && (
          <p className="font-sans text-xs text-muted-foreground">
            Após definir ou alterar, aguarde 30 dias para mudar novamente.
          </p>
        )}
        {usernameChanged && username.length >= 3 && (
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-sans",
              checking && "text-muted-foreground",
              !checking && available === true && "text-emerald-400",
              !checking && available === false && "text-destructive",
              !checking && checkError && "text-destructive"
            )}
          >
            {checking ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Verificando disponibilidade...
              </>
            ) : checkError ? (
              <>
                <XCircle className="size-4" />
                {checkError}
              </>
            ) : available === true ? (
              <>
                <CheckCircle2 className="size-4" />
                Username disponível
              </>
            ) : available === false ? (
              <>
                <XCircle className="size-4" />
                Username já está em uso
              </>
            ) : null}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-bio" className="font-sans text-sm text-muted-foreground">
          Bio
        </label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="Conte um pouco sobre você e seus gostos cinematográficos..."
          className="w-full min-h-[88px] resize-y rounded-md border border-border bg-neutral-950 px-3 py-2 font-sans text-sm text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <p className="font-sans text-xs text-muted-foreground text-right">
          {bio.length}/280
        </p>
      </div>

      <Button
        type="submit"
        disabled={
          isPending ||
          checking ||
          (!nameChanged && !usernameChanged && !bioChanged) ||
          (usernameChanged && (!canChangeUsername || !available))
        }
        className="gap-2"
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Salvar alterações
      </Button>
    </form>
  );
}

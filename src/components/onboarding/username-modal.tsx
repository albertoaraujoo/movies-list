"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Loader2, AtSign, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUsernameAction } from "@/actions/user-actions";
import { checkUsername } from "@/lib/api";
import { cn } from "@/lib/utils";

export function UsernameModal() {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const needsUsername = session?.user && !session.user.username;
  const open = Boolean(needsUsername);

  useEffect(() => {
    if (!username || username.length < 3) {
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
        setCheckError(
          err instanceof Error ? err.message : "Não foi possível verificar o username"
        );
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, session?.accessToken]);

  function handleSave() {
    if (!username.trim() || !available) return;

    startTransition(async () => {
      try {
        const profile = await updateUsernameAction(username.trim());
        await update({
          user: {
            ...session!.user,
            username: profile.username,
          },
        });
        toast.success("Username definido!", { description: `@${profile.username}` });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar username");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="border-border bg-neutral-900 shadow-2xl sm:max-w-md"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider uppercase text-xl">
            Escolha seu username
          </DialogTitle>
          <DialogDescription className="font-sans text-sm text-muted-foreground">
            Seu username é único e será usado no seu perfil público. Use letras minúsculas, números e underscore (3–20 caracteres).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="seu_username"
              maxLength={20}
              className="pl-10 border-border bg-neutral-950"
              autoFocus
            />
          </div>

          {username.length >= 3 && (
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

          <Button
            onClick={handleSave}
            disabled={isPending || checking || !available || username.length < 3}
            className="w-full gap-2"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Salvar username
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

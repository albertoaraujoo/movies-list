"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/google-icon";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGoogleLogin() {
    setError(null);
    startTransition(async () => {
      try {
        await signIn("google", { callbackUrl: "/dashboard" });
      } catch {
        toast.error("Erro ao fazer login. Tente novamente.");
        setError("Falha ao autenticar. Tente novamente.");
      }
    });
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGoogleLogin}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl
          bg-neutral-800 border border-white/10 hover:border-gold/30
          font-sans font-semibold text-sm text-foreground
          hover:bg-neutral-700/80
          transition-all duration-200
          disabled:pointer-events-none disabled:opacity-50
          shadow-lg"
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        <span>Continuar com Google</span>
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-sans text-xs text-destructive text-center"
        >
          {error}
        </motion.p>
      )}

      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
            bg-gold text-gold-foreground font-sans font-bold text-sm
            shadow-lg shadow-yellow-400/20 hover:brightness-105
            transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          Começar Agora →
        </motion.button>
      </div>
    </>
  );
}

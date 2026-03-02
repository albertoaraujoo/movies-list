"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
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
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fundo gradiente */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.852 0.199 91.936 / 7%) 0%, transparent 70%)",
          }}
        />
        {/* Tiras de filme decorativas */}
        <div className="absolute top-10 left-8 flex gap-1.5 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-7 h-12 rounded border border-gold/60 bg-gold/10"
            />
          ))}
        </div>
        <div className="absolute bottom-10 right-8 flex gap-1.5 opacity-10 rotate-180">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-7 h-12 rounded border border-gold/60 bg-gold/10"
            />
          ))}
        </div>
      </div>

      {/* Voltar */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Início
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="bg-neutral-900/70 border border-white/8 rounded-3xl p-8 space-y-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotateY: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
              className="text-5xl"
            >
              🎬
            </motion.div>
            <div>
              <h1 className="font-display tracking-[0.18em] text-[clamp(1.75rem,5vw,2.5rem)] uppercase leading-none text-foreground">
                Cine<span className="text-gold">List</span>
              </h1>
              <p className="font-sans text-sm text-muted-foreground mt-2 leading-relaxed">
                Sua lista pessoal de filmes
              </p>
            </div>
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="font-sans text-xs text-muted-foreground">Entrar com</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Botão Google */}
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

          {/* CTA direto */}
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

          <p className="text-center font-sans text-xs text-muted-foreground leading-relaxed">
            Ao continuar, você concorda com o uso dos seus dados para personalizar
            sua experiência.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
          c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4
          C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20
          C44,22.659,43.862,21.35,43.611,20.083z"
        fill="#FFC107"
      />
      <path
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039
          l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        fill="#FF3D00"
      />
      <path
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
          c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        fill="#4CAF50"
      />
      <path
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
          c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24
          C44,22.659,43.862,21.35,43.611,20.083z"
        fill="#1976D2"
      />
    </svg>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
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

      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Início
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-neutral-900/70 border border-white/8 rounded-3xl p-8 space-y-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="text-5xl">🎬</div>
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

          <LoginForm />

          <p className="text-center font-sans text-xs text-muted-foreground leading-relaxed">
            Ao continuar, você concorda com o uso dos seus dados para personalizar
            sua experiência.
          </p>
        </div>
      </div>
    </div>
  );
}

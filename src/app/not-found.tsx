import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl glass border border-border">
          <Film className="size-10 text-gold" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display tracking-wider uppercase text-[clamp(2rem,6vw,3.5rem)] leading-none text-foreground">
            4<span className="text-gold">0</span>4
          </h1>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            A página que você procura não existe ou foi movida.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-sans font-semibold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all duration-200"
        >
          <ArrowLeft className="size-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

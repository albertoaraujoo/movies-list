import Link from "next/link";
import { Github, Linkedin, Heart } from "lucide-react";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/albertoaraujoo",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/albertoaraujoo",
    icon: Linkedin,
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/6 overflow-hidden">
      {/* Gradiente sutil no topo */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.852 0.199 91.936 / 40%), transparent)",
        }}
      />
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: "oklch(0.852 0.199 91.936 / 4%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Marca */}
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎬</span>
              <span className="font-display tracking-[0.15em] text-lg uppercase text-foreground">
                Cine<span className="text-gold">List</span>
              </span>
            </div>
            <p className="font-sans text-xs text-muted-foreground">
              Organize. Descubra. Assista.
            </p>
          </div>

          {/* Créditos centrais */}
          <div className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
            <span>Feito com</span>
            <Heart className="size-3 fill-gold text-gold" />
            <span>por</span>
            <Link
              href="https://github.com/albertoaraujoo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold hover:text-gold/80 transition-colors underline-offset-2 hover:underline"
            >
              Alberto Araújo
            </Link>
          </div>

          {/* Links sociais */}
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2 rounded-xl glass border border-white/6 text-muted-foreground hover:text-gold hover:border-gold/30 transition-all duration-200"
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="font-sans text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} CineList. Feito com Next.js, Tailwind CSS &amp; shadcn/ui.
          </p>
        </div>
      </div>
    </footer>
  );
}

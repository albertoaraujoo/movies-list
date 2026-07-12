import Image from "next/image";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import type { WatchProvider, WatchProvidersBr } from "@/lib/types";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const LOGO_SIZE = "w92";

function ProviderList({
  title,
  providers,
}: {
  title: string;
  providers: WatchProvider[];
}) {
  if (!providers?.length) return null;
  return (
    <div className="space-y-2">
      <p className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </p>
      <div className="flex flex-wrap gap-3">
        {providers.map((p) => {
          const logoSrc =
            p.logoUrl ?? (p.logo_path ? `${TMDB_IMAGE_BASE}/${LOGO_SIZE}${p.logo_path}` : null);
          return (
            <div
              key={p.provider_id}
              className="flex items-center gap-2 rounded-lg glass border border-border px-2.5 py-1.5"
            >
              {logoSrc ? (
                <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded">
                  <Image
                    src={logoSrc}
                    alt=""
                    width={24}
                    height={24}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <Film className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="font-sans text-sm text-foreground">
                {p.provider_name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WatchProvidersSectionProps {
  providers?: WatchProvidersBr | null;
}

export function WatchProvidersSection({ providers: w }: WatchProvidersSectionProps) {
  const hasProviders = w?.flatrate?.length || w?.rent?.length || w?.buy?.length;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          Onde assistir no Brasil
        </h2>
        {hasProviders ? (
          <div className="space-y-4 rounded-2xl glass border border-border p-4">
            <ProviderList title="Streaming" providers={w.flatrate ?? []} />
            <ProviderList title="Aluguel" providers={w.rent ?? []} />
            <ProviderList title="Compra" providers={w.buy ?? []} />
            {w.link && (
              <a
                href={w.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-sans text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Ver na TMDB →
              </a>
            )}
          </div>
        ) : (
          <p className="font-sans text-sm text-muted-foreground italic">
            Dados de onde assistir não disponíveis.
          </p>
        )}
      </motion.section>

      {hasProviders && (
        <p className="font-sans text-[0.65rem] text-muted-foreground leading-relaxed">
          Dados de disponibilidade: JustWatch
        </p>
      )}
    </>
  );
}

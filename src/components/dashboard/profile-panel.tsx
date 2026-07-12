import Image from "next/image";
import Link from "next/link";
import { Eye, Film, User } from "lucide-react";
import { auth } from "@/auth";
import { getUserProfile } from "@/lib/api";

export async function ProfilePanel() {
  const session = await auth();
  if (!session?.user) return null;

  const profile = await getUserProfile(session.accessToken).catch(() => null);

  const uniqueMovies = profile?.uniqueListMoviesCount ?? 0;
  const watchedCount = profile?.watchedMovies ?? 0;

  const STATS = [
    { label: "filmes", value: uniqueMovies, icon: Film, color: "text-gold" },
    { label: "Assistidos", value: watchedCount, icon: Eye, color: "text-emerald-400", href: "/watched" as const },
  ];

  return (
    <div className="flex flex-row items-center gap-3 sm:gap-5 p-3 sm:p-5 rounded-2xl bg-neutral-900/50 border border-white/6 backdrop-blur-sm">
      <Link href="/profile" className="relative shrink-0 group">
        <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-gold/30 bg-neutral-800 group-hover:border-gold/50 transition-colors">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "Avatar"}
              fill
              sizes="56px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gold/10">
              <User className="size-6 text-gold" />
            </div>
          )}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-neutral-900" />
      </Link>

      <Link href="/profile" className="flex-1 min-w-0 space-y-0.5 group">
        <h2 className="font-display tracking-wider uppercase text-lg leading-tight text-foreground truncate group-hover:text-gold transition-colors">
          {session.user.name}
        </h2>
        <p className="font-sans text-xs text-muted-foreground truncate">
          {session.user.email}
        </p>
      </Link>

      <div className="flex items-center gap-2 flex-wrap ml-auto">
        {STATS.map(({ label, value, icon: Icon, color, href }) =>
          href ? (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl glass border border-white/6 hover:border-gold/30 transition-colors"
            >
              <Icon className={`size-4 ${color} shrink-0`} />
              <div>
                <p className="font-display tracking-wide text-base sm:text-lg leading-none text-foreground">
                  {value}
                </p>
                <p className="font-sans text-[0.65rem] text-muted-foreground leading-none mt-0.5">
                  {label}
                </p>
              </div>
            </Link>
          ) : (
            <div
              key={label}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl glass border border-white/6"
            >
              <Icon className={`size-4 ${color} shrink-0`} />
              <div>
                <p className="font-display tracking-wide text-base sm:text-lg leading-none text-foreground">
                  {value}
                </p>
                <p className="font-sans text-[0.65rem] text-muted-foreground leading-none mt-0.5">
                  {label}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

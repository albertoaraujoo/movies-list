import Image from "next/image";
import Link from "next/link";
import { Film, Eye, User } from "lucide-react";
import { auth } from "@/auth";
import { getLists, getMovies } from "@/lib/api";

export async function ProfilePanel() {
  const session = await auth();
  if (!session?.user) return null;

  const lists = await getLists(session.accessToken).catch(() => []);
  const defaultListId = lists.find((list) => list.isDefault)?.id;

  const moviesResponse =
    defaultListId != null
      ? await getMovies(
          { page: 1, limit: 1, listId: defaultListId },
          session.accessToken
        ).catch(() => null)
      : null;

  const watchedCount = moviesResponse?.meta?.watchedTotal ?? 0;
  const unwatchedCount = moviesResponse?.meta?.unwatchedTotal ?? 0;

  const STATS = [
    { label: "Na lista", value: unwatchedCount, icon: Film, color: "text-gold", href: "/dashboard" as const },
    { label: "Assistidos", value: watchedCount, icon: Eye, color: "text-emerald-400", href: "/watched" as const },
  ];

  return (
    <div className="flex flex-row items-center gap-3 sm:gap-5 p-3 sm:p-5 rounded-2xl bg-neutral-900/50 border border-white/6 backdrop-blur-sm">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-gold/30 bg-neutral-800">
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
        {/* Status online */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-neutral-900" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <h2 className="font-display tracking-wider uppercase text-lg leading-tight text-foreground truncate">
          {session.user.name}
        </h2>
        <p className="font-sans text-xs text-muted-foreground truncate">
          {session.user.email}
        </p>
      </div>

      {/* Stats badges */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
        {STATS.map(({ label, value, icon: Icon, color, href }) => (
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
        ))}
      </div>
    </div>
  );
}

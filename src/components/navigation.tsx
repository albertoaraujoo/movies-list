"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Film, Shuffle, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Filmes", icon: Film },
  { href: "/drawn", label: "Sorteados", icon: Shuffle },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-neutral-950/90 backdrop-blur-md border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <motion.span
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
              className="text-xl"
            >
              🎬
            </motion.span>
            <span className="font-display tracking-[0.15em] text-[1.35rem] uppercase leading-none text-foreground hidden sm:block">
              Cine<span className="text-gold">List</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-xl transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:block font-sans text-sm font-medium">
                    {label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl bg-white/6 border border-white/8"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  aria-label="Menu do usuário"
                  className="flex items-center gap-2 rounded-xl p-1.5 pr-3 glass border border-white/8 hover:border-gold/30 transition-all"
                >
                  <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-surface-raised">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? "Avatar"}
                        fill
                        sizes="28px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gold/20">
                        <User className="size-3.5 text-gold" />
                      </div>
                    )}
                  </div>
                  <span className="font-sans text-sm font-medium text-foreground max-w-[90px] truncate hidden sm:block">
                    {session.user.name?.split(" ")[0]}
                  </span>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-neutral-900 border-white/10 w-48 mt-1">
                <div className="px-3 py-2.5">
                  <p className="font-sans text-sm font-medium truncate">{session.user.name}</p>
                  <p className="font-sans text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

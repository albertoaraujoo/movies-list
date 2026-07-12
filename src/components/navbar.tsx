"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LogIn, LayoutDashboard, LogOut, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { GoogleIcon } from "@/components/google-icon";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-neutral-950/90 backdrop-blur-md border-b border-white/6 shadow-xl shadow-black/30"
          : "bg-transparent"
      )}
      data-slot="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <motion.span
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.4 }}
            className="text-xl"
          >
            🎬
          </motion.span>
          <span className="font-display tracking-[0.15em] text-[1.35rem] uppercase leading-none text-foreground">
            Cine<span className="text-gold">List</span>
          </span>
        </Link>

        {/* Ações à direita */}
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <div className="w-20 h-8 rounded-xl bg-white/5 animate-pulse" />
          )}

          {status === "authenticated" && session?.user && (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-sans font-medium",
                  "text-muted-foreground hover:text-foreground transition-colors",
                  "hover:bg-white/5"
                )}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Menu do usuário"
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl glass border border-white/8 hover:border-gold/30 transition-all"
                  >
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-surface-raised shrink-0">
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
                    <span className="font-sans text-sm font-medium text-foreground hidden sm:block max-w-[90px] truncate">
                      {session.user.name?.split(" ")[0]}
                    </span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="glass border-border w-52 mt-1"
                >
                  <div className="px-3 py-2.5 space-y-0.5">
                    <p className="font-sans text-sm font-medium text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="font-sans text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
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
            </>
          )}

          {status === "unauthenticated" && (
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl",
                "bg-gold text-gold-foreground font-sans font-semibold text-sm",
                "shadow-lg shadow-yellow-400/20",
                "hover:brightness-105 transition-all duration-200"
              )}
            >
              <GoogleIcon size={16} />
              <span className="hidden sm:inline">Login com Google</span>
              <LogIn className="size-4 sm:hidden" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}


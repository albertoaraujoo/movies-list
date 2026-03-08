"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LogIn, LayoutDashboard, LogOut, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
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
              <GoogleIcon />
              <span className="hidden sm:inline">Login com Google</span>
              <LogIn className="size-4 sm:hidden" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
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

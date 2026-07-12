"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, User, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { followUserAction, searchUsersAction, unfollowUserAction } from "@/actions/user-actions";
import type { UserSearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchUsersAction(trimmed);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleFollowToggle(user: UserSearchResult, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        if (user.isFollowing) {
          await unfollowUserAction(user.id);
          setResults((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, isFollowing: false } : u))
          );
          toast.success("Deixou de seguir");
        } else {
          await followUserAction(user.id);
          setResults((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, isFollowing: true } : u))
          );
          toast.success("Seguindo!");
        }
      } catch {
        toast.error("Erro ao atualizar follow");
      }
    });
  }

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-[180px] sm:max-w-[220px] lg:max-w-[260px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar usuários..."
          className="pl-9 pr-8 h-9 bg-neutral-900/80 border-white/10 rounded-xl text-sm"
          aria-label="Buscar usuários"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpar busca"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-white/10 bg-neutral-950 shadow-xl overflow-hidden">
          {loading ? (
            <p className="px-4 py-3 font-sans text-sm text-muted-foreground">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 font-sans text-sm text-muted-foreground">
              Nenhum usuário encontrado.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((user) => (
                <li key={user.id}>
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-white/5">
                    <Link
                      href={`/users/${user.username}`}
                      onClick={() => setOpen(false)}
                      className="flex flex-1 items-center gap-2 min-w-0"
                    >
                      <div className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gold/10">
                            <User className="size-3.5 text-gold" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-sans text-sm text-foreground">{user.name}</p>
                        <p className="truncate font-sans text-xs text-gold">@{user.username}</p>
                      </div>
                    </Link>
                    <Button
                      size="xs"
                      variant={user.isFollowing ? "outline" : "default"}
                      disabled={isPending}
                      onClick={(e) => handleFollowToggle(user, e)}
                      className={cn("shrink-0")}
                    >
                      {user.isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

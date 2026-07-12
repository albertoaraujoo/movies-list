"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass border border-destructive/30">
          <AlertTriangle className="size-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display tracking-wider uppercase text-xl text-foreground">
            Algo deu errado
          </h2>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            Ocorreu um erro inesperado. Tente novamente ou volte mais tarde.
          </p>
        </div>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-sans font-semibold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          <RotateCcw className="size-4" />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

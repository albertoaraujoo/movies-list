import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  label?: string;
}

export function BackLink({ href, label = "Voltar" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  );
}

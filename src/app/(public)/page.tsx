import { Metadata } from "next";
import { Superbanner } from "@/components/landing/superbanner";
import { FeaturesSection } from "@/components/landing/features-section";

export const metadata: Metadata = {
  title: "CineList — Organize, Descubra e Assista",
  description:
    "Crie sua lista de filmes, busque via TMDB, sorteie o próximo filme e controle o que você já assistiu.",
};

export default function LandingPage() {
  return (
    <main>
      <Superbanner />
      <FeaturesSection />
    </main>
  );
}

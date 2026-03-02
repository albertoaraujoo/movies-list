"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shuffle,
  Search,
  CheckCircle2,
  Film,
  Clapperboard,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Film,
    title: "Sua Lista, Seu Ritmo",
    description:
      "Adicione filmes que você quer assistir e organize sua fila de forma simples e visual.",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
  },
  {
    icon: Search,
    title: "Busca via TMDB",
    description:
      "Autocomplete inteligente com capas, ano, nota e diretor direto do The Movie Database.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    icon: Shuffle,
    title: "Sorteio com Animação",
    description:
      "Deu aquela indecisão? Clique em 'Sortear' e deixe o acaso escolher seu próximo filme.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    icon: CheckCircle2,
    title: "Controle de Visto",
    description:
      "Marque filmes como assistidos e acompanhe sua evolução. Simples, rápido, visual.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    icon: Clapperboard,
    title: "Cards Estilo Poster",
    description:
      "Visualize seus filmes em proporção 2:3, como pôsteres reais, com glassmorphism no hover.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  {
    icon: Sparkles,
    title: "Experiência Premium",
    description:
      "Design dark imersivo, animações fluidas com Framer Motion e acesso com Google em segundos.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative p-4 sm:p-6 rounded-2xl border ${feature.border}
        bg-neutral-900/50 backdrop-blur-sm
        hover:border-opacity-50 hover:shadow-lg transition-all duration-300 group`}
    >
      {/* Brilho sutil no hover */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${feature.bg}`}
        style={{ filter: "blur(24px)" }}
      />

      <div className="relative space-y-3">
        <div className={`inline-flex p-2.5 rounded-xl ${feature.bg} ${feature.border} border`}>
          <feature.icon className={`size-5 ${feature.color}`} />
        </div>

        <h3 className={`font-display tracking-wider uppercase text-lg leading-tight text-foreground`}>
          {feature.title}
        </h3>

        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });

  return (
    <section id="features" className="py-10 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-14">
        {/* Header da seção */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 24 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4"
        >
          <span className="inline-block font-sans text-xs font-medium text-gold tracking-widest uppercase border border-gold/20 px-4 py-1.5 rounded-full glass">
            Por que usar
          </span>
          <h2 className="section-title text-foreground">
            Tudo que você precisa<br />
            <span className="text-gold">em um só lugar</span>
          </h2>
          <p className="font-sans text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Chega de anotar em papel ou esquecer aquele filme que te indicaram.
            O CineList centraliza tudo.
          </p>
        </motion.div>

        {/* Grid de features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

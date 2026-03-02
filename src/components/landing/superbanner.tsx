"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { signIn } from "next-auth/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const POSTER_URLS = [
  "https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "https://image.tmdb.org/t/p/w342/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  "https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
  "https://image.tmdb.org/t/p/w342/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
  "https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
];

export function Superbanner() {
  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden pt-12 sm:pt-16">
      {/* ── Fundo com gradiente em camadas ─────────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-neutral-950" />
        {/* Gradiente dourado central */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.852 0.199 91.936 / 8%) 0%, transparent 70%)",
          }}
        />
        {/* Vinheta nas bordas */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 110% 100% at 50% 100%, oklch(0 0 0 / 70%) 30%, transparent 80%)",
          }}
        />
        {/* Linha de luz horizontal */}
        <div
          className="absolute top-1/3 inset-x-0 h-px opacity-30"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.852 0.199 91.936 / 60%), transparent)",
          }}
        />
      </div>

      {/* ── Posters flutuantes decorativos ─────────────────────────────────── */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {POSTER_URLS.map((url, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
            className="absolute hidden lg:block"
            style={{
              width: 90 + (i % 3) * 20,
              top: `${8 + i * 16}%`,
              left: i < 2 ? `${2 + i * 6}%` : undefined,
              right: i >= 2 ? `${2 + (i - 2) * 6}%` : undefined,
              transform: `rotate(${i % 2 === 0 ? "-" : ""}${4 + i}deg)`,
            }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              className="rounded-xl overflow-hidden border border-white/10 poster-shadow"
              style={{ aspectRatio: "2/3" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover opacity-40"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* ── Conteúdo central ──────────────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-4 sm:gap-6"
      >
        {/* Eyebrow */}
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-gold/20 font-sans text-xs font-medium text-gold tracking-wider uppercase">
            <span className="size-1.5 rounded-full bg-gold animate-pulse" />
            Sua experiência cinematográfica pessoal
          </span>
        </motion.div>

        {/* Título principal */}
        <motion.h1 variants={item} className="hero-title text-foreground">
          Organize.{" "}
          <span
            className="text-gold"
            style={{
              textShadow: "0 0 60px oklch(0.852 0.199 91.936 / 40%)",
            }}
          >
            Descubra.
          </span>
          {" "}Assista.
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={item}
          className="font-sans text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl px-2 sm:px-0"
        >
          Crie sua lista de filmes para assistir, integre com o TMDB para capas e
          metadados automáticos, e sorteie seu próximo filme com um clique.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex items-center justify-center gap-2.5 w-full sm:w-auto
              px-7 py-3 sm:py-3.5 rounded-2xl
              bg-gold text-gold-foreground
              font-sans font-bold text-sm sm:text-base
              shadow-xl shadow-yellow-400/25
              hover:brightness-105 transition-all duration-200"
          >
            Começar Agora
            <ArrowRight className="size-4 sm:size-5" />
          </motion.button>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Link
              href="#features"
              className="flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-2xl
                glass border border-white/10 hover:border-gold/30
                font-sans font-medium text-sm sm:text-base text-foreground
                transition-all duration-200 w-full"
            >
              <Play className="size-4 fill-current" />
              Ver Recursos
            </Link>
          </motion.div>
        </motion.div>

        {/* Social proof */}
        <motion.p
          variants={item}
          className="font-sans text-xs text-muted-foreground/60"
        >
          Login gratuito com Google · Sem cartão de crédito
        </motion.p>
      </motion.div>

      {/* Seta de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-10 bg-linear-to-b from-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}

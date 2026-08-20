"use client";

import { useRef } from "react";
import { motion, useTransform, useReducedMotion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { Bouquet } from "@/components/brand/Bouquet";
import { FloatingPetals } from "@/components/motion/FloatingPetals";
import { Button } from "@/components/ui/Button";
import { useCursorGlide } from "@/lib/hooks/useCursorGlide";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Normalized cursor position drives the bouquet tilt.
  const { smx, smy, track } = useCursorGlide(60, 18);
  const rotate = useTransform(smx, [-1, 1], [-7, 7]);
  const tx = useTransform(smx, [-1, 1], [-14, 14]);
  const ty = useTransform(smy, [-1, 1], [-10, 10]);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!reduced) track(e.clientX, e.clientY, ref.current);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative flex min-h-[85svh] items-center overflow-hidden pt-[4.5rem]"
    >
      {/* Gradient mesh background */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] animate-blob rounded-full bg-orchid/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[560px] w-[560px] animate-blob rounded-full bg-plum/20 blur-3xl [animation-delay:-5s]" />
        <div className="absolute -bottom-40 left-1/4 h-[480px] w-[480px] animate-blob rounded-full bg-gold/15 blur-3xl [animation-delay:-9s]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blush" />
      </div>

      <FloatingPetals />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-12 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-6">
        {/* Copy */}
        <div className="pt-10 text-center lg:pt-0 lg:text-left">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-plum/15 bg-white/70 px-4 py-1.5 text-[0.8125rem] font-medium text-plum shadow-soft backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Every Emotion, Beautifully Gifted
          </motion.div>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-[2.75rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-6xl lg:text-[4.5rem]"
          >
            Design Beautiful
            <br />
            Gifts <span className="text-gradient">with AI</span>
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft lg:mx-0"
          >
            Create bouquets, greeting cards, and memorable gifts in minutes.
            Describe the feeling - Tohfa designs it, and every petal stays
            yours to edit.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Button href="/create" size="lg">
              Start Creating
            </Button>
            <Button href="/studio" variant="gold" size="lg">
              <Wand2 className="h-4.5 w-4.5" />
              Generate with AI
            </Button>
          </motion.div>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-6 text-[0.8125rem] text-ink-soft/80"
          >
            Free to start · No design skills needed
          </motion.p>
        </div>

        {/* Interactive bouquet - tilts toward the cursor */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[480px] lg:max-w-[560px]"
        >
          <div
            aria-hidden
            className="absolute inset-4 rounded-[42%_58%_61%_39%/45%_42%_58%_55%] bg-white/60 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-12 rounded-full bg-gold/15 blur-3xl"
          />
          <motion.div
            style={reduced ? undefined : { rotate, x: tx, y: ty }}
            className="animate-float-slow will-change-transform"
          >
            <Bouquet className="w-full drop-shadow-[0_24px_48px_rgba(108,74,182,0.18)]" />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block"
      >
        <div className="h-9 w-5 rounded-full border-2 border-plum/25 p-1">
          <div className="h-2 w-1.5 animate-float rounded-full bg-plum/50 [animation-duration:1.8s]" />
        </div>
      </div>
    </section>
  );
}

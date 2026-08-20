"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Flower2, Ribbon, Palette, MessageCircleHeart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const PROMPT = "Create a luxury bouquet for my wife";

const results = [
  { icon: Flower2, label: "Flowers", value: "9 peonies · 3 garden roses · lavender" },
  { icon: Ribbon, label: "Wrapping", value: "Blush silk · gold satin ribbon" },
  { icon: Palette, label: "Palette", value: "Plum · orchid · champagne gold" },
  { icon: MessageCircleHeart, label: "Greeting", value: "“Ten years, and you still feel like the beginning.”" },
];

export function AIDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(PROMPT.slice(0, i));
      if (i >= PROMPT.length) clearInterval(t);
    }, 45);
    return () => clearInterval(t);
  }, [inView]);

  const done = typed.length === PROMPT.length;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div
          ref={ref}
          className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-12 sm:px-14 sm:py-14"
        >
          {/* ambient glow */}
          <div aria-hidden className="absolute inset-0">
            <div className="absolute -top-24 left-1/4 h-72 w-72 animate-blob rounded-full bg-plum/40 blur-3xl" />
            <div className="absolute -bottom-24 right-1/5 h-72 w-72 animate-blob rounded-full bg-orchid/25 blur-3xl [animation-delay:-7s]" />
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-gold">
                <Sparkles className="h-4 w-4" /> AI Studio
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Say it. <span className="text-gradient">Tohfa designs it.</span>
              </h2>
              <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-white/70">
                Our AI doesn’t paint flat pictures. It composes real, structured
                designs - every flower, ribbon, and word remains an editable
                object on your canvas. Then just keep talking: “more luxury”,
                “add lavender”, “pastel colors”.
              </p>
              <div className="mt-8">
                <Button href="/studio" variant="gold" size="lg">
                  Try the AI Studio
                </Button>
              </div>
            </div>

            {/* Faux generation panel */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4">
                <Sparkles className="h-4.5 w-4.5 shrink-0 text-gold" />
                <p className="min-h-[1.5em] font-medium text-white">
                  {typed}
                  {!done && <span className="animate-pulse">▍</span>}
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {results.map((r, i) => (
                  <motion.div
                    key={r.label}
                    initial={{ opacity: 0, x: 24 }}
                    animate={done ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.25 + i * 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-3.5 rounded-2xl bg-white/[0.07] px-5 py-3.5"
                  >
                    <r.icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-orchid" />
                    <div>
                      <p className="text-[0.75rem] font-bold uppercase tracking-wider text-white/50">
                        {r.label}
                      </p>
                      <p className="text-[0.875rem] text-white/90">{r.value}</p>
                    </div>
                  </motion.div>
                ))}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={done ? { opacity: 1 } : {}}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="pt-1 text-center text-[0.8125rem] text-white/50"
                >
                  Every element lands on your canvas - fully editable.
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

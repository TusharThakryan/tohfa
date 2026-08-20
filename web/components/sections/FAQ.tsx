"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { faqs } from "./faq-data";

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-plum/8 bg-white/70 shadow-soft">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-display text-[1.0625rem] font-semibold text-ink">{q}</span>
        <Plus
          className={cn(
            "h-5 w-5 shrink-0 text-plum transition-transform duration-300",
            open && "rotate-45"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-6 pb-5 text-[0.9375rem] leading-relaxed text-ink-soft">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Reveal className="text-center">
          <p className="font-button text-sm font-bold uppercase tracking-[0.2em] text-plum">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Questions, answered
          </h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <Item {...f} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

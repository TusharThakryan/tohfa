"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

export function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <section className="pb-16 sm:pb-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-plum via-plum-soft to-orchid px-6 py-12 text-center sm:px-14">
            <div aria-hidden className="absolute inset-0 opacity-30">
              <div className="absolute -top-20 left-1/5 h-64 w-64 animate-blob rounded-full bg-white/30 blur-3xl" />
              <div className="absolute -bottom-24 right-1/6 h-64 w-64 animate-blob rounded-full bg-gold/40 blur-3xl [animation-delay:-6s]" />
            </div>
            <div className="relative mx-auto max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Never miss a moment worth gifting
              </h2>
              <p className="mt-3 text-[0.9375rem] text-white/80">
                Occasion reminders, new templates, and gifting inspiration -
                once a month, always lovely.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDone(true);
                }}
                className="mx-auto mt-8 flex max-w-md gap-2 rounded-full bg-white/15 p-1.5 backdrop-blur"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  disabled={done}
                  placeholder="your@email.com"
                  className="w-full rounded-full bg-transparent px-5 text-[0.9375rem] text-white placeholder:text-white/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={done}
                  className="font-button inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-6 text-[0.875rem] font-bold text-plum transition-transform hover:scale-105 active:scale-95 disabled:opacity-90"
                >
                  {done ? (
                    <>
                      <Check className="h-4 w-4" /> Subscribed
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Subscribe
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

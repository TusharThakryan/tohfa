"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SceneSVG } from "@/components/scene/SceneSVG";
import { saveProject } from "@/lib/projects";
import { uid, type GiftType, type Project, type Scene } from "@/lib/scene/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS: Record<GiftType, string[]> = {
  bouquet: [
    "A luxury bouquet for my wife on our anniversary",
    "A cheerful birthday bouquet with balloons for my best friend",
    "A gentle sympathy bouquet with lilies and lavender",
    "Red roses with black wrapping for Valentine's Day",
    "A sunflower thank-you bouquet full of sunshine",
  ],
  card: [
    "A birthday card for my best friend who loves sunflowers",
    "An anniversary card for my wife, romantic and elegant",
    "A get-well-soon card full of soft lavender",
    "A thank-you card for my favorite teacher",
    "A wedding congratulations card in ivory and gold",
  ],
};

export default function StudioPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [giftType, setGiftType] = useState<GiftType>("bouquet");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ scene: Scene; title: string; source: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, giftType }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch {
      setError("The studio hit a snag - please try again.");
    } finally {
      setBusy(false);
    }
  };

  const openInEditor = () => {
    if (!result) return;
    const project: Project = {
      id: uid("prj"),
      title: result.title || "AI Design",
      scene: result.scene,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveProject(project);
    router.push(`/create/${project.id}`);
  };

  return (
    <section className="relative min-h-[85svh] overflow-hidden pt-[4.5rem]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-[480px] w-[480px] animate-blob rounded-full bg-orchid/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/5 h-96 w-96 animate-blob rounded-full bg-gold/12 blur-3xl [animation-delay:-7s]" />
      </div>

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <Reveal className="text-center">
          <p className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-plum">
            <Sparkles className="h-4 w-4 text-gold" /> AI Studio
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Describe the feeling.
            <br />
            <span className="text-gradient">Watch it bloom.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[0.9375rem] text-ink-soft">
            Every flower, ribbon, and word arrives as a real, editable object -
            never a flat image.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="rounded-[1.75rem] border border-plum/10 bg-white/85 p-3 shadow-lift backdrop-blur">
            <div className="mb-2 flex gap-1.5 px-1 pt-1">
              {(["bouquet", "card"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setGiftType(t)}
                  className={cn(
                    "font-button rounded-full px-4 py-1.5 text-[0.75rem] font-bold capitalize",
                    giftType === t ? "bg-plum text-white" : "bg-plum/5 text-ink-soft hover:bg-plum/10"
                  )}
                >
                  {t === "card" ? "Greeting card" : "Bouquet"}
                </button>
              ))}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generate();
                }
              }}
              rows={2}
              placeholder={
                giftType === "card"
                  ? "A birthday card for my best friend - write something heartfelt inside…"
                  : "Create a luxury bouquet for my wife…"
              }
              className="w-full resize-none bg-transparent px-3 py-2 text-[1rem] outline-none placeholder:text-ink-soft/50"
            />
            <div className="flex items-center justify-between px-1 pb-1">
              <p className="hidden text-[0.6875rem] text-ink-soft/60 sm:block">
                Enter to generate · every result stays fully editable
              </p>
              <button
                onClick={generate}
                disabled={busy || !prompt.trim()}
                className="font-button inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-soft px-6 py-2.5 text-[0.875rem] font-bold text-ink shadow-gold transition-all hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {busy ? "Designing…" : "Generate"}
              </button>
            </div>
          </div>
        </Reveal>

        {!result && !busy && (
          <Reveal delay={0.18} className="mt-6">
            <p className="mb-2.5 text-center text-[0.75rem] font-bold uppercase tracking-wider text-ink-soft/70">
              Try one of these
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS[giftType].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="rounded-full border border-plum/15 bg-white/70 px-3.5 py-1.5 text-[0.75rem] text-ink-soft transition-colors hover:border-plum/40 hover:text-plum"
                >
                  {s}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        {error && <p className="mt-6 text-center text-[0.875rem] text-red-500">{error}</p>}

        <AnimatePresence>
          {busy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 flex flex-col items-center gap-3 text-ink-soft"
            >
              <div className="flex gap-2">
                {["🌸", "🌷", "🌻"].map((f, i) => (
                  <span key={i} className="animate-float text-3xl" style={{ animationDelay: `${i * 0.4}s` }}>
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-[0.875rem]">
                {giftType === "card"
                  ? "Choosing flowers, writing your message…"
                  : "Choosing flowers, tying the ribbon…"}
              </p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <div className="overflow-hidden rounded-[1.75rem] border border-plum/10 bg-white shadow-lift">
                {result.scene.pages.length > 1 ? (
                  <div className="grid grid-cols-3 gap-1.5 bg-mist/60 p-2 sm:gap-3 sm:p-4">
                    {result.scene.pages.map((pg, i) => (
                      <div key={pg.id} className="overflow-hidden rounded-xl border border-plum/10 bg-white shadow-soft">
                        <SceneSVG scene={result.scene} pageIndex={i} className="aspect-[4/5] w-full" />
                        <p className="py-1.5 text-center text-[0.6875rem] font-bold uppercase tracking-wider text-ink-soft">
                          {pg.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <SceneSVG scene={result.scene} className="mx-auto aspect-[9/11] max-h-[520px] w-full" />
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-plum/8 px-5 py-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">{result.title}</p>
                    <p className="text-[0.75rem] text-ink-soft">
                      {result.scene.pages.reduce((n, pg) => n + pg.layers.length, 0)} editable elements
                      {result.scene.pages.length > 1 ? ` across ${result.scene.pages.length} pages` : ""} ·{" "}
                      {result.source === "claude" ? "designed by Claude" : "designed by Tohfa"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={generate}
                      className="font-button rounded-full border border-plum/20 px-4 py-2 text-[0.8125rem] font-bold text-plum hover:bg-plum/5"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={openInEditor}
                      className="font-button inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-plum to-plum-soft px-5 py-2 text-[0.8125rem] font-bold text-white shadow-soft hover:shadow-lift"
                    >
                      Open in editor <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { applyRefineOps, type RefineOp } from "@/lib/ai/spec";
import { cn } from "@/lib/utils";
import { useEditorStore } from "../store";
import type { EditorEngine } from "../engine";

export function ChatDock({ engine }: { engine: () => EditorEngine | null }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { chat, chatBusy, addChat, setChatBusy, replaceScene, pageIndex } = useEditorStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, open]);

  const send = async () => {
    const message = input.trim();
    const eng = engine();
    if (!message || chatBusy || !eng) return;
    setInput("");
    addChat({ role: "user", text: message });
    setChatBusy(true);
    try {
      const scene = eng.getScene();
      const res = await fetch("/api/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene, message }),
      });
      const data = (await res.json()) as { reply: string; ops: RefineOp[] };
      if (data.ops?.length) {
        const next = applyRefineOps(scene, data.ops, pageIndex);
        await eng.loadPage(next, pageIndex);
        replaceScene(next);
      }
      addChat({ role: "assistant", text: data.reply ?? "Done." });
    } catch {
      addChat({ role: "assistant", text: "Something went wrong - try again in a moment." });
    } finally {
      setChatBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "font-button fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-[0.875rem] font-bold shadow-lift transition-transform hover:scale-105",
          open ? "bg-ink text-white" : "bg-gradient-to-r from-gold to-gold-soft text-ink"
        )}
      >
        {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {open ? "Close" : "AI edit"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 right-5 z-40 flex h-[min(420px,65svh)] w-[min(330px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-plum/10 bg-white shadow-lift"
          >
            <div className="flex items-center gap-2 border-b border-plum/8 bg-gradient-to-r from-plum/5 to-orchid/10 px-4 py-3">
              <Sparkles className="h-4 w-4 text-gold" />
              <p className="font-button text-[0.8125rem] font-bold text-ink">Design with AI</p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-3.5">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-[0.8125rem] leading-relaxed",
                    m.role === "user"
                      ? "ml-auto rounded-br-md bg-plum text-white"
                      : "rounded-bl-md bg-mist text-ink"
                  )}
                >
                  {m.text}
                </div>
              ))}
              {chatBusy && (
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-mist px-3.5 py-2.5 text-[0.8125rem] text-ink-soft w-fit">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> redesigning…
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
              {["More luxury", "Pastel colors", "Add butterflies", "Redesign: pastel spring bouquet"].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full bg-plum/5 px-2.5 py-1 text-[0.6875rem] text-plum hover:bg-plum/10"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-2 border-t border-plum/8 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Tweak it - or describe a whole new design…"
                className="w-full rounded-full border border-plum/15 px-4 py-2 text-[0.8125rem] outline-none focus:border-plum/40"
              />
              <button
                onClick={send}
                disabled={chatBusy || !input.trim()}
                className="rounded-full bg-plum p-2.5 text-white disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

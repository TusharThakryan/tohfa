"use client";

import Link from "next/link";
import { Copy, Plus, Sparkles, Trash2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SceneSVG } from "@/components/scene/SceneSVG";
import { useClientValue } from "@/lib/hooks/useClientValue";
import { deleteProject, duplicateProject, listProjects } from "@/lib/projects";
import { GIFT_TYPES } from "@/lib/scene/types";

export default function DashboardPage() {
  const [projects, setProjects] = useClientValue(() => listProjects());
  const refresh = () => setProjects(listProjects());

  return (
    <section className="min-h-[85svh] pt-[4.5rem]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-button text-sm font-bold uppercase tracking-[0.2em] text-plum">
              My gifts
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
              Your studio
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/studio"
              className="font-button inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-[0.8125rem] font-bold text-ink hover:bg-gold/20"
            >
              <Sparkles className="h-4 w-4 text-gold" /> AI Studio
            </Link>
            <Link
              href="/create"
              className="font-button inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-plum to-plum-soft px-4 py-2 text-[0.8125rem] font-bold text-white shadow-soft hover:shadow-lift"
            >
              <Plus className="h-4 w-4" /> New gift
            </Link>
          </div>
        </Reveal>

        {projects && projects.length === 0 && (
          <Reveal className="mt-12 text-center">
            <p className="animate-float inline-block text-5xl">🌷</p>
            <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
              Nothing here yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] text-ink-soft">
              Your first gift is one thought away - start blank or let AI design it.
            </p>
          </Reveal>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(projects ?? []).map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.04, 0.3)}>
              <div className="group relative overflow-hidden rounded-2xl border border-plum/8 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                <Link href={`/create/${p.id}`}>
                  <SceneSVG scene={p.scene} className="aspect-[4/5] w-full" />
                </Link>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[0.8125rem] font-semibold text-ink">{p.title}</p>
                    <p className="text-[0.6875rem] text-ink-soft">
                      {GIFT_TYPES[p.scene.giftType].label} ·{" "}
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      title="Duplicate"
                      onClick={() => {
                        duplicateProject(p.id);
                        refresh();
                      }}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-plum/10 hover:text-plum"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => {
                        if (confirm(`Delete “${p.title}”? This can't be undone.`)) {
                          deleteProject(p.id);
                          refresh();
                        }
                      }}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

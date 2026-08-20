"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flower2, Mail, Sparkles, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SceneSVG } from "@/components/scene/SceneSVG";
import { useClientValue } from "@/lib/hooks/useClientValue";
import { listProjects, saveProject } from "@/lib/projects";
import { createProject, type GiftType } from "@/lib/scene/types";

const OPTIONS: { giftType: GiftType; icon: typeof Flower2; title: string; body: string }[] = [
  {
    giftType: "bouquet",
    icon: Flower2,
    title: "Bouquet",
    body: "Compose flowers, wrapping, and ribbon on an open canvas.",
  },
  {
    giftType: "card",
    icon: Mail,
    title: "Greeting Card",
    body: "Front, inside, and back - words, stickers, and heart.",
  },
];

export default function CreatePage() {
  const router = useRouter();
  const [recent = []] = useClientValue(() => listProjects().slice(0, 4));

  const start = (giftType: GiftType) => {
    const project = createProject(giftType);
    saveProject(project);
    router.push(`/create/${project.id}`);
  };

  return (
    <section className="relative min-h-[85svh] overflow-hidden pt-[4.5rem]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/5 h-96 w-96 animate-blob rounded-full bg-orchid/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/5 h-96 w-96 animate-blob rounded-full bg-gold/10 blur-3xl [animation-delay:-6s]" />
      </div>

      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <Reveal className="text-center">
          <p className="font-button text-sm font-bold uppercase tracking-[0.2em] text-plum">
            Create
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            What are we making today?
          </h1>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {OPTIONS.map((o, i) => (
            <Reveal key={o.giftType} delay={i * 0.08}>
              <button
                onClick={() => start(o.giftType)}
                className="group w-full rounded-3xl border border-plum/10 bg-white/80 p-8 text-left shadow-soft transition-all duration-500 ease-spring hover:-translate-y-1.5 hover:border-plum/25 hover:shadow-lift"
              >
                <div className="inline-flex rounded-2xl bg-gradient-to-br from-plum/10 to-orchid/20 p-4 text-plum transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:-rotate-6">
                  <o.icon className="h-7 w-7" strokeWidth={1.7} />
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold text-ink">{o.title}</h2>
                <p className="mt-1.5 text-[0.875rem] text-ink-soft">{o.body}</p>
                <p className="font-button mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-plum">
                  Start blank <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </p>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-8">
          <Link
            href="/studio"
            className="group flex items-center justify-between rounded-3xl bg-ink p-6 text-white shadow-lift transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gold/20 p-3">
                <Sparkles className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">Or let AI design it</p>
                <p className="text-[0.8125rem] text-white/70">
                  Describe the moment - get a fully editable design in seconds.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {recent.length > 0 && (
          <Reveal delay={0.2} className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">Recent gifts</h2>
              <Link href="/dashboard" className="font-button text-[0.8125rem] font-bold text-plum">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {recent.map((p) => (
                <Link
                  key={p.id}
                  href={`/create/${p.id}`}
                  className="group overflow-hidden rounded-2xl border border-plum/8 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <SceneSVG scene={p.scene} className="aspect-[4/5] w-full" />
                  <p className="truncate px-3 py-2 text-[0.75rem] font-medium text-ink">{p.title}</p>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

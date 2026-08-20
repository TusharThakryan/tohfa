"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/Logo";
import { FloatingPetals } from "@/components/motion/FloatingPetals";
import { SceneSVG } from "@/components/scene/SceneSVG";
import { LivingBouquet } from "@/features/living/LivingBouquet";
import { useClientValue } from "@/lib/hooks/useClientValue";
import { getProject } from "@/lib/projects";
import { GIFT_TYPES } from "@/lib/scene/types";
import { cn } from "@/lib/utils";

/**
 * Share view. In this local-first phase, gifts open on the device that made
 * them (server-side share pages with OG images arrive with the API release).
 */
export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project] = useClientValue(() => getProject(id), [id]);
  const [pageIndex, setPageIndex] = useState(0);

  if (project === undefined) return <div className="h-svh bg-blush" />;

  if (project === null) {
    return (
      <section className="flex min-h-[85svh] flex-col items-center justify-center bg-blush px-6 text-center">
        <div className="group inline-block">
          <LogoMark className="h-14 w-14" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
          This gift isn&rsquo;t on this device
        </h1>
        <p className="mt-3 max-w-sm text-[0.9375rem] text-ink-soft">
          Gifts currently live where they were made. Hosted share links with
          previews arrive with Tohfa accounts - soon.
        </p>
        <Link
          href="/create"
          className="font-button mt-8 rounded-full bg-gradient-to-r from-plum to-plum-soft px-6 py-3 text-[0.875rem] font-bold text-white shadow-soft"
        >
          Make your own gift
        </Link>
      </section>
    );
  }

  const pages = GIFT_TYPES[project.scene.giftType].pages;
  const living = project.scene.giftType === "bouquet";

  return (
    <section className="relative flex min-h-[85svh] flex-col items-center overflow-hidden bg-gradient-to-b from-blush via-white to-petal px-5 py-10">
      <FloatingPetals />

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex items-center gap-2"
      >
        <LogoMark className="h-8 w-8" />
        <span className="font-display text-lg font-semibold text-ink">TOHFA</span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-[0.8125rem] font-medium uppercase tracking-[0.25em] text-plum"
      >
        Someone made this for you
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 w-full max-w-md"
      >
        <div
          className={cn(
            "overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-lift",
            !living && "animate-float-slow"
          )}
        >
          {living ? (
            <LivingBouquet scene={project.scene} />
          ) : (
            <SceneSVG scene={project.scene} pageIndex={pageIndex} className="w-full" />
          )}
        </div>
        {pages.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {pages.map((name, i) => (
              <button
                key={name}
                onClick={() => setPageIndex(i)}
                className={cn(
                  "font-button rounded-full px-4 py-1.5 text-[0.75rem] font-bold",
                  i === pageIndex ? "bg-plum text-white" : "bg-white/70 text-ink-soft"
                )}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        // The greeting waits for the bouquet's bloom sequence to finish
        transition={{ delay: living ? 2.7 : 0.8, duration: 0.9 }}
        className="mt-8 max-w-md text-center font-display text-2xl font-semibold leading-snug text-ink"
      >
        {project.scene.greeting ?? project.title}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-10 text-center"
      >
        <p className="text-[0.75rem] text-ink-soft">Every emotion, beautifully gifted.</p>
        <Link href="/create" className="font-button mt-2 inline-block text-[0.8125rem] font-bold text-plum">
          Send one back →
        </Link>
      </motion.div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Download,
  Minus,
  Plus,
  Redo2,
  Share2,
  Undo2,
} from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { GIFT_TYPES } from "@/lib/scene/types";
import { cn } from "@/lib/utils";
import { useEditorStore } from "../store";
import type { EditorEngine } from "../engine";
import { SupportModal } from "./SupportModal";

export function TopBar({ engine }: { engine: () => EditorEngine | null }) {
  const { project, pageIndex, saved, past, future, zoom, setZoom, setTitle, setPageIndex, undo, redo } =
    useEditorStore();
  const [supportMode, setSupportMode] = useState<"share" | "export" | null>(null);
  const [shared, setShared] = useState(false);

  if (!project) return null;
  const pages = GIFT_TYPES[project.scene.giftType].pages;

  const doUndo = () => {
    const s = undo();
    if (s) engine()?.loadPage(s, useEditorStore.getState().pageIndex);
  };
  const doRedo = () => {
    const s = redo();
    if (s) engine()?.loadPage(s, useEditorStore.getState().pageIndex);
  };

  const onShared = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <header className="relative z-20 flex h-14 items-center gap-2 overflow-x-auto border-b border-plum/10 bg-white/90 px-3 backdrop-blur [scrollbar-width:none]">
      <Link
        href="/dashboard"
        className="group flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-ink-soft hover:bg-plum/5 hover:text-plum"
        title="Back to my gifts"
      >
        <ArrowLeft className="h-4 w-4" />
        <LogoMark className="hidden h-6 w-6 sm:block" />
      </Link>

      <input
        value={project.title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-button w-24 shrink-0 rounded-lg border border-transparent bg-transparent px-2 py-1 text-[0.875rem] font-bold text-ink outline-none hover:border-plum/15 focus:border-plum/30 sm:w-44 md:w-56"
      />
      <span className="hidden text-[0.6875rem] text-ink-soft/70 sm:block">
        {saved ? "Saved" : "Saving…"}
      </span>

      {pages.length > 1 && (
        <div className="ml-1 flex shrink-0 gap-1 rounded-full bg-plum/5 p-1 sm:ml-2">
          {pages.map((name, i) => (
            <button
              key={name}
              onClick={() => {
                setPageIndex(i);
                engine()?.loadPage(useEditorStore.getState().project!.scene, i);
              }}
              className={cn(
                "font-button rounded-full px-2 py-1 text-[0.6875rem] font-bold sm:px-3 sm:text-[0.75rem]",
                i === pageIndex ? "bg-white text-plum shadow-sm" : "text-ink-soft hover:text-ink"
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          onClick={doUndo}
          disabled={past.length === 0}
          title="Undo (⌘Z)"
          className="rounded-lg p-2 text-ink-soft hover:bg-plum/5 hover:text-plum disabled:opacity-30"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={doRedo}
          disabled={future.length === 0}
          title="Redo (⌘⇧Z)"
          className="rounded-lg p-2 text-ink-soft hover:bg-plum/5 hover:text-plum disabled:opacity-30"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="mx-1 hidden items-center gap-1 rounded-full bg-plum/5 px-1 py-0.5 sm:flex">
          <button onClick={() => setZoom(zoom - 0.15)} className="rounded-full p-1.5 text-ink-soft hover:text-plum">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-[0.6875rem] font-bold text-ink-soft">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(zoom + 0.15)} className="rounded-full p-1.5 text-ink-soft hover:text-plum">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={() => setSupportMode("share")}
          className="font-button flex items-center gap-1.5 rounded-full border border-plum/20 px-2.5 py-1.5 text-[0.8125rem] font-bold text-plum hover:bg-plum/5 sm:px-3.5"
        >
          {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          <span className="hidden sm:inline">{shared ? "Link copied" : "Share"}</span>
        </button>

        <button
          onClick={() => setSupportMode("export")}
          className="font-button flex items-center gap-1.5 rounded-full bg-gradient-to-r from-plum to-plum-soft px-3 py-1.5 text-[0.8125rem] font-bold text-white shadow-soft hover:shadow-lift sm:px-4"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {supportMode && (
        <SupportModal
          mode={supportMode}
          project={project}
          pageIndex={pageIndex}
          onClose={() => setSupportMode(null)}
          onShared={onShared}
        />
      )}
    </header>
  );
}

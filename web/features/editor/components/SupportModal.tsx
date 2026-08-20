"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Download, Heart, Link2, Loader2, X } from "lucide-react";
import { downloadJSON, downloadPNG, downloadSVG } from "@/lib/export";
import { site } from "@/lib/site";
import type { Project } from "@/lib/scene/types";
import { cn } from "@/lib/utils";

const AMOUNTS = [12, 8, 4];

/**
 * A gentle "fuel the studio" moment shown before sharing or exporting.
 * Supporting is warmly invited, never required - the share/export actions
 * are always one click away.
 */
export function SupportModal({
  mode,
  project,
  pageIndex,
  onClose,
  onShared,
}: {
  mode: "share" | "export";
  project: Project;
  pageIndex: number;
  onClose: () => void;
  onShared: () => void;
}) {
  const [amount, setAmount] = useState(8);
  const [busy, setBusy] = useState<string | null>(null);
  const [thanked, setThanked] = useState(false);

  const support = () => {
    if (site.supportUrl) {
      window.open(site.supportUrl, "_blank", "noopener");
    } else {
      setThanked(true);
      setTimeout(() => setThanked(false), 2600);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/g/${project.id}`;
    try {
      await navigator.clipboard.writeText(url);
      onShared();
    } catch {
      window.open(url, "_blank");
    }
    onClose();
  };

  const runExport = async (label: string, fn: () => Promise<void> | void) => {
    setBusy(label);
    try {
      await fn();
      onClose();
    } finally {
      setBusy(null);
    }
  };

  const exports = [
    ["PNG · HD (2×)", () => downloadPNG(project.scene, pageIndex, project.title, 2)],
    ["PNG · 4K (4×)", () => downloadPNG(project.scene, pageIndex, project.title, 4)],
    ["SVG · vector", () => downloadSVG(project.scene, pageIndex, project.title)],
    ["JSON · project", () => downloadJSON(project)],
  ] as const;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lift"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2 text-ink-soft hover:bg-plum/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-plum/5 to-orchid/10 px-6 pb-5 pt-7 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-soft">
            <Heart className="h-5 w-5 text-plum" />
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold text-ink">
            Loved making this?
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[0.8125rem] leading-relaxed text-ink-soft">
            Tohfa is handcrafted by a tiny studio. If this gift made you smile,
            fuel the next flower - it keeps new petals, cards, and ideas coming.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-[0.75rem] font-medium text-ink-soft">pay what feels right:</span>
            {AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={cn(
                  "font-button rounded-full px-3.5 py-1.5 text-[0.8125rem] font-bold transition-colors",
                  amount === a ? "bg-plum text-white" : "bg-white text-ink-soft hover:bg-plum/10"
                )}
              >
                ${a}
              </button>
            ))}
          </div>

          <button
            onClick={support}
            className="font-button mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-soft px-6 py-2.5 text-[0.875rem] font-bold text-ink shadow-gold transition-transform hover:-translate-y-0.5"
          >
            <Heart className="h-4 w-4" />
            {thanked ? "You're wonderful - thank you!" : `Support with $${amount}`}
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-center text-[0.75rem] text-ink-soft/80">
            No pressure at all - your gift is yours either way.
          </p>

          {mode === "share" ? (
            <button
              onClick={copyLink}
              className="font-button mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-plum/20 px-4 py-3 text-[0.875rem] font-bold text-plum hover:bg-plum/5"
            >
              <Link2 className="h-4 w-4" /> Copy my gift link
            </button>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {exports.map(([label, fn]) => (
                <button
                  key={label}
                  onClick={() => runExport(label, fn)}
                  disabled={busy !== null}
                  className="font-button flex items-center justify-center gap-1.5 rounded-2xl border border-plum/20 px-3 py-2.5 text-[0.8125rem] font-bold text-plum hover:bg-plum/5 disabled:opacity-50"
                >
                  {busy === label ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : busy === null ? (
                    <Download className="h-3.5 w-3.5" />
                  ) : (
                    <Check className="h-3.5 w-3.5 opacity-0" />
                  )}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

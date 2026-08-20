"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Copy,
  FlipHorizontal2,
  Lock,
  LockOpen,
  Trash2,
} from "lucide-react";
import { useEditorStore } from "../store";
import type { EditorEngine } from "../engine";
import { cn } from "@/lib/utils";

const SWATCHES = [
  "#C4455E", "#E8A0BF", "#C996CC", "#8B6CD1", "#6C4AB6",
  "#F2C14E", "#D4AF37", "#8EC5A4", "#7C9CD9", "#FFFFFF",
  "#F7E2E2", "#D9B382", "#241C33", "#18181B",
];

const BACKGROUNDS = [
  "#FFF4F8", "#FFFFFF", "#FAF8FD", "#FFF8EE", "#F6F6F6", "#241C33",
  "linear-gradient(175deg, #FFF9FB, #F6EEF8)",
  "linear-gradient(170deg, #FFF8EE, #FDEDF3)",
  "linear-gradient(180deg, #FDFBF7, #F4EFF7)",
  "linear-gradient(200deg, #2E2440, #6C4AB6)",
  "linear-gradient(165deg, #FFF2E9, #FBD9E6)",
  "linear-gradient(180deg, #EDF4FF, #F3ECFA)",
  "linear-gradient(160deg, #F0FAF3, #E3F0FF)",
  "linear-gradient(215deg, #22303F, #5B4A8A)",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-plum/8 px-4 py-3.5">
      <p className="font-button mb-2.5 text-[0.6875rem] font-bold uppercase tracking-wider text-ink-soft">
        {title}
      </p>
      {children}
    </div>
  );
}

function Slider({
  value, min, max, step = 1, onChange,
}: {
  value: number; min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-plum"
    />
  );
}

export function RightPanel({ engine }: { engine: () => EditorEngine | null }) {
  const selection = useEditorStore((s) => s.selection);
  const layer = selection.layer;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-l border-plum/10 bg-white/80">
      {selection.count === 0 && (
        <>
          <Section title="Canvas background">
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => engine()?.setBackground(bg)}
                  className="aspect-square rounded-lg border border-plum/15 transition-transform hover:scale-110"
                  style={{ background: bg }}
                  title={bg}
                />
              ))}
            </div>
          </Section>
          <div className="px-4 py-4 text-[0.8125rem] leading-relaxed text-ink-soft">
            <p className="font-semibold text-ink">Nothing selected</p>
            <p className="mt-1.5">
              Click an element to edit it - drag to move, corners to resize and rotate.
              Double-click text to type.
            </p>
            <p className="mt-3 rounded-xl bg-plum/5 p-3 text-[0.75rem]">
              <span className="font-bold">Shortcuts:</span> ⌘Z undo · ⌘⇧Z redo · ⌘D duplicate ·
              Delete remove · arrows nudge
            </p>
          </div>
        </>
      )}

      {selection.count > 1 && (
        <Section title={`${selection.count} elements selected`}>
          <div className="flex gap-2">
            <button
              onClick={() => engine()?.duplicateSelected()}
              className="flex-1 rounded-lg bg-plum/8 p-2 text-plum hover:bg-plum/15"
              title="Duplicate"
            >
              <Copy className="mx-auto h-4 w-4" />
            </button>
            <button
              onClick={() => engine()?.deleteSelected()}
              className="flex-1 rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"
              title="Delete"
            >
              <Trash2 className="mx-auto h-4 w-4" />
            </button>
          </div>
        </Section>
      )}

      {layer && (
        <>
          {layer.type === "text" && (
            <Section title="Text">
              <textarea
                value={layer.text ?? ""}
                onChange={(e) => engine()?.updateSelected({ text: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-plum/15 bg-white p-2.5 text-[0.8125rem] outline-none focus:border-plum/40"
              />
              <div className="mt-2 flex gap-1.5">
                {(["display", "body", "hand"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => engine()?.updateSelected({ fontFamily: f })}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-[0.75rem] capitalize",
                      layer.fontFamily === f
                        ? "border-plum bg-plum/8 text-plum"
                        : "border-plum/15 text-ink-soft hover:border-plum/30"
                    )}
                  >
                    {f === "display" ? "Serif" : f === "body" ? "Sans" : "Script"}
                  </button>
                ))}
              </div>
              <div className="mt-2.5">
                <p className="mb-1 text-[0.6875rem] text-ink-soft">Size · {layer.fontSize ?? 40}px</p>
                <Slider
                  value={layer.fontSize ?? 40}
                  min={14}
                  max={140}
                  onChange={(v) => engine()?.updateSelected({ fontSize: v })}
                />
              </div>
            </Section>
          )}

          <Section title={layer.type === "text" ? "Text color" : "Color"}>
            <div className="grid grid-cols-7 gap-1.5">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() =>
                    layer.type === "text"
                      ? engine()?.updateSelected({ color: c })
                      : engine()?.updateSelected({ tint: c })
                  }
                  className={cn(
                    "aspect-square rounded-full border transition-transform hover:scale-110",
                    (layer.type === "text" ? layer.color : layer.tint) === c
                      ? "border-ink ring-2 ring-plum/40"
                      : "border-black/10"
                  )}
                  style={{ background: c }}
                />
              ))}
              <label className="relative aspect-square cursor-pointer overflow-hidden rounded-full border border-black/10 bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]">
                <input
                  type="color"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) =>
                    layer.type === "text"
                      ? engine()?.updateSelected({ color: e.target.value })
                      : engine()?.updateSelected({ tint: e.target.value })
                  }
                />
              </label>
            </div>
          </Section>

          <Section title={`Opacity · ${Math.round(layer.opacity * 100)}%`}>
            <Slider
              value={layer.opacity}
              min={0.05}
              max={1}
              step={0.01}
              onChange={(v) => engine()?.updateSelected({ opacity: v })}
            />
          </Section>

          <Section title={`Size · ${layer.scaleX.toFixed(1)}×`}>
            <Slider
              value={layer.scaleX}
              min={0.2}
              max={6}
              step={0.05}
              onChange={(v) => engine()?.updateSelected({ scaleX: v })}
            />
          </Section>

          <Section title={`Rotation · ${Math.round(layer.rotation)}°`}>
            <Slider
              value={((layer.rotation % 360) + 360) % 360 > 180 ? (((layer.rotation % 360) + 360) % 360) - 360 : ((layer.rotation % 360) + 360) % 360}
              min={-180}
              max={180}
              onChange={(v) => engine()?.updateSelected({ rotation: v })}
            />
          </Section>

          <Section title="Arrange">
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  ["front", ChevronsUp, "To front"],
                  ["up", ArrowUp, "Forward"],
                  ["down", ArrowDown, "Backward"],
                  ["back", ChevronsDown, "To back"],
                ] as const
              ).map(([dir, Icon, label]) => (
                <button
                  key={dir}
                  onClick={() => engine()?.reorderSelected(dir)}
                  title={label}
                  className="rounded-lg bg-plum/5 p-2 text-ink-soft hover:bg-plum/12 hover:text-plum"
                >
                  <Icon className="mx-auto h-4 w-4" />
                </button>
              ))}
            </div>
          </Section>

          <Section title="Actions">
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => engine()?.updateSelected({ flipX: !layer.flipX })}
                title="Flip"
                className="rounded-lg bg-plum/5 p-2 text-ink-soft hover:bg-plum/12 hover:text-plum"
              >
                <FlipHorizontal2 className="mx-auto h-4 w-4" />
              </button>
              <button
                onClick={() => engine()?.updateSelected({ locked: !layer.locked })}
                title={layer.locked ? "Unlock" : "Lock"}
                className={cn(
                  "rounded-lg p-2",
                  layer.locked
                    ? "bg-gold/20 text-gold"
                    : "bg-plum/5 text-ink-soft hover:bg-plum/12 hover:text-plum"
                )}
              >
                {layer.locked ? <Lock className="mx-auto h-4 w-4" /> : <LockOpen className="mx-auto h-4 w-4" />}
              </button>
              <button
                onClick={() => engine()?.duplicateSelected()}
                title="Duplicate"
                className="rounded-lg bg-plum/5 p-2 text-ink-soft hover:bg-plum/12 hover:text-plum"
              >
                <Copy className="mx-auto h-4 w-4" />
              </button>
              <button
                onClick={() => engine()?.deleteSelected()}
                title="Delete"
                className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"
              >
                <Trash2 className="mx-auto h-4 w-4" />
              </button>
            </div>
          </Section>
        </>
      )}
    </aside>
  );
}

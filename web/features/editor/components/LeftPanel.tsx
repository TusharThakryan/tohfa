"use client";

import { useMemo, useState } from "react";
import { Type, Search } from "lucide-react";
import { ASSETS, CATEGORY_LABELS, assetSvg, type AssetCategory } from "@/lib/assets";
import { cn } from "@/lib/utils";
import type { EditorEngine } from "../engine";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as AssetCategory[];

export function LeftPanel({ engine }: { engine: () => EditorEngine | null }) {
  const [category, setCategory] = useState<AssetCategory>("flower");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return ASSETS.filter(
        (a) => a.name.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q))
      );
    }
    return ASSETS.filter((a) => a.category === category);
  }, [category, query]);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-plum/10 bg-white/80">
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-xl bg-mist px-3 py-2">
          <Search className="h-4 w-4 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search elements…"
            className="w-full bg-transparent text-[0.8125rem] outline-none placeholder:text-ink-soft/60"
          />
        </div>
      </div>

      {!query && (
        <div className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "font-button shrink-0 rounded-full px-3 py-1.5 text-[0.75rem] font-bold transition-colors",
                category === c ? "bg-plum text-white" : "bg-plum/5 text-ink-soft hover:bg-plum/10"
              )}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      )}

      <div className="grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto p-3">
        {visible.map((asset) => (
          <button
            key={asset.id}
            title={asset.name}
            onClick={() => engine()?.addAsset(asset.id)}
            className="group aspect-square rounded-xl border border-plum/8 bg-white p-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-plum/30 hover:shadow-soft"
            dangerouslySetInnerHTML={{ __html: assetSvg(asset) }}
          />
        ))}
        {visible.length === 0 && (
          <p className="col-span-3 pt-6 text-center text-[0.8125rem] text-ink-soft">
            Nothing matches “{query}”
          </p>
        )}
      </div>

      <div className="border-t border-plum/10 p-3">
        <button
          onClick={() => engine()?.addText()}
          className="font-button flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[0.8125rem] font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Type className="h-4 w-4" /> Add text
        </button>
      </div>
    </aside>
  );
}

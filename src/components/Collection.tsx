"use client";

import { useState } from "react";
import type { CatchResult } from "@/lib/types";
import { rarityConfig } from "@/lib/rarityColors";

interface CollectionProps {
  catches: CatchResult[];
  onSelect?: (c: CatchResult) => void;
}

export default function Collection({ catches, onSelect }: CollectionProps) {
  const [selected, setSelected] = useState<CatchResult | null>(null);

  function handleSelect(c: CatchResult) {
    setSelected((prev) => (prev === c ? null : c));
    onSelect?.(c);
  }

  // Most recent first
  const sorted = [...catches].reverse();

  return (
    <div className="w-full border-2 border-slate-700 bg-ocean-900 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-pixel text-[0.5rem] text-slate-400">
          Collection
        </span>
        {catches.length > 0 && (
          <span className="font-pixel text-[0.42rem] text-slate-600">
            {catches.length} caught this session
          </span>
        )}
      </div>

      {/* Empty state */}
      {catches.length === 0 ? (
        <div className="py-3 flex flex-col items-center gap-2 opacity-50">
          <span className="text-2xl">🎣</span>
          <span className="font-pixel text-[0.42rem] text-slate-600 text-center leading-loose">
            No catches yet.
          </span>
          <span className="font-pixel text-[0.42rem] text-slate-600 text-center leading-loose">
            Cast a prompt to start!
          </span>
        </div>
      ) : (
        <>
          {/* Horizontal scroll row */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sorted.map((c, i) => {
              const cfg = rarityConfig[c.rarity] ?? rarityConfig.common;
              const isActive = selected === c;
              // Key: species + reversed index gives a stable key as new items prepend
              return (
                <button
                  key={`${c.species}-${catches.length - 1 - i}`}
                  onClick={() => handleSelect(c)}
                  className={[
                    "flex-shrink-0 w-12 h-12 border-2 flex items-center justify-center",
                    "transition-all cursor-pointer text-xl",
                    "min-w-[48px]", // explicit touch target
                    cfg.border,
                    isActive
                      ? `${cfg.bg} scale-110 ${cfg.glow}`
                      : "bg-ocean-800 hover:scale-105 hover:border-slate-500",
                  ].join(" ")}
                  title={c.species}
                  aria-label={`${c.species} — ${cfg.label}`}
                >
                  {c.emoji}
                </button>
              );
            })}
          </div>

          {/* Expanded detail panel for selected fish */}
          {selected && (
            <div
              className={[
                "mt-3 pt-3 border-t border-slate-700/50 p-2",
                rarityConfig[selected.rarity]?.bg ?? "bg-ocean-800",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{selected.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-pixel text-[0.5rem] truncate ${
                      rarityConfig[selected.rarity]?.color ?? "text-slate-300"
                    }`}
                  >
                    {selected.species}
                  </div>
                  {selected.scientificName && (
                    <div className="text-[0.65rem] text-slate-500 italic truncate">
                      {selected.scientificName}
                    </div>
                  )}
                </div>
                <span
                  className={[
                    "font-pixel text-[0.4rem] border px-1 py-0.5 flex-shrink-0",
                    rarityConfig[selected.rarity]?.color ?? "text-slate-400",
                    rarityConfig[selected.rarity]?.border ?? "border-slate-600",
                  ].join(" ")}
                >
                  {rarityConfig[selected.rarity]?.label ?? selected.rarity}
                </span>
              </div>
              <p className="text-[0.7rem] text-slate-400 leading-relaxed italic">
                &ldquo;{selected.flavorText}&rdquo;
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

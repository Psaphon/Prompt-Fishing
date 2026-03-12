"use client";

import type { Scores } from "@/lib/types";
import { rarityConfig } from "@/lib/rarityColors";

interface ScoreBreakdownProps {
  scores: Scores | null;
  habitat?: string;
  sizeClass?: string;
  rarity?: string;
}

const HABITAT_LABELS: Record<string, string> = {
  pond:            "Pond",
  river_lake:      "River & Lake",
  coastal:         "Coastal",
  reef_open_sea:   "Reef & Open Sea",
  deep_ocean:      "Deep Ocean",
  mountain_stream: "Mountain Stream",
  volcanic_arctic: "Volcanic Arctic",
  trash:           "Trash",
};

const SIZE_LABELS: Record<string, string> = {
  tiny:   "Tiny",
  small:  "Small",
  medium: "Medium",
  large:  "Large",
  trophy: "TROPHY",
};

const SCORE_DIMS = [
  { emoji: "🌊", label: "Depth",    key: "depth"        as const, barColor: "bg-blue-500"   },
  { emoji: "🎯", label: "Spec.",    key: "specificity"  as const, barColor: "bg-amber-500"  },
  { emoji: "🎨", label: "Create",   key: "creativity"   as const, barColor: "bg-purple-500" },
  { emoji: "💎", label: "Clarity",  key: "clarity"      as const, barColor: "bg-cyan-500"   },
];

export default function ScoreBreakdown({
  scores,
  habitat,
  sizeClass,
  rarity,
}: ScoreBreakdownProps) {
  if (!scores) return null;

  const cfg = rarity ? (rarityConfig[rarity] ?? rarityConfig.common) : null;

  return (
    <div className="w-full border-2 border-slate-700 bg-ocean-900 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-pixel text-[0.5rem] text-slate-400">
          Score Breakdown
        </span>
        <span className={`font-pixel text-[0.5rem] ${cfg?.color ?? "text-slate-300"}`}>
          Total: {scores.total}/20
        </span>
      </div>

      {/* Score bars */}
      <div className="flex flex-col gap-2 mb-3">
        {SCORE_DIMS.map(({ emoji, label, key, barColor }) => {
          const val = scores[key];
          // 1 → 20%, 2 → 40%, 3 → 60%, 4 → 80%, 5 → 100%
          const pct = (val / 5) * 100;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm w-5 flex-shrink-0 leading-none">{emoji}</span>
              <span className="font-pixel text-[0.4rem] text-slate-500 w-10 flex-shrink-0">
                {label}
              </span>
              {/* Bar track */}
              <div className="flex-1 h-3 bg-slate-800 border border-slate-700 relative overflow-hidden">
                {/* Animated fill */}
                <div
                  className={`absolute inset-y-0 left-0 score-bar-fill ${barColor} opacity-90`}
                  style={
                    {
                      "--bar-fill": `${pct}%`,
                      width: `${pct}%`,
                    } as React.CSSProperties
                  }
                />
                {/* Tick marks at 20%, 40%, 60%, 80% */}
                {[20, 40, 60, 80].map((tick) => (
                  <div
                    key={tick}
                    className="absolute top-0 bottom-0 w-px bg-slate-700/60 z-10"
                    style={{ left: `${tick}%` }}
                  />
                ))}
              </div>
              {/* Numeric value */}
              <span className="font-pixel text-[0.5rem] text-slate-300 w-4 text-right flex-shrink-0">
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Derived output tags */}
      {(habitat || sizeClass || rarity) && (
        <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-x-4 gap-y-1">
          {habitat && (
            <span className="font-pixel text-[0.4rem] text-slate-600">
              Zone:{" "}
              <span className="text-slate-400">
                {HABITAT_LABELS[habitat] ?? habitat}
              </span>
            </span>
          )}
          {sizeClass && (
            <span className="font-pixel text-[0.4rem] text-slate-600">
              Size:{" "}
              <span className="text-slate-400">
                {SIZE_LABELS[sizeClass] ?? sizeClass}
              </span>
            </span>
          )}
          {rarity && cfg && (
            <span className="font-pixel text-[0.4rem] text-slate-600">
              Rarity:{" "}
              <span className={cfg.color}>{cfg.label}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import type { CatchResult } from "@/lib/types";
import { rarityConfig } from "@/lib/rarityColors";

interface FishRevealProps {
  catch: CatchResult | null;
  visible: boolean;
}

const SIZE_LABELS: Record<string, string> = {
  tiny:   "Tiny",
  small:  "Small",
  medium: "Medium",
  large:  "Large",
  trophy: "TROPHY",
};

const HABITAT_LABELS: Record<string, string> = {
  pond:           "Pond",
  river_lake:     "River & Lake",
  coastal:        "Coastal",
  reef_open_sea:  "Reef & Open Sea",
  deep_ocean:     "Deep Ocean",
  mountain_stream:"Mountain Stream",
  volcanic_arctic:"Volcanic Arctic",
  trash:          "Trash",
};

// Sparkle dot positions for mythic/legendary (offset from card edges)
const SPARKLE_POSITIONS = [
  { top: "8%",  left: "5%"  },
  { top: "15%", right: "7%" },
  { top: "60%", left: "3%"  },
  { top: "75%", right: "5%" },
  { top: "40%", left: "92%" },
];

export default function FishReveal({ catch: catchResult, visible }: FishRevealProps) {
  if (!catchResult || !visible) return null;

  const config  = rarityConfig[catchResult.rarity] ?? rarityConfig.common;
  const rarity  = catchResult.rarity;
  const isMythic     = rarity === "mythic";
  const isLegendary  = rarity === "legendary";
  const isEpic       = rarity === "epic";
  const isHighRarity = isEpic || isLegendary || isMythic;

  return (
    <div
      className={[
        "w-full border-2 p-4 relative overflow-hidden",
        "animate-card-reveal",
        config.bg,
        config.border,
        // Apply animated glow to card itself for epic+
        isEpic      ? "animate-glow-pulse"      : "",
        isLegendary ? "animate-legendary-glow"  : "",
        isMythic    ? "animate-mythic-border"   : config.glow,
      ].join(" ")}
    >
      {/* Mythic prismatic shimmer overlay */}
      {isMythic && (
        <div
          className="animate-mythic-shimmer absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #a855f7, #ec4899, #06b6d4, #a855f7)",
            backgroundSize: "200% 200%",
          }}
        />
      )}

      {/* Legendary warm glow overlay */}
      {isLegendary && (
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: "radial-gradient(ellipse at center, rgba(234,179,8,0.5) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Sparkle dots for legendary and mythic */}
      {(isLegendary || isMythic) &&
        SPARKLE_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="absolute pointer-events-none animate-sparkle"
            style={{
              ...pos,
              animationDelay: `${i * 0.3}s`,
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: isMythic ? "#ec4899" : "#fde68a",
              boxShadow: `0 0 4px ${isMythic ? "#a855f7" : "#fbbf24"}`,
            }}
          />
        ))}

      {/* Catch & Release badge */}
      {catchResult.catchAndRelease && (
        <div className="mb-3 inline-block">
          <span className="font-pixel text-[0.45rem] bg-emerald-900 border border-emerald-500 text-emerald-300 px-2 py-1">
            📸 Photographed &amp; Released
          </span>
        </div>
      )}

      {/* Main content row */}
      <div className="flex gap-4 items-start relative z-10">
        {/* Emoji — scale up for higher rarities */}
        <div
          className="flex-shrink-0 leading-none"
          style={{
            fontSize: isHighRarity ? "3.5rem" : "3rem",
            filter: isMythic
              ? "drop-shadow(0 0 8px #a855f7)"
              : isLegendary
              ? "drop-shadow(0 0 6px rgba(234,179,8,0.8))"
              : "none",
          }}
        >
          {catchResult.emoji}
        </div>

        {/* Info column */}
        <div className="flex-1 min-w-0">
          {/* Rarity badge */}
          <div className="mb-1">
            <span
              className={[
                "font-pixel text-[0.45rem] border px-1 py-0.5",
                config.color,
                config.border,
                isHighRarity ? "animate-glow-pulse" : "",
              ].join(" ")}
            >
              {config.label}
            </span>
          </div>

          {/* Species name */}
          <div className={`font-pixel text-[0.6rem] leading-relaxed ${config.color}`}>
            {catchResult.species}
          </div>

          {/* Scientific name */}
          {catchResult.scientificName && (
            <div className="text-[0.7rem] text-slate-500 leading-snug italic mt-0.5">
              {catchResult.scientificName}
            </div>
          )}

          {/* Size + habitat tags */}
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <span className="font-pixel text-[0.42rem] text-slate-400 bg-slate-800/60 px-1 py-0.5 border border-slate-700">
              {SIZE_LABELS[catchResult.sizeClass] ?? catchResult.sizeClass}
            </span>
            <span className="font-pixel text-[0.42rem] text-slate-400 bg-slate-800/60 px-1 py-0.5 border border-slate-700">
              {HABITAT_LABELS[catchResult.habitat] ?? catchResult.habitat}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={`mt-3 border-t ${isMythic ? "border-pink-800/40" : isLegendary ? "border-yellow-900/40" : "border-slate-700/40"}`} />

      {/* Flavor text — readable font, not pixel */}
      <div className="mt-3 relative z-10">
        <p className="text-[0.75rem] text-slate-400 leading-relaxed italic">
          &ldquo;{catchResult.flavorText}&rdquo;
        </p>
      </div>
    </div>
  );
}

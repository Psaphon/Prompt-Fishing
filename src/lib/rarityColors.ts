// Rarity tier visual configuration
// See: docs/phase1-spec.md Section 8

export const rarityConfig: Record<
  string,
  {
    color: string;
    bg: string;
    border: string;
    glow: string;
    label: string;
  }
> = {
  trash: {
    color: "text-stone-500",
    bg: "bg-stone-900",
    border: "border-stone-600",
    glow: "",
    label: "Trash",
  },
  common: {
    color: "text-gray-300",
    bg: "bg-gray-900",
    border: "border-gray-500",
    glow: "",
    label: "Common",
  },
  uncommon: {
    color: "text-green-400",
    bg: "bg-green-950",
    border: "border-green-500",
    glow: "shadow-green-500/20 shadow-lg",
    label: "Uncommon",
  },
  rare: {
    color: "text-blue-400",
    bg: "bg-blue-950",
    border: "border-blue-500",
    glow: "shadow-blue-500/30 shadow-lg",
    label: "Rare",
  },
  epic: {
    color: "text-purple-400",
    bg: "bg-purple-950",
    border: "border-purple-500",
    glow: "shadow-purple-500/40 shadow-xl",
    label: "Epic",
  },
  legendary: {
    color: "text-yellow-400",
    bg: "bg-yellow-950",
    border: "border-yellow-500",
    glow: "shadow-yellow-500/50 shadow-xl",
    label: "Legendary",
  },
  mythic: {
    color: "text-pink-300",
    bg: "bg-gradient-to-br from-purple-950 via-pink-950 to-cyan-950",
    border: "border-pink-400",
    glow: "shadow-pink-500/60 shadow-2xl",
    label: "✦ Mythic ✦",
  },
};

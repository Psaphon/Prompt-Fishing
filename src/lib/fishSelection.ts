// Fish selection algorithm — implemented in Build Order Step 4
//
// Algorithm:
//   1. Clarity modifies other scores toward median if clarity < 3
//   2. Depth → Habitat (5 core + 2 special zones)
//   3. Specificity → Size class
//   4. Creativity → Rarity tier (+ mythic override at total >= 18)
//   5. Topic → narrows species pool
//   6. Random selection from filtered candidates (with fallback widening)
//
// Special habitats:
//   - mountain_stream: depth >= 4 AND creativity <= 2 AND clarity >= 4
//   - volcanic_arctic: depth == 5 AND creativity >= 4
//
// Trash threshold: total <= 4 → return random trashItem
//
// See: docs/phase1-spec.md Section 6
// See: docs/scoring-prompt.md Part 8 for full algorithm

import { fishDatabase, trashItems } from "./fishDatabase";
import type { Scores, CatchResult, Fish } from "./types";

function applyClarity(base: number, clarity: number): number {
  if (clarity >= 3) return base;
  const dist = base - 3;
  const factor = (3 - clarity) / 4;
  return Math.max(1, Math.min(5, Math.round(base - dist * factor)));
}

function getRarity(effCreativity: number, total: number): string {
  if (total >= 18) return "mythic";
  const map: Record<number, string> = {
    1: "common",
    2: "uncommon",
    3: "rare",
    4: "epic",
    5: "legendary",
  };
  return map[Math.max(1, Math.min(5, effCreativity))] || "common";
}

function getHabitat(
  effDepth: number,
  effCreativity: number,
  clarity: number
): string {
  if (effDepth >= 4 && effCreativity <= 2 && clarity >= 4)
    return "mountain_stream";
  if (effDepth === 5 && effCreativity >= 4) return "volcanic_arctic";
  const map: Record<number, string> = {
    1: "pond",
    2: "river_lake",
    3: "coastal",
    4: "reef_open_sea",
    5: "deep_ocean",
  };
  return map[Math.max(1, Math.min(5, effDepth))] || "pond";
}

function getSizeClass(effSpec: number): string {
  const map: Record<number, string> = {
    1: "tiny",
    2: "small",
    3: "medium",
    4: "large",
    5: "trophy",
  };
  return map[Math.max(1, Math.min(5, effSpec))] || "medium";
}

export function catchFish(scores: Scores): CatchResult {
  // Trash check
  if (scores.total <= 4) {
    const trash = trashItems[Math.floor(Math.random() * trashItems.length)];
    return { ...trash, rarity: "trash", scores };
  }

  const effDepth = applyClarity(scores.depth, scores.clarity);
  const effSpec = applyClarity(scores.specificity, scores.clarity);
  const effCreativity = applyClarity(scores.creativity, scores.clarity);

  const habitat = getHabitat(effDepth, effCreativity, scores.clarity);
  const sizeClass = getSizeClass(effSpec);
  const rarity = getRarity(effCreativity, scores.total);

  // Filter candidates: habitat + size + topic
  let candidates = fishDatabase.filter(
    (f: Fish) =>
      f.habitats.includes(habitat) &&
      f.sizeRange.includes(sizeClass) &&
      f.topics.includes(scores.topic)
  );

  // Fallback: relax topic constraint
  if (candidates.length === 0) {
    candidates = fishDatabase.filter(
      (f: Fish) =>
        f.habitats.includes(habitat) && f.sizeRange.includes(sizeClass)
    );
  }

  // Fallback: relax size constraint
  if (candidates.length === 0) {
    candidates = fishDatabase.filter((f: Fish) =>
      f.habitats.includes(habitat)
    );
  }

  // Final fallback: any fish
  if (candidates.length === 0) {
    candidates = fishDatabase;
  }

  const fish = candidates[Math.floor(Math.random() * candidates.length)];
  const flavor =
    fish.flavorTexts[Math.floor(Math.random() * fish.flavorTexts.length)];

  return {
    species: fish.species,
    scientificName: fish.scientificName,
    habitat,
    rarity,
    sizeClass,
    topic: scores.topic,
    scores,
    flavorText: flavor,
    description: fish.description,
    catchAndRelease: fish.catchAndRelease || false,
    emoji: fish.emoji,
  };
}

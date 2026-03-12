// Core TypeScript interfaces for Prompt Fishing
// See: docs/phase1-spec.md Section 7

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Scores {
  depth: number;
  specificity: number;
  creativity: number;
  clarity: number;
  total: number;
  topic: string;
}

export interface Fish {
  id: string;
  species: string;
  scientificName: string;
  habitats: string[];
  sizeRange: string[];
  topics: string[];
  emoji: string;
  description: string;
  flavorTexts: string[];
  catchAndRelease?: boolean;
}

export interface CatchResult {
  species: string;
  scientificName?: string;
  habitat: string;
  rarity: string;
  sizeClass: string;
  topic: string;
  scores: Scores;
  flavorText: string;
  description: string;
  catchAndRelease?: boolean;
  emoji: string;
}

export type Rarity =
  | "trash"
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export type FishingPhase =
  | "idle"
  | "casting"
  | "waiting"
  | "bite"
  | "reeling"
  | "reveal";

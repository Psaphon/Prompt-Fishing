# Fishing App — Phase 1 Technical Spec

## Purpose of This Document

This is the implementation spec for the Phase 1 Proof of Concept. It is designed to be handed to Claude Code (Sonnet) for execution. Everything here should be buildable in a single Next.js project with no external backend, no auth, and no database.

**Success criteria:** You show it to someone and they immediately want to try a better prompt to get a different fish.

---

## 1. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 14+ (App Router)** | Fast setup, API routes built in, deploys to Vercel trivially |
| Styling | **Tailwind CSS** | Rapid UI development, easy pixel-art aesthetic |
| API | **Anthropic Claude Haiku 4.5** | Cheapest Claude model, fast, good enough for scoring |
| Hosting | **Vercel** (or local dev only for PoC) | Zero-config deployment for Next.js |
| State | **React useState** | No database, no persistence. Fish caught in this session only. |
| Art | **Emoji + colored borders for MVP** | Placeholder. Real pixel art comes in Phase 2. |

---

## 2. Project Structure

```
fishing-app/
├── CLAUDE.md                    # Project context for Claude Code
├── package.json
├── next.config.js
├── .env.local                   # ANTHROPIC_API_KEY
├── tailwind.config.js
├── public/
│   └── fonts/                   # Pixel font (e.g., Press Start 2P from Google Fonts)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout, pixel font, dark theme
│   │   ├── page.tsx             # Main game page
│   │   ├── api/
│   │   │   ├── chat/route.ts    # Streaming response endpoint
│   │   │   └── score/route.ts   # Scoring endpoint (non-streaming)
│   ├── components/
│   │   ├── PromptInput.tsx      # Text input + cast button
│   │   ├── FishingAnimation.tsx # Pixel art fishing scene (CSS animated)
│   │   ├── FishReveal.tsx       # Fish catch reveal card
│   │   ├── ResponsePanel.tsx    # Claude's streaming response
│   │   ├── Collection.tsx       # Session fish collection display
│   │   └── ScoreBreakdown.tsx   # Shows the 4 dimension scores
│   ├── lib/
│   │   ├── fishDatabase.ts      # Complete fish data (73 species + 5 trash)
│   │   ├── fishSelection.ts     # Selection algorithm
│   │   ├── scoringPrompt.ts     # The scoring system prompt text
│   │   ├── types.ts             # TypeScript interfaces
│   │   └── rarityColors.ts      # Rarity → color/style mappings
│   └── styles/
│       └── pixel.css            # Pixel art specific styles, animations
```

---

## 3. Core Flow (Step by Step)

### User Experience

```
1. User sees: Dark screen, pixel art water scene, text input at bottom
2. User types prompt, clicks "Cast" (or hits Enter)
3. Cast button disabled. Bobber animation starts — line goes out, bobber lands in water.
4. Bobber bobs gently. Water ripples. "Waiting for a bite..." text appears.
5. SIMULTANEOUSLY:
   a. API call 1 (streaming): Claude responds to the prompt
   b. API call 2 (non-streaming): Claude scores the prompt
6. When BOTH calls complete:
   a. Bobber dips sharply — "Something's biting!" animation
   b. Brief reel-in animation (0.5-1 second)
   c. Fish reveal card slides up with species, rarity, size, flavor text
   d. Score breakdown appears below the card
7. Claude's response appears in a panel below/beside the fish card
8. Fish is added to the session collection (visible in sidebar/bottom)
9. Input re-enables. User can cast again.
```

### Timing Design

The fishing animation MUST last until both API calls complete. This is the core "waiting is playing" principle.

```
- Minimum animation time: 2 seconds (even if API returns instantly)
- Bobber idle animation: loops until both calls resolve
- "Bite" trigger: fires when BOTH promises resolve + minimum time elapsed
- Reveal animation: 1-1.5 seconds (reel-in + card slide)
```

---

## 4. API Routes

### POST /api/chat (Streaming Response)

```typescript
// src/app/api/chat/route.ts
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  // Return as a ReadableStream for SSE
  return new Response(stream.toReadableStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

**Privacy note:** This route does NOT log the prompt. It passes through to Anthropic and streams the response back. Nothing is persisted.

### POST /api/score (Non-Streaming Score)

```typescript
// src/app/api/score/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { SCORING_PROMPT } from "@/lib/scoringPrompt";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: SCORING_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  // Extract text content and parse JSON
  const text = response.content[0].type === "text" 
    ? response.content[0].text : "";
  
  try {
    const scores = JSON.parse(text);
    return Response.json(scores);
  } catch {
    // Fallback if JSON parsing fails
    return Response.json({
      depth: 1, specificity: 1, creativity: 1, clarity: 1,
      total: 4, topic: "casual"
    });
  }
}
```

**Privacy note:** This route also does NOT log the prompt. Scores are returned to the client; only the client holds the prompt text.

---

## 5. Scoring Prompt

```typescript
// src/lib/scoringPrompt.ts
export const SCORING_PROMPT = `You are the scoring engine for a fishing game where prompt quality determines what fish you catch. Evaluate the user's prompt — do NOT respond to it.

Score on four dimensions (1-5 each):

DEPTH (1-5): How much genuine thought or complexity does this prompt contain?
1: Trivial, surface-level (one-word, basic fact)
2: Simple but shows some thought
3: Requires meaningful reasoning or knowledge
4: Multi-layered, explores nuance or tradeoffs
5: Deeply complex, connects multiple domains or ideas

SPECIFICITY (1-5): How precise and detailed is the request?
1: No details at all
2: Has a topic but no constraints
3: Reasonably specific, includes some useful detail
4: Precise with clear constraints, audience, or format requirements
5: Highly specific with multiple well-defined parameters

CREATIVITY (1-5): How novel, surprising, or inventive is this prompt?
1: Completely generic or formulaic
2: Standard question, nothing unexpected
3: Interesting angle or unexpected framing
4: Notably creative approach or unusual combination
5: Genuinely inventive, surprising, or delightful

CLARITY (1-5): How clear and unambiguous is the intent?
1: Confusing, contradictory, or incoherent
2: Understandable but ambiguous in key ways
3: Clear enough to answer, minor ambiguities
4: Well-articulated with clear intent
5: Crystal clear — no room for misinterpretation

TOPIC: Identify the primary topic category:
casual, creative, technical, research, philosophical, playful, practical

CALIBRATION:
- "What's the capital of France?" → D:1, S:3, C:1, CL:5 = 10
- "hi" → D:1, S:1, C:1, CL:2 = 5
- Average casual prompt should score 7-10
- 17+ is genuinely impressive
- 20 is nearly impossible
- Single-word, empty, abusive, or gibberish = all 1s (total: 4)
- Do NOT reward length alone

Respond with ONLY this JSON:
{"depth":<1-5>,"specificity":<1-5>,"creativity":<1-5>,"clarity":<1-5>,"total":<4-20>,"topic":"<category>"}`;
```

---

## 6. Fish Selection Algorithm

```typescript
// src/lib/fishSelection.ts
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
    1: "common", 2: "uncommon", 3: "rare", 4: "epic", 5: "legendary"
  };
  return map[Math.max(1, Math.min(5, effCreativity))] || "common";
}

function getHabitat(effDepth: number, effCreativity: number, clarity: number): string {
  if (effDepth >= 4 && effCreativity <= 2 && clarity >= 4) return "mountain_stream";
  if (effDepth === 5 && effCreativity >= 4) return "volcanic_arctic";
  const map: Record<number, string> = {
    1: "pond", 2: "river_lake", 3: "coastal", 4: "reef_open_sea", 5: "deep_ocean"
  };
  return map[Math.max(1, Math.min(5, effDepth))] || "pond";
}

function getSizeClass(effSpec: number): string {
  const map: Record<number, string> = {
    1: "tiny", 2: "small", 3: "medium", 4: "large", 5: "trophy"
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

  // Filter candidates
  let candidates = fishDatabase.filter(
    (f) =>
      f.habitats.includes(habitat) &&
      f.sizeRange.includes(sizeClass) &&
      f.topics.includes(scores.topic)
  );

  // Fallback: relax topic
  if (candidates.length === 0) {
    candidates = fishDatabase.filter(
      (f) => f.habitats.includes(habitat) && f.sizeRange.includes(sizeClass)
    );
  }
  // Fallback: relax size
  if (candidates.length === 0) {
    candidates = fishDatabase.filter((f) => f.habitats.includes(habitat));
  }
  // Final fallback
  if (candidates.length === 0) {
    candidates = fishDatabase;
  }

  const fish = candidates[Math.floor(Math.random() * candidates.length)];
  const flavor = fish.flavorTexts[Math.floor(Math.random() * fish.flavorTexts.length)];

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
```

---

## 7. TypeScript Interfaces

```typescript
// src/lib/types.ts
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

export type Rarity = "trash" | "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
```

---

## 8. Rarity Visual System

```typescript
// src/lib/rarityColors.ts
export const rarityConfig: Record<string, {
  color: string;
  bg: string;
  border: string;
  glow: string;
  label: string;
}> = {
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
```

---

## 9. Component Specs

### PromptInput.tsx
- Full-width text input with pixel-style border
- "Cast 🎣" button (or Enter key)
- Disabled state while fishing in progress
- Placeholder text: "What would you like to ask? Cast your line..."
- Character counter (optional, helps users see prompt length)

### FishingAnimation.tsx
- **Phase 1 version:** Pure CSS + HTML pixel art scene
- Dark blue water background with subtle wave animation (CSS keyframes)
- Pixel-art bobber (can be a simple div with border-radius and colors)
- States: `idle` | `casting` | `waiting` | `bite` | `reeling`
  - `idle`: Still water, bobber not visible
  - `casting`: Bobber arcs out and lands (CSS transform animation, ~0.8s)
  - `waiting`: Bobber bobs gently on water. Occasional ripple. "Waiting for a bite..."
  - `bite`: Bobber dips sharply, water splash effect, "Something's biting!" text
  - `reeling`: Brief pull-up animation (~0.5s), transition to reveal

### FishReveal.tsx
- Card that slides up from the bottom of the fishing scene
- Shows: emoji (large), species name, scientific name (italic), rarity badge, size class, flavor text
- Card border and glow styled by rarity tier
- If `catchAndRelease`: shows "📸 Photographed & Released" badge
- Entrance animation: scale up from 0.8 to 1.0 with slight bounce

### ResponsePanel.tsx
- Below the fishing scene
- Streams Claude's response text as it arrives
- Typewriter-style reveal (character by character from the stream)
- Collapsible/expandable for longer responses

### Collection.tsx
- Horizontal scrollable row at the bottom of the screen
- Each caught fish shown as a small card: emoji + rarity-colored border
- Click/tap to expand and see full details
- "X fish caught this session" counter
- Sorted by most recent first

### ScoreBreakdown.tsx
- Small panel showing the four scores as pixel-style bar charts
- Depth: 🌊 bar
- Specificity: 🎯 bar
- Creativity: 🎨 bar
- Clarity: 💎 bar
- Each bar filled proportionally (1-5 scale)
- Shows habitat, size class, rarity tier as derived values

---

## 10. Page Layout

```
┌─────────────────────────────────────────┐
│           FISHING APP (title)            │
├─────────────────────────────────────────┤
│                                         │
│         [ FISHING ANIMATION ]           │
│         (water scene, bobber)           │
│                                         │
│         [ FISH REVEAL CARD ]            │
│         (appears after catch)           │
│                                         │
├─────────────────────────────────────────┤
│ [ PROMPT INPUT                    ] 🎣  │
├─────────────────────────────────────────┤
│ Score: 🌊3 🎯4 🎨5 💎4 = 16 (Epic)    │
├─────────────────────────────────────────┤
│ Claude's Response:                      │
│ "Here's what I think about..."          │
│ (streaming text)                        │
├─────────────────────────────────────────┤
│ Collection: [🐟][🐠][🦈][🐡] 4 caught │
└─────────────────────────────────────────┘
```

Mobile-first layout (424px width matches Farcaster Mini App viewport). Stack everything vertically. The fishing animation is the hero — it should take up at least 40% of the viewport.

---

## 11. Fish Database Structure (Abbreviated Example)

```typescript
// src/lib/fishDatabase.ts
import type { Fish } from "./types";

export const fishDatabase: Fish[] = [
  // === POND (Depth 1) ===
  {
    id: "goldfish",
    species: "Goldfish",
    scientificName: "Carassius auratus",
    habitats: ["pond"],
    sizeRange: ["tiny", "small"],
    topics: ["casual", "playful"],
    emoji: "🐟",
    description: "The first fish most people ever meet. Cheerful, familiar, surprisingly hardy.",
    flavorTexts: [
      "A classic. No shame in a goldfish.",
      "It stares at you with zero judgment.",
      "Your starter fish. Everyone starts here.",
    ],
  },
  {
    id: "koi",
    species: "Koi",
    scientificName: "Cyprinus rubrofuscus",
    habitats: ["pond"],
    sizeRange: ["small", "medium", "large"],
    topics: ["creative", "philosophical"],
    emoji: "🎏",
    description: "Living art. Bred for beauty over centuries, each one unique.",
    flavorTexts: [
      "This one's worth more than your rent.",
      "Centuries of selective breeding, in your hands.",
      "A painting that swims.",
    ],
  },
  // ... (all 73 species follow this pattern)
  // Full database to be generated from the scoring system v3 document
];

export const trashItems: CatchResult[] = [
  {
    species: "Old Boot",
    habitat: "trash",
    rarity: "trash",
    sizeClass: "small",
    topic: "casual",
    scores: { depth: 1, specificity: 1, creativity: 1, clarity: 1, total: 4, topic: "casual" },
    flavorText: "You cast nothing and caught nothing. Well, almost nothing.",
    description: "Someone's lost boot. The ocean remembers.",
    emoji: "🥾",
  },
  {
    species: "Soggy Newspaper",
    habitat: "trash",
    rarity: "trash",
    sizeClass: "small",
    topic: "casual",
    scores: { depth: 1, specificity: 1, creativity: 1, clarity: 1, total: 4, topic: "casual" },
    flavorText: "Yesterday's news. Literally.",
    description: "Unreadable. Much like the prompt that caught it.",
    emoji: "📰",
  },
  {
    species: "Tin Can",
    habitat: "trash",
    rarity: "trash",
    sizeClass: "tiny",
    topic: "casual",
    scores: { depth: 1, specificity: 1, creativity: 1, clarity: 1, total: 4, topic: "casual" },
    flavorText: "The ocean doesn't reward bad behavior. Neither do we.",
    description: "Rusty, dented, and deeply unimpressed with your prompt.",
    emoji: "🥫",
  },
  {
    species: "Seaweed Clump",
    habitat: "trash",
    rarity: "trash",
    sizeClass: "tiny",
    topic: "casual",
    scores: { depth: 1, specificity: 1, creativity: 1, clarity: 1, total: 4, topic: "casual" },
    flavorText: "At least it's organic.",
    description: "Slimy, green, and vaguely disappointed.",
    emoji: "🌿",
  },
  {
    species: "Driftwood",
    habitat: "trash",
    rarity: "trash",
    sizeClass: "medium",
    topic: "casual",
    scores: { depth: 1, specificity: 1, creativity: 1, clarity: 1, total: 4, topic: "casual" },
    flavorText: "You've been here before. Try something new.",
    description: "Weathered, shapeless, going nowhere. Sound familiar?",
    emoji: "🪵",
  },
];
```

---

## 12. Environment Setup

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

```json
// package.json dependencies (key ones)
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@anthropic-ai/sdk": "^0.30.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 13. Build Instructions for Claude Code

When handing this to Claude Code, use this task sequence:

### Task 1: Scaffold
"Create a new Next.js 14 project with App Router, TypeScript, and Tailwind CSS. Set up the project structure as defined in the Phase 1 tech spec. Install the Anthropic SDK. Add the Press Start 2P pixel font from Google Fonts."

### Task 2: Types & Data
"Create the TypeScript types, rarity color config, and scoring prompt as defined in the spec. Create the fish database with all 73 species from the scoring system v3 document, following the exact structure shown. Create the trash items array."

### Task 3: API Routes
"Create the two API routes: /api/chat (streaming) and /api/score (non-streaming). The chat route uses Claude Haiku streaming. The score route uses the scoring system prompt and returns parsed JSON scores."

### Task 4: Fish Selection
"Implement the fish selection algorithm with clarity modification, habitat selection (including special habitats), size class, rarity, and the candidate filtering with fallback widening."

### Task 5: UI Components
"Build all components: PromptInput, FishingAnimation (CSS pixel art with states), FishReveal (rarity-styled card), ResponsePanel (streaming text), Collection (horizontal scroll), ScoreBreakdown (bar charts). Mobile-first, 424px width."

### Task 6: Main Page
"Wire everything together on the main page. Implement the dual API call pattern with Promise.all, minimum animation timing, state machine for fishing phases, and session collection state."

### Task 7: Polish
"Add the pixel font throughout. Tune animation timing. Add sound effects placeholder comments. Test with various prompts. Make the fishing animation feel alive — the bobber should bob, the water should ripple, the reveal should feel like a reward."

---

## 14. What This PoC Does NOT Include

- No authentication
- No database / persistence (session only)
- No real pixel art sprites (emoji placeholders)
- No sharing / social features
- No Farcaster integration
- No NFTs
- No fish size variation (species-level only)
- No sound effects (placeholder comments only)
- No leaderboard
- No prompt history

All of the above are Phase 2+. This PoC validates ONE thing: **does the core loop feel good?**

# CLAUDE.md — Fishing App Project Context

## What Is This Project?

A fishing-themed AI prompting interface. Users submit a prompt, a fishing mini-game plays while Claude responds, and the quality of their prompt determines what fish they catch. Fish are collectible, shareable, and meaningful — they reflect prompting skill.

**North star:** Someone opens the app with a question, leaves with an answer AND a fish they're proud of. They got better at prompting without realizing it.

## Current Phase: Phase 1 — Proof of Concept

Browser-only, no auth, no database, no backend persistence. Validate that the core loop feels good.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude Haiku 4.5 API (`claude-haiku-4-5-20251001`)
- Vercel deployment (optional)

## Architecture

Two parallel API calls per user prompt:
1. **Chat call** (streaming): Claude responds to the prompt normally
2. **Score call** (non-streaming): Claude evaluates prompt quality, returns JSON scores

Both fire simultaneously. The fishing animation plays until both resolve.

### Scoring System

Four dimensions, each 1-5:
- **Depth** → selects Habitat Zone (where you fish)
- **Specificity** → selects Size Class (how big the catch)
- **Creativity** → selects Rarity Tier (how exotic/rare)
- **Clarity** → modifier that degrades other scores toward median if low

Scores feed into a layered fish selection funnel:
1. Clarity modifies the other three scores
2. Depth → Habitat (5 core + 2 special)
3. Specificity → Size (tiny/small/medium/large/trophy)
4. Creativity → Rarity (common/uncommon/rare/epic/legendary/mythic)
5. Topic detection → narrows species within filtered pool
6. Random selection from remaining candidates

### Privacy

- Prompts are NOT logged or stored on the backend
- API routes pass prompts through to Anthropic only
- Only scoring results and fish data are returned to client
- Session data is React state only — nothing persists

## Key Files

- `src/lib/scoringPrompt.ts` — The scoring system prompt (do not modify without testing)
- `src/lib/fishDatabase.ts` — All 73 species + 5 trash items
- `src/lib/fishSelection.ts` — The selection algorithm
- `src/lib/types.ts` — Core TypeScript interfaces
- `src/lib/rarityColors.ts` — Rarity tier visual config

## Design Principles

- **Waiting is playing.** Every moment of latency is an opportunity for delight.
- **The fish means something.** Fish should feel tied to the prompt, not random.
- **Keep it cheap and honest.** Use Haiku. Never fake latency.
- **Collectibility drives retention.** People should want to show off rare catches.
- **Start simple.** Don't build features. Build the core loop until it feels good.

## Visual Style

- Pixel art / retro 8-bit aesthetic
- Dark theme (deep ocean blues and blacks)
- Press Start 2P font (Google Fonts)
- Rarity colors: gray (common), green (uncommon), blue (rare), purple (epic), gold (legendary), prismatic pink-purple-cyan (mythic)
- Mobile-first layout, 424px width (matches Farcaster Mini App viewport)

## Commands & Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint
```

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...   # Required. Claude Haiku API key.
```

## Build Order (Phase 1)

Follow this sequence — each step builds on the previous:

1. **Scaffold** — Next.js 15 project with App Router, TypeScript, Tailwind CSS. Install `@anthropic-ai/sdk`. Add Press Start 2P from Google Fonts (via `next/font/google`).
2. **Types & Data** — Create `types.ts`, `rarityColors.ts`, `scoringPrompt.ts`, and the full `fishDatabase.ts` (all 73 species from `docs/scoring-prompt.md` + 5 trash items). Each fish needs: id, emoji, and 2-3 flavor texts matching the project's witty, concise tone.
3. **API Routes** — `/api/chat` (streaming via Anthropic SDK) and `/api/score` (non-streaming, returns parsed JSON scores). Neither route logs prompts.
4. **Fish Selection** — `fishSelection.ts` with clarity modification, habitat resolution (including special habitats), size class, rarity, and candidate filtering with fallback widening. Follow the algorithm in `docs/scoring-prompt.md` Part 8.
5. **UI Components** — `PromptInput`, `FishingAnimation` (CSS pixel art with idle/casting/waiting/bite/reeling states), `FishReveal` (rarity-styled card), `ResponsePanel` (streaming text), `Collection` (horizontal scroll), `ScoreBreakdown` (bar charts). Mobile-first, 424px width.
6. **Main Page** — Wire everything together. Dual API call pattern with `Promise.all`, minimum 2s animation, state machine for fishing phases, session collection in React state.
7. **Polish** — Pixel font throughout, animation timing, test with varied prompts, ensure the bobber bobs, water ripples, reveal feels rewarding.

## Spec Documents

Detailed specs live in `docs/`:
- `docs/phase1-spec.md` — Full Phase 1 implementation spec with code examples
- `docs/scoring-prompt.md` — Complete scoring system, fish database (all 73 species), and selection algorithm

**Read these before starting implementation.** The phase1-spec has reference code for API routes, fish selection, and component specs. The scoring-prompt doc has the complete fish database tables to populate `fishDatabase.ts`.

## Implementation Notes

- **Fish database generation**: Convert the species tables in `docs/scoring-prompt.md` Part 6 into TypeScript objects. Each species needs an appropriate emoji and 2-3 flavor texts written in the project's voice (witty, concise, often a fun fact or wry observation). See the goldfish/koi examples in `docs/phase1-spec.md` Section 11 for tone reference.
- **Catch & Release species**: Coelacanth, Giant Squid, and Horseshoe Crab must have `catchAndRelease: true`.
- **Streaming**: Use the Anthropic SDK's `.stream()` method with `.toReadableStream()` for the chat endpoint. Return as SSE.
- **Minimum animation time**: The fishing animation MUST last at least 2 seconds, even if both API calls return instantly. Never fake additional latency beyond this minimum.
- **Depth is not quality**: A Depth 1 prompt is not "worse" — it just goes to a different habitat. The quality signal comes from the interplay of Creativity, Specificity, and Clarity.
- **Mythic override**: If `total >= 18` (raw, before clarity modification), rarity is elevated to Mythic regardless of individual scores.
- **Trash threshold**: `total <= 4` returns a random trash item instead of a fish.

## Future Phases (Do Not Build Yet)

- Phase 2: Farcaster Mini App with Supabase persistence
- Phase 3: Real pixel art sprites, fish cards, expanded species
- Phase 4: iOS native app with game-feel fishing mechanics
- Future: ERC-6551 NFT fish tanks, on-chain collection

# Development Plan: Prompt Fishing

**Status:** In Progress
**Created:** 2026-04-21
**Updated:** 2026-04-21

## Overview

Prompt Fishing is a fishing-themed AI prompting game that teaches prompt engineering through play. Phase 1 (browser-only PoC) is complete. This plan covers Phase 2+ features to add persistence, social integration, and expanded content.

## Constraints

- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Claude Haiku 4.5 for scoring and chat (keep API costs low)
- Privacy-first: prompts never stored server-side
- No secrets in code — all config via environment variables
- Mobile-first layout (424px, Farcaster Mini App viewport)
- Gitflow branching: `main`, `develop`, `feature/*`, `fix/*`
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`

---

## Phase 1 — Proof of Concept (COMPLETE)

Core loop validated: prompt → fish → collect. 73 species, 4-dimension scoring, dual API pattern, CSS pixel-art animations, session-only state.

---

## Feature: gitflow-setup

**Branch:** N/A (manual)
**Depends on:** none
**Status:** Not Started
**Requires:** human

### Goal

Initialize gitflow branching for the project.

### Acceptance Criteria

- [ ] `develop` branch created from `main`
- [ ] `develop` pushed to origin
- [ ] Default branch set to `main` on GitHub
- [ ] [HUMAN] Create develop branch and push

---

## Feature: supabase-persistence

**Branch:** `feature/supabase-persistence`
**Depends on:** gitflow-setup
**Status:** Not Started
**Requires:** both

### Goal

Add Supabase backend so fish collections persist across sessions. Users get a stable collection without requiring traditional auth.

### Acceptance Criteria

- [ ] Supabase project configured with schema: `users`, `catches`, `collections`
- [ ] Anonymous auth via Supabase (no email/password required)
- [ ] Fish catches saved to database on each catch
- [ ] Collection loads from database on app open
- [ ] Session-only mode still works as fallback if Supabase is unreachable
- [ ] Prompts are still NOT stored (privacy-first)
- [ ] [HUMAN] Create Supabase project and add credentials to env
- [ ] Tests pass, lint clean

### Files to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/supabase.ts` | Create | Supabase client setup |
| `src/lib/collections.ts` | Create | Collection CRUD operations |
| `src/app/page.tsx` | Modify | Load/save collection via Supabase |
| `.env.example` | Modify | Add Supabase env vars |

---

## Feature: catch-stats

**Branch:** `feature/catch-stats`
**Depends on:** supabase-persistence
**Status:** Not Started
**Requires:** ai

### Goal

Add persistent stats: total catches, rarity distribution, species completion percentage, longest streak, personal bests.

### Acceptance Criteria

- [ ] Stats panel shows: total catches, unique species, rarity breakdown, completion %
- [ ] "Best catch" highlight (highest total score)
- [ ] Stats load from Supabase, update on each catch
- [ ] Stats visible from collection view
- [ ] Tests pass, lint clean

---

## Feature: farcaster-mini-app

**Branch:** `feature/farcaster-mini-app`
**Depends on:** supabase-persistence
**Status:** Not Started
**Requires:** both

### Goal

Ship as a Farcaster Mini App (Frame v2). Users play directly inside Warpcast.

### Acceptance Criteria

- [ ] Farcaster Frame manifest configured
- [ ] App renders correctly in 424px Farcaster viewport
- [ ] Farcaster auth replaces anonymous auth (FID as user identity)
- [ ] Share catch to Farcaster feed (cast with fish card image)
- [ ] [HUMAN] Register Frame with Farcaster, deploy to Vercel
- [ ] Tests pass, lint clean

### Key Decisions

- Use Farcaster FID as primary user identity when in Mini App context
- Fall back to anonymous Supabase auth when accessed outside Farcaster

---

## Feature: fish-card-sharing

**Branch:** `feature/fish-card-sharing`
**Depends on:** supabase-persistence
**Status:** Not Started
**Requires:** ai

### Goal

Generate shareable fish card images (OG images) so catches look good when shared on social platforms.

### Acceptance Criteria

- [ ] Dynamic OG image generation for each catch (species, rarity, scores)
- [ ] Share button copies URL with card preview
- [ ] Cards render rarity styling (borders, colors, glow effects)
- [ ] Works with Farcaster, Twitter, and generic link previews
- [ ] Tests pass, lint clean

### Files to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/og/route.tsx` | Create | Dynamic OG image generation |
| `src/components/ShareButton.tsx` | Create | Share UI with copy-to-clipboard |
| `src/components/FishReveal.tsx` | Modify | Add share trigger |

---

## Feature: pixel-art-sprites

**Branch:** `feature/pixel-art-sprites`
**Depends on:** none
**Status:** Not Started
**Requires:** both

### Goal

Replace emoji fish with real pixel art sprites. Each species gets a unique sprite matching the retro 8-bit aesthetic.

### Acceptance Criteria

- [ ] Sprite sheet with all 73 species + 5 trash items
- [ ] Sprites render in fish reveal, collection, and cards
- [ ] Animated idle sprites (subtle movement)
- [ ] Rarity tier affects sprite glow/particle effects
- [ ] [HUMAN] Commission or create pixel art assets
- [ ] Fallback to emoji if sprites fail to load
- [ ] Tests pass, lint clean

### Key Decisions

- Sprite sheet vs individual PNGs (sprite sheet preferred for loading performance)
- 32x32 or 64x64 base resolution (64x64 for detail at retina)

---

## Feature: sound-effects

**Branch:** `feature/sound-effects`
**Depends on:** none
**Status:** Not Started
**Requires:** both

### Goal

Add retro 8-bit sound effects for casting, waiting, bite, reeling, and reveal. Enhance game feel.

### Acceptance Criteria

- [ ] Sound effects for: cast, water ambience, bite alert, reel, reveal (per rarity)
- [ ] Mute toggle persisted in localStorage
- [ ] Sounds disabled by default (respect autoplay policies)
- [ ] [HUMAN] Source or create 8-bit sound effects
- [ ] Tests pass, lint clean

---

## Feature: expanded-species

**Branch:** `feature/expanded-species`
**Depends on:** pixel-art-sprites
**Status:** Not Started
**Requires:** ai

### Goal

Expand the fish database with seasonal species, event-limited catches, and new habitats.

### Acceptance Criteria

- [ ] 20+ new species across existing and new habitats
- [ ] Seasonal species (only catchable during certain months)
- [ ] At least 1 new special habitat with unique unlock conditions
- [ ] Updated scoring prompt to handle new species
- [ ] Tests pass, lint clean

---

## Feature: leaderboard

**Branch:** `feature/leaderboard`
**Depends on:** supabase-persistence, farcaster-mini-app
**Status:** Not Started
**Requires:** ai

### Goal

Global and friend leaderboards showing top collectors, rarest catches, and highest prompt scores.

### Acceptance Criteria

- [ ] Global leaderboard: most unique species, highest single-catch score
- [ ] Farcaster friend leaderboard (mutual follows)
- [ ] Weekly and all-time views
- [ ] No prompt content exposed (privacy-first)
- [ ] Tests pass, lint clean

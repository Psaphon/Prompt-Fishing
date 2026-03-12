# Prompt Fishing

A fishing-themed AI prompting game. Write a prompt, catch a fish. The quality of your prompt determines what you catch.

Your prompt is scored on four dimensions — **Depth**, **Specificity**, **Creativity**, and **Clarity** — which determine where you fish, how big your catch is, and how rare it is. 73 real aquatic species across 7 habitats, from backyard ponds to hydrothermal vents.

**Current status:** Phase 1 — Proof of Concept (browser-only, no persistence)

## Quick Start

```bash
npm install
cp .env.example .env.local   # Add your Anthropic API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Claude Haiku 4.5 API

## How It Works

1. You type a prompt and hit "Cast"
2. A fishing animation plays while two parallel API calls run:
   - Claude responds to your prompt (streaming)
   - Claude scores your prompt quality (non-streaming)
3. Your scores determine what fish you catch
4. You get your answer AND a collectible fish

## License

TBD

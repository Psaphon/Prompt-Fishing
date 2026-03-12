// POST /api/score — Non-streaming prompt scoring via Claude Haiku
// Full implementation: Build Order Step 3
//
// Flow:
//   1. Receive { prompt } from request body
//   2. Call Anthropic with SCORING_PROMPT as system prompt
//   3. Parse JSON scores from response
//   4. Return { depth, specificity, creativity, clarity, total, topic }
//   5. Privacy: prompt is passed through only — not logged, not stored
//
// See: docs/phase1-spec.md Section 4 & 5

import Anthropic from "@anthropic-ai/sdk";
import { SCORING_PROMPT } from "@/lib/scoringPrompt";

// Fallback scores when the API is unavailable or returns invalid JSON.
// All-2s gives a real fish (not trash) so the user still gets a result.
const FALLBACK = {
  depth: 2,
  specificity: 2,
  creativity: 2,
  clarity: 2,
  total: 8,
  topic: "casual",
};

export async function POST(req: Request) {
  let prompt: string | undefined;

  try {
    const body = await req.json();
    prompt = body?.prompt;
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("[score] ANTHROPIC_API_KEY not set — returning fallback scores");
    return Response.json(FALLBACK);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: SCORING_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    // Privacy: prompt is passed through to Anthropic only — not logged, not stored
    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract the first JSON object from the response (handles any preamble text)
    const match = text.match(/\{[\s\S]*?\}/);
    const jsonStr = match ? match[0] : text;
    const scores = JSON.parse(jsonStr);

    // Validate the required fields are present and numeric
    const { depth, specificity, creativity, clarity, total, topic } = scores;
    if (
      typeof depth       === "number" &&
      typeof specificity === "number" &&
      typeof creativity  === "number" &&
      typeof clarity     === "number" &&
      typeof total       === "number" &&
      typeof topic       === "string"
    ) {
      return Response.json({ depth, specificity, creativity, clarity, total, topic });
    }

    console.warn("[score] response had unexpected shape:", scores);
    return Response.json(FALLBACK);
  } catch (err) {
    // JSON parse errors, network errors, or Anthropic API errors
    console.error("[score] error:", err);
    return Response.json(FALLBACK);
  }
}

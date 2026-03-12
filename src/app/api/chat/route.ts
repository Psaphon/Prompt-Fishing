// POST /api/chat — Streaming response from Claude Haiku
// Full implementation: Build Order Step 3
//
// Flow:
//   1. Receive { prompt } from request body
//   2. Create Anthropic streaming message (claude-haiku-4-5-20251001)
//   3. Return as ReadableStream (SSE) — do NOT log the prompt
//
// See: docs/phase1-spec.md Section 4

import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Privacy: prompt is passed through to Anthropic only — not logged, not stored
    // Send plain text chunks (not raw SSE) so the client can read them directly
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          console.error("[chat] stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    // Catch JSON parse errors or Anthropic SDK errors
    console.error("[chat] error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

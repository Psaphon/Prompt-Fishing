"use client";

import { useState, useRef, useCallback } from "react";
import type { CatchResult, ChatMessage, FishingPhase, Scores } from "@/lib/types";
import { catchFish } from "@/lib/fishSelection";

import PromptInput from "@/components/PromptInput";
import FishingAnimation from "@/components/FishingAnimation";
import FishReveal from "@/components/FishReveal";
import ChatHistory from "@/components/ChatHistory";
import Collection from "@/components/Collection";
import ScoreBreakdown from "@/components/ScoreBreakdown";

// Minimum animation time before bite can trigger (ms)
const MIN_FISHING_MS = 2000;

// Fallback scores used when the score API fails.
// All-2s (total 8) gives a real fish rather than trash, which is better UX
// when the API is unavailable.
const FALLBACK_SCORES: Scores = {
  depth: 2,
  specificity: 2,
  creativity: 2,
  clarity: 2,
  total: 8,
  topic: "casual",
};

export default function Home() {
  // ── State machine ──────────────────────────────────────────
  const [phase, setPhase] = useState<FishingPhase>("idle");

  // Current cast data
  const [currentCatch, setCurrentCatch] = useState<CatchResult | null>(null);
  const [currentScores, setCurrentScores] = useState<Scores | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);

  // Error feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chat conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Session fish collection (most recent last — Collection reverses for display)
  const [collection, setCollection] = useState<CatchResult[]>([]);

  // Guard: prevent concurrent casts
  const isFishingRef = useRef(false);

  // ── Trigger the bite → reel → reveal sequence ─────────────
  function triggerBite(catchResult: CatchResult) {
    setCurrentCatch(catchResult);
    setPhase("bite");
    // Bite animation lasts 700ms, then transition to reeling
    setTimeout(() => {
      setPhase("reeling");
    }, 700);
  }

  // ── Stream chat response from /api/chat ───────────────────
  async function streamChat(prompt: string): Promise<void> {
    // Add a placeholder assistant message to be updated as streaming progresses
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok || !res.body) {
        setIsStreaming(false);
        return;
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      // Server sends plain text chunks — accumulate and update the last message
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        const text = accumulated;
        setMessages((prev) => {
          const updated = [...prev];
          // The last message is the assistant placeholder we just added
          updated[updated.length - 1] = { role: "assistant", content: text };
          return updated;
        });
      }
    } catch {
      // Network error — assistant message stays blank (already in history)
    } finally {
      setIsStreaming(false);
    }
  }

  // ── Fetch prompt scores from /api/score ───────────────────
  async function fetchScores(prompt: string): Promise<Scores> {
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) return FALLBACK_SCORES;

      const data = await res.json();
      // Validate expected shape to guard against partial JSON from the API
      if (
        typeof data.depth        === "number" &&
        typeof data.specificity  === "number" &&
        typeof data.creativity   === "number" &&
        typeof data.clarity      === "number" &&
        typeof data.total        === "number" &&
        typeof data.topic        === "string"
      ) {
        return data as Scores;
      }
      return FALLBACK_SCORES;
    } catch {
      return FALLBACK_SCORES;
    }
  }

  // ── Main cast handler ─────────────────────────────────────
  async function handleCast(prompt: string) {
    // Guard: empty/whitespace prompts (PromptInput also guards, belt-and-suspenders)
    if (!prompt.trim()) return;

    // Guard: cannot cast while already fishing
    if (isFishingRef.current) return;
    if (phase !== "idle" && phase !== "reveal") return;

    isFishingRef.current = true;

    // Reset the most-recent catch display for the new cast
    setCurrentCatch(null);
    setCurrentScores(null);
    setShowReveal(false);
    setIsStreaming(false);
    setErrorMsg(null);

    // Push the user message into the conversation immediately
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    // Start casting animation
    setPhase("casting");

    // Minimum display time — at least 2 seconds of animation
    const minTimer = new Promise<void>((resolve) =>
      setTimeout(resolve, MIN_FISHING_MS)
    );

    try {
      // Fire BOTH API calls concurrently alongside the minimum timer
      const [scores] = await Promise.all([
        fetchScores(prompt),
        streamChat(prompt),   // side-effects: updates messages as it streams
        minTimer,             // ensures minimum 2s animation
      ]);

      // Select which fish the user catches (client-side, deterministic given scores)
      const catchResult = catchFish(scores);
      setCurrentScores(scores);

      // Kick off bite → reel → reveal sequence
      triggerBite(catchResult);
    } catch {
      // Something unexpected failed (shouldn't happen; fetchScores has its own fallback)
      setErrorMsg("Something went wrong. Try casting again.");
      setPhase("idle");
    } finally {
      isFishingRef.current = false;
    }
  }

  // ── FishingAnimation phase-complete callback ──────────────
  const handlePhaseComplete = useCallback(
    (completedPhase: FishingPhase) => {
      if (completedPhase === "casting") {
        // Bobber has landed → enter waiting (bobbing) state
        setPhase("waiting");
      } else if (completedPhase === "reeling") {
        // Reel-in done → show the fish reveal card and add to collection
        setPhase("reveal");
        setShowReveal(true);
        // currentCatch is guaranteed set by triggerBite before reeling phase begins
        setCurrentCatch((prev) => {
          if (prev) {
            setCollection((col) => {
              // Guard against duplicate additions (React strict mode double-invoke)
              if (col.length > 0 && col[col.length - 1] === prev) return col;
              return [...col, prev];
            });
          }
          return prev;
        });
      }
    },
    []
  );

  // Input is disabled during all active fishing phases
  const isDisabled = phase !== "idle" && phase !== "reveal";

  return (
    <main className="h-screen flex flex-col items-center bg-ocean-950 overflow-hidden">
      <div className="w-full max-w-[424px] mx-auto flex flex-col h-full">

        {/* ── Fishing animation — hero element (~35-40vh) ── */}
        <div className="flex-shrink-0">
          <FishingAnimation phase={phase} onPhaseComplete={handlePhaseComplete} />
        </div>

        {/* ── Chat conversation — scrollable, takes available space ── */}
        <ChatHistory messages={messages} isStreaming={isStreaming} />

        {/* ── Most recent catch: Fish Reveal + Score Breakdown ── */}
        {currentCatch && showReveal && (
          <div className="flex-shrink-0 px-4 pt-2 pb-1 flex flex-col gap-2">
            {/* Fish reveal card */}
            <FishReveal catch={currentCatch} visible={showReveal} />

            {/* Score breakdown — compact, below the card */}
            {currentScores && (
              <ScoreBreakdown
                scores={currentScores}
                habitat={currentCatch.habitat}
                sizeClass={currentCatch.sizeClass}
                rarity={currentCatch.rarity}
              />
            )}
          </div>
        )}

        {/* ── Session collection bar ── */}
        <div className="flex-shrink-0 px-4 pb-2">
          <Collection catches={collection} />
        </div>

        {/* ── Error message (dismissible) ── */}
        {errorMsg && (
          <div className="mx-4 mb-2 flex-shrink-0">
            <div className="border-2 border-red-800 bg-red-950 px-3 py-2 flex items-center justify-between gap-2">
              <span className="font-pixel text-[0.45rem] text-red-400">
                {errorMsg}
              </span>
              <button
                onClick={() => setErrorMsg(null)}
                className="font-pixel text-[0.45rem] text-red-600 hover:text-red-300 flex-shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── Prompt input — pinned at very bottom ── */}
        <div className="flex-shrink-0 border-t-2 border-slate-800 bg-ocean-950 px-4 py-3">
          <PromptInput onCast={handleCast} disabled={isDisabled} />
        </div>

      </div>
    </main>
  );
}

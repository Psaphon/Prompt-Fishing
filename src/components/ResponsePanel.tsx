"use client";

import { useState, useEffect } from "react";

interface ResponsePanelProps {
  text: string;
  isStreaming: boolean;
}

export default function ResponsePanel({ text, isStreaming }: ResponsePanelProps) {
  const [expanded, setExpanded] = useState(false);

  // Collapse back to preview when new response starts
  useEffect(() => {
    if (isStreaming) {
      setExpanded(false);
    }
  }, [isStreaming]);

  // Hidden when no content and not streaming
  if (!text && !isStreaming) return null;

  const PREVIEW_LEN = 500;
  const isLong = text.length > PREVIEW_LEN;
  const displayText = isLong && !expanded ? text.slice(0, PREVIEW_LEN) : text;

  return (
    <div className="w-full border-2 border-slate-700 bg-ocean-900 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-pixel text-[0.5rem] text-cyan-400">
          Claude&apos;s Response
        </span>
        {isStreaming && (
          <span className="font-pixel text-[0.42rem] text-slate-600 animate-pulse">
            streaming...
          </span>
        )}
      </div>

      {/* Response body — readable sans-serif, not pixel font */}
      <div className="text-[0.8rem] text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
        {displayText}
        {/* Blinking cursor while streaming */}
        {isStreaming && (
          <span
            className="inline-block align-middle ml-0.5 animate-cursor-blink"
            style={{
              width: "2px",
              height: "0.9em",
              background: "#22d3ee",
              verticalAlign: "text-bottom",
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Show more / show less for long responses */}
      {isLong && !isStreaming && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 font-pixel text-[0.42rem] text-cyan-700 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          {expanded ? "[ Show less ]" : `[ Show more (+${text.length - PREVIEW_LEN} chars) ]`}
        </button>
      )}
    </div>
  );
}

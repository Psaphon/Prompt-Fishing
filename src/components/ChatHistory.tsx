"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";

interface ChatHistoryProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export default function ChatHistory({ messages, isStreaming }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change or streaming updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-3 opacity-40">
        <span className="text-3xl">🎣</span>
        <span className="font-pixel text-[0.42rem] text-slate-500 text-center leading-loose">
          Ask Claude anything.
        </span>
        <span className="font-pixel text-[0.42rem] text-slate-600 text-center leading-loose">
          Your conversation will appear here.
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
      {messages.map((msg, i) => {
        const isLastAssistant =
          msg.role === "assistant" && i === messages.length - 1;
        const showCursor = isLastAssistant && isStreaming;

        if (msg.role === "user") {
          return (
            <div key={i} className="flex justify-end">
              <div
                className={[
                  "max-w-[80%] px-3 py-2",
                  "border-2 border-cyan-700 bg-cyan-950/40",
                  "text-[0.78rem] text-slate-100 leading-relaxed",
                ].join(" ")}
              >
                <div className="font-pixel text-[0.38rem] text-cyan-600 mb-1 text-right">
                  You
                </div>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          );
        }

        // Assistant message
        return (
          <div key={i} className="flex justify-start">
            <div
              className={[
                "max-w-[85%] px-3 py-2",
                "border-2 border-slate-700 bg-ocean-900",
                "text-[0.78rem] text-slate-300 leading-relaxed",
              ].join(" ")}
            >
              <div className="font-pixel text-[0.38rem] text-slate-500 mb-1">
                Claude
                {showCursor && (
                  <span className="ml-2 animate-pulse text-cyan-600">
                    streaming...
                  </span>
                )}
              </div>
              <div className="whitespace-pre-wrap break-words">
                {msg.content}
                {showCursor && (
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
            </div>
          </div>
        );
      })}

      {/* Invisible anchor for scroll-to-bottom */}
      <div ref={bottomRef} />
    </div>
  );
}

"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";

interface PromptInputProps {
  onCast: (prompt: string) => void;
  disabled: boolean;
}

export default function PromptInput({ onCast, disabled }: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount and when re-enabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      // Small delay so the reveal animation settles first
      const t = setTimeout(() => textareaRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [disabled]);

  function handleCast() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onCast(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter without Shift submits; Shift+Enter adds a newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCast();
    }
  }

  const charCount = value.length;
  const isOverLimit = charCount > 480;
  const canCast = !disabled && value.trim().length > 0;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="relative flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          className={[
            "flex-1 resize-none bg-ocean-900 text-slate-100",
            "font-pixel text-[0.6rem] leading-relaxed",
            "border-2 px-3 py-3 outline-none placeholder-slate-600",
            "min-h-[56px] max-h-[120px] overflow-y-auto",
            disabled
              ? "border-slate-700 cursor-not-allowed opacity-50"
              : "border-cyan-700 focus:border-cyan-400 transition-colors",
          ].join(" ")}
          placeholder="What would you like to ask? Cast your line..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={2}
          maxLength={500}
          aria-label="Your prompt"
        />
        <button
          onClick={handleCast}
          disabled={!canCast}
          className={[
            "font-pixel text-[0.55rem] px-4 border-2 transition-colors",
            "flex items-center justify-center whitespace-nowrap",
            // Minimum 44px touch target height
            "min-h-[56px] self-end",
            !canCast
              ? "border-slate-700 text-slate-600 cursor-not-allowed bg-ocean-900"
              : "border-cyan-500 text-cyan-300 bg-ocean-800 hover:bg-cyan-900 hover:border-cyan-300 active:scale-95 cursor-pointer transition-transform",
          ].join(" ")}
          aria-label="Cast your prompt"
        >
          Cast 🎣
        </button>
      </div>

      {/* Character counter */}
      <div className="flex justify-end">
        <span
          className={[
            "font-pixel text-[0.42rem]",
            isOverLimit ? "text-orange-500" : "text-slate-700",
          ].join(" ")}
        >
          {charCount}/500
        </span>
      </div>
    </div>
  );
}

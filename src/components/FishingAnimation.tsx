"use client";

import { useEffect, useRef } from "react";
import type { FishingPhase } from "@/lib/types";

interface FishingAnimationProps {
  phase: FishingPhase;
  onPhaseComplete?: (phase: FishingPhase) => void;
}

// Static star positions so they don't re-randomize on re-render
const STARS = [
  { top: "8%",  left: "12%", delay: 0 },
  { top: "15%", left: "68%", delay: 0.6 },
  { top: "6%",  left: "48%", delay: 1.1 },
  { top: "22%", left: "82%", delay: 0.3 },
  { top: "12%", left: "32%", delay: 0.9 },
  { top: "18%", left: "55%", delay: 1.5 },
  { top: "5%",  left: "78%", delay: 0.4 },
  { top: "25%", left: "20%", delay: 1.8 },
];

export default function FishingAnimation({
  phase,
  onPhaseComplete,
}: FishingAnimationProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-transition: casting → waiting after bobber lands (~0.85s)
  // Auto-transition: reeling → reveal after reel animation (~0.55s)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (phase === "casting") {
      timerRef.current = setTimeout(() => {
        onPhaseComplete?.("casting");
      }, 900);
    } else if (phase === "reeling") {
      timerRef.current = setTimeout(() => {
        onPhaseComplete?.("reeling");
      }, 580);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, onPhaseComplete]);

  const showBobber = phase !== "idle" && phase !== "reveal";
  const showLine = phase !== "idle" && phase !== "reveal";
  const isInWater = phase === "waiting" || phase === "bite" || phase === "reeling";

  // Bobber animation class by phase
  const bobberAnimClass = (() => {
    if (phase === "casting") return "animate-cast";
    if (phase === "waiting") return "animate-bobber-idle";
    if (phase === "bite")    return "animate-bobber-bite";
    if (phase === "reeling") return "animate-reel";
    return "";
  })();

  // Status text
  const statusText = (() => {
    if (phase === "casting")  return "Casting...";
    if (phase === "waiting")  return "Waiting for a bite...";
    if (phase === "bite")     return "Something's biting!";
    if (phase === "reeling")  return "Reeling in...";
    return null;
  })();

  return (
    <div
      className="water-surface w-full relative scanlines"
      style={{ height: "40vh", minHeight: "220px", maxHeight: "320px" }}
    >
      {/* Sky / atmosphere */}
      {(phase === "idle" || phase === "reveal") && (
        <>
          {/* Moon */}
          <div
            className="absolute"
            style={{ top: "12%", left: "18%", width: "28px", height: "28px" }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, #fef9c3, #fde68a)",
                boxShadow: "0 0 12px rgba(253,230,138,0.4), 0 0 30px rgba(253,230,138,0.15)",
              }}
            />
          </div>
          {/* Stars */}
          {STARS.map((s, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-slate-300 rounded-full animate-star-twinkle"
              style={{ top: s.top, left: s.left, animationDelay: `${s.delay}s` }}
            />
          ))}
        </>
      )}

      {/* Water surface shimmer layer */}
      <div className="water-shimmer absolute inset-x-0 bottom-0 h-20 opacity-50" />

      {/* Wave rows — subtle depth layers */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-wave absolute left-0 right-0 h-[3px] opacity-20"
          style={{
            bottom: `${4 + i * 5}%`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${2.2 + i * 0.3}s`,
            background: `linear-gradient(90deg, transparent, rgba(26,82,118,${0.4 + i * 0.1}) ${25 + i * 8}%, rgba(56,189,248,0.3) 50%, rgba(26,82,118,${0.4 + i * 0.1}) ${75 - i * 8}%, transparent)`,
          }}
        />
      ))}

      {/* Fishing rod (visible when not idle/reveal) */}
      {showLine && (
        <div
          className="absolute"
          style={{ top: "8%", right: "26%" }}
        >
          {/* Rod tip — small amber dot */}
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#92400e", boxShadow: "0 0 4px rgba(146,64,14,0.6)" }}
          />
          {/* Fishing line: from rod tip toward bobber in water (left and down) */}
          {isInWater && (
            <svg
              className="absolute top-1 left-1 pointer-events-none overflow-visible"
              style={{ width: "1px", height: "1px" }}
              aria-hidden="true"
            >
              {/* Line goes from rod tip down-left to bobber resting position */}
              <line
                x1="0" y1="0"
                x2="-95" y2="90"
                stroke="rgba(203,213,225,0.45)"
                strokeWidth="1.5"
              />
            </svg>
          )}
        </div>
      )}

      {/* Bobber */}
      {showBobber && (
        <div
          className={`absolute ${bobberAnimClass}`}
          style={{
            // During casting: bobber starts at rod tip; other active phases: resting in water
            bottom: phase === "casting" ? "48%" : "31%",
            right:  phase === "casting" ? "26%" : "52%",
            zIndex: 10,
          }}
        >
          {/* Bobber: red top half, white bottom half */}
          <div className="relative w-4 h-7">
            {/* Antenna */}
            <div
              className="absolute -top-2 left-[7px] w-[2px] h-2"
              style={{ background: "#92400e" }}
            />
            {/* Red cap */}
            <div
              className="absolute top-0 left-0 right-0 h-[14px] rounded-t-full"
              style={{
                background: phase === "bite" ? "#f97316" : "#ef4444",
                border: "1px solid " + (phase === "bite" ? "#ea580c" : "#b91c1c"),
                boxShadow: phase === "bite" ? "0 0 8px rgba(249,115,22,0.8)" : "none",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
            />
            {/* White float */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[14px] rounded-b-full"
              style={{
                background: "#f1f5f9",
                border: "1px solid #94a3b8",
              }}
            />
          </div>
        </div>
      )}

      {/* Ripples in water */}
      {isInWater && (
        <div
          className="absolute"
          style={{ bottom: "31%", right: "54%", zIndex: 5 }}
        >
          {/* Inner ripple — faster */}
          <div
            className="animate-ripple border border-cyan-500/50 rounded-full absolute"
            style={{ width: "20px", height: "7px", top: "4px", left: "-4px" }}
          />
          {/* Outer ripple — slower */}
          <div
            className="animate-ripple-slow border border-cyan-400/25 rounded-full absolute"
            style={{
              width: "28px",
              height: "10px",
              top: "2px",
              left: "-8px",
              animationDelay: "0.4s",
            }}
          />
        </div>
      )}

      {/* Splash drops on bite */}
      {phase === "bite" && (
        <div
          className="absolute pointer-events-none"
          style={{ bottom: "35%", right: "50%", zIndex: 8 }}
        >
          {[
            { dx: -12, dy: -14, delay: 0 },
            { dx: 0,   dy: -18, delay: 0.08 },
            { dx: 14,  dy: -12, delay: 0.16 },
            { dx: -6,  dy: -20, delay: 0.04 },
            { dx: 8,   dy: -16, delay: 0.12 },
          ].map((drop, i) => (
            <span
              key={i}
              className="absolute text-xs animate-splash"
              style={{
                animationDelay: `${drop.delay}s`,
                transform: `translate(${drop.dx}px, ${drop.dy}px)`,
                fontSize: "0.55rem",
                color: "rgba(147,197,253,0.9)",
              }}
            >
              ·
            </span>
          ))}
        </div>
      )}

      {/* Status text bar */}
      {statusText && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center px-4">
          <span
            className={[
              "font-pixel text-[0.5rem]",
              phase === "bite"
                ? "text-orange-400 animate-pulse"
                : "text-cyan-500",
            ].join(" ")}
          >
            {statusText}
          </span>
        </div>
      )}

      {/* Idle: invitation text */}
      {(phase === "idle" || phase === "reveal") && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <span className="font-pixel text-[0.45rem] text-slate-600">
            {phase === "idle" ? "Cast your line to begin..." : "Cast again to keep fishing"}
          </span>
        </div>
      )}
    </div>
  );
}

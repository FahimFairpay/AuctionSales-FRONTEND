"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FairOrb } from "../orb/FairOrb";
import { VehicleCard } from "./VehicleCard";
import type { MatchedVehicle } from "../../api/copilot";

interface CopilotVehicleCarouselProps {
  vehicles: MatchedVehicle[];
  animate?: boolean;
  onAnimateDone?: () => void;
}

export const CopilotVehicleCarousel: React.FC<CopilotVehicleCarouselProps> = ({
  vehicles,
  animate = false,
  onAnimateDone,
}) => {
  const [allExpanded, setAllExpanded] = useState(false);

  // Freeze the animate value at mount. The parent may update animate={false} on the
  // next render cycle once it records this carousel as "already animated", but the
  // VehicleCards must receive the SAME value they were mounted with so the flip-in
  // CSS transition is not immediately cancelled by a prop change.
  const frozenAnimate = useRef(animate).current;

  // Notify the parent AFTER mount so it can mark this carousel as done.
  useEffect(() => {
    if (frozenAnimate && onAnimateDone) {
      onAnimateDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="copilot-vehicle-row carousel-perspective-track mt-2.5 -mx-1 flex w-[calc(100%+8px)] gap-3.5 overflow-x-auto pb-3 pt-1 px-1 scroll-smooth select-none [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.18)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.22)_transparent]"
      style={{
        scrollSnapType: "x mandatory",
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      {vehicles.map((v, idx) => (
        <VehicleCard
          key={v.stockNumber}
          vehicle={v}
          index={idx}
          isExpanded={allExpanded}
          onToggleExpand={() => setAllExpanded((prev) => !prev)}
          animate={frozenAnimate}
        />
      ))}
    </div>
  );
};

interface FluidWordCascadeProps {
  content: string;
  isStreaming?: boolean;
  onComplete?: () => void;
}

export const FluidWordCascade: React.FC<FluidWordCascadeProps> = ({
  content,
  isStreaming = false,
  onComplete,
}) => {
  const words = useMemo(() => content.split(" "), [content]);
  const [count, setCount] = useState(isStreaming ? 0 : words.length);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(!isStreaming);

  useEffect(() => {
    if (!isStreaming) {
      setCount(words.length);
      return;
    }
    completedRef.current = false;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setCount(current);
      if (current >= words.length) {
        clearInterval(interval);
        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(() => {
            onCompleteRef.current?.();
          }, 120);
        }
      }
    }, 60);
    return () => clearInterval(interval);
  }, [words, isStreaming]);

  return (
    <p className="reveal-word-cascade whitespace-pre-wrap font-medium">
      {words.slice(0, count).map((word, idx) => (
        <span key={idx} className={isStreaming ? "cascade-word" : undefined}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
};

const THOUGHT_STEPS = [
  "Interpreting search parameters & filters",
  "Querying live wholesale run lists & damage score indexes",
  "Synthesizing vehicle cards and pricing signals",
];

export const CopilotThoughtStream: React.FC = () => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStepIdx(1), 1300);
    const t2 = setTimeout(() => setStepIdx(2), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2.5 w-full animate-in fade-in duration-300">
      {/* FairOrb Step Cycling Badge */}
      <div className="flex items-center gap-2 px-1">
        <FairOrb
          state="searching"
          size={20}
          place="inline"
          label={THOUGHT_STEPS[stepIdx]}
        />
      </div>

      {/* Shimmering Thought Skeleton Bubble */}
      <div
        className="max-w-[92%] p-3.5 rounded-[20px] rounded-tl-[4px] border space-y-2"
        style={{
          background: "var(--glass-card-bg)",
          border: "var(--glass-card-border)",
          boxShadow: "var(--glass-card-shadow)",
          backdropFilter: "blur(24px) saturate(190%)",
          WebkitBackdropFilter: "blur(24px) saturate(190%)",
        }}
      >
        <div className="h-2.5 w-full rounded-md bg-black/10 dark:bg-white/10 animate-pulse" />
        <div className="h-2.5 w-4/5 rounded-md bg-black/10 dark:bg-white/10 animate-pulse" />
        <div className="h-2.5 w-3/5 rounded-md bg-black/10 dark:bg-white/10 animate-pulse" />
      </div>

      {/* Skeleton Car Cards Carousel */}
      <div className="flex gap-3 overflow-hidden py-1">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="w-[280px] shrink-0 rounded-2xl border p-2.5 space-y-2"
            style={{
              background: "var(--glass-card-bg)",
              border: "var(--glass-card-border)",
              boxShadow: "var(--glass-card-shadow)",
            }}
          >
            <div className="h-28 w-full rounded-xl bg-black/10 dark:bg-white/10 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
            <div className="h-2.5 w-1/2 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

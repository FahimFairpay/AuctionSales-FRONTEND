"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PANEL_WIDTH = 208;
const NOTE =
  "These are estimates based on repair and potential winning price and other expenses. These estimates may differ than actual. To get a full breakdown contact us and we will walk you through it.";

export function EstimateNote() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const place = () => {
      const button = buttonRef.current;
      if (!button) {
        return;
      }
      const rect = button.getBoundingClientRect();
      const height = panelRef.current?.offsetHeight ?? 112;
      const left = Math.min(Math.max(12, rect.left - 8), window.innerWidth - PANEL_WIDTH - 12);
      const below = rect.bottom + 8;
      const top = below + height > window.innerHeight - 12 ? Math.max(12, rect.top - height - 8) : below;
      setBox({ top, left });
    };
    place();
    const frame = window.requestAnimationFrame(place);
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="About these estimates"
        aria-expanded={open}
        className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border border-current text-[9px] font-medium leading-none text-muted"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        i
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              role="note"
              style={{ top: box?.top ?? -9999, left: box?.left ?? 12, width: PANEL_WIDTH }}
              className="fixed z-[80] rounded-[6px] border border-hairline bg-surface px-2.5 py-2 text-left shadow-[0_8px_20px_rgba(20,20,19,0.10)]"
            >
              <p className="font-sans text-[11px] leading-[15px] font-medium tracking-[0.01em] text-muted">{NOTE}</p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}


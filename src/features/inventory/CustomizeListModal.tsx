"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconTool } from "../../components/IconTool";
import {
  CARD_GROUPS,
  DEFAULT_CARD_FIELDS,
  allCardFieldIds,
  type CardFieldId,
} from "./cardFields";

export function CustomizeListModal({
  open,
  selected,
  onClose,
  onChange,
}: {
  open: boolean;
  selected: CardFieldId[];
  onClose: () => void;
  onChange: (next: CardFieldId[]) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const chosen = new Set(selected);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function toggle(id: CardFieldId) {
    if (chosen.has(id)) {
      onChange(selected.filter((item) => item !== id));
      return;
    }
    onChange([...selected, id]);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-title"
        className="max-h-[min(90dvh,40rem)] w-full max-w-4xl overflow-y-auto rounded-[8px] border border-hairline bg-surface p-5 shadow-lg lg:max-h-none lg:overflow-visible"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="customize-title" className="font-serif text-xl text-ink">
              Customize list
            </h2>
            <p className="mt-1 text-sm text-muted">Photo and title always stay on.</p>
          </div>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <PresetButton label="All fields" onClick={() => onChange(allCardFieldIds())}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="4" width="7" height="7" rx="1.5" />
              <rect x="13" y="4" width="7" height="7" rx="1.5" />
              <rect x="4" y="13" width="7" height="7" rx="1.5" />
              <rect x="13" y="13" width="7" height="7" rx="1.5" />
            </svg>
          </PresetButton>
          <PresetButton label="Default" onClick={() => onChange([...DEFAULT_CARD_FIELDS])}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" strokeLinecap="round" />
              <path d="M4.5 5.5v4h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </PresetButton>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARD_GROUPS.filter((group) => group.fields.length > 0).map((group) => (
            <section key={group.id}>
              <h3 className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">{group.label}</h3>
              <div className="flex flex-wrap gap-1.5">
                {group.fields.map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => toggle(field.id)}
                    className={chosen.has(field.id)
                      ? "inline-flex h-7 items-center rounded-full border border-accent/70 bg-accent/10 px-2.5 text-[12px] font-medium text-accent backdrop-blur-sm shadow-[0_0_8px_0_rgba(217,119,87,.25)] transition-all duration-[120ms] select-none"
                      : "inline-flex h-7 items-center rounded-full border border-hairline/60 bg-surface-muted/40 px-2.5 text-[12px] font-medium text-muted backdrop-blur-sm hover:text-ink hover:border-hairline hover:bg-surface-muted/70 transition-all duration-[120ms] select-none"
                    }
                  >
                    {field.label}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function PresetButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-hairline px-2.5 text-xs text-ink hover:bg-surface-muted"
      onClick={onClick}
    >
      {children}
      {label}
    </button>
  );
}

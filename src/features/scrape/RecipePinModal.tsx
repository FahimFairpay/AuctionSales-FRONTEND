"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/compat/router";
import { unlockAdminRecipe } from "../../api/scrape";
import { Button } from "../../components/Button";
import { IconTool } from "../../components/IconTool";
import { PinBoxInput } from "../../components/PinBoxInput";
import { Spinner } from "../../components/Spinner";
import { paths } from "../../routes/paths";
import type { PublicRecipe } from "../../types/api";

export function RecipePinModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) { setPin(""); setError(""); return; }
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [open, onClose]);

  if (!open) return null;

  async function submit(pinVal?: string) {
    const p = pinVal ?? pin;
    if (p.length < 6) { setError("Enter all 6 digits."); return; }
    setError("");
    setPending(true);
    try {
      const recipe: PublicRecipe = await unlockAdminRecipe(p);
      try {
        sessionStorage.setItem("fps_unlocked_recipe", JSON.stringify(recipe));
      } catch {}
      onClose();
      navigate(paths.adminRecipe, { state: { recipe, mode: "preview" } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid PIN.");
      setPin("");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4 backdrop-blur-[10px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-pin-title"
        className="w-full max-w-sm rounded-[12px] border border-hairline bg-surface p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="recipe-pin-title" className="font-serif text-2xl text-ink">Scrape recipe</h2>
            <p className="mt-1 text-sm text-muted">Enter your 6-digit PIN to unlock.</p>
          </div>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
        <div className="mt-6 space-y-5">
          <PinBoxInput value={pin} onChange={setPin} onComplete={(p) => void submit(p)} autoFocus label="Recipe PIN" />
          {error ? (
            <p className="rounded-[8px] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}
          <Button className="w-full" disabled={pending || pin.length < 6} onClick={() => void submit()}>
            {pending ? <Spinner /> : "Unlock"}
          </Button>
        </div>
      </div>
    </div>
  );
}

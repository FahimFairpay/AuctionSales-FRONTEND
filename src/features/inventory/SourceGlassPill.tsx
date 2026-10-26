"use client";

type House = "IAAI" | "COPART";

function houseOf(source?: string): House {
  return String(source || "IAAI").toUpperCase() === "COPART" ? "COPART" : "IAAI";
}

export function houseLabel(source?: string): string {
  return houseOf(source) === "COPART" ? "Copart" : "IAAI";
}

export function SourceCornerLabel({ source }: { source?: string }) {
  const copart = houseOf(source) === "COPART";
  return (
    <span
      className={`pointer-events-none inline-flex h-4 items-center rounded-[3px] bg-black/80 px-1 text-[9px] font-semibold leading-none tracking-wide ${copart ? "text-[#d7c4a8]" : "text-white"}`}
    >
      {houseLabel(source)}
    </span>
  );
}

const activePill =
  "inline-flex h-8 items-center rounded-full border border-accent/70 bg-accent/10 px-3 text-[13px] font-medium text-accent transition-all duration-[120ms] select-none";
const idlePill =
  "inline-flex h-8 items-center rounded-full border border-hairline/60 bg-surface-muted/40 px-3 text-[13px] font-medium text-muted hover:text-ink hover:border-hairline hover:bg-surface-muted/70 transition-all duration-[120ms] select-none";

export function ProviderChoice({
  value,
  onChange,
  includeAll = false,
}: {
  value?: string;
  onChange: (next: House | undefined) => void;
  includeAll?: boolean;
}) {
  const options: Array<{ label: string; value: House | undefined }> = [
    ...(includeAll ? [{ label: "All", value: undefined as House | undefined }] : []),
    { label: "IAAI", value: "IAAI" },
    { label: "Copart", value: "COPART" },
  ];
  const current = String(value || "").toUpperCase();
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Provider">
      {options.map((option) => {
        const active = option.value ? current === option.value : !current || current === "ALL";
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={active ? activePill : idlePill}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function versionNumber(version?: string): number {
  const number = Number(String(version || "").replace(/\D/g, ""));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export function VersionMark({ version }: { version?: string }) {
  const number = versionNumber(version);
  if (!number) return null;
  return (
    <sup
      className="ml-0.5 inline-flex h-3.5 min-w-3.5 -translate-y-1 items-center justify-center rounded-full border border-current px-[3px] align-super text-[9px] font-medium leading-none text-current"
      aria-label={`Version ${number}`}
    >
      {number}
    </sup>
  );
}

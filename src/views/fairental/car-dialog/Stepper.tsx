export function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="relative mx-auto mb-4 flex w-28 items-center justify-between" aria-label={`Step ${step} of 2`}>
      <span className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-hairline" aria-hidden="true" />
      <Node active={step === 1} done={step > 1} label="1" />
      <Node active={step === 2} done={false} label="2" />
    </div>
  );
}

function Node({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <span
      className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
        done || active ? "border-ink bg-surface text-ink" : "border-hairline bg-surface text-muted"
      }`}
    >
      {done ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M5 12.5 10 17l9-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        label
      )}
    </span>
  );
}

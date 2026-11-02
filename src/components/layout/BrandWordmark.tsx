import "./brand-wordmark.css";

export function BrandWordmark({ size = "header" }: { size?: "header" | "display" }) {
  return (
    <span className={`brand-wordmark brand-wordmark-${size}`}>
      FairAutos
      <span className="brand-arrow" aria-hidden="true">
        ↗︎
      </span>
    </span>
  );
}

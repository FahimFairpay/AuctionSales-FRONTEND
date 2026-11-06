export const COLOR_SWATCHES: { name: string; hex: string }[] = [
  { name: "Black", hex: "#1c1c1c" },
  { name: "White", hex: "#f7f4ee" },
  { name: "Silver", hex: "#c5c7cb" },
  { name: "Gray", hex: "#8d8f94" },
  { name: "Red", hex: "#b42318" },
  { name: "Blue", hex: "#2f5d9f" },
  { name: "Green", hex: "#2f6b4f" },
  { name: "Brown", hex: "#7a5334" },
  { name: "Beige", hex: "#d9c7a6" },
  { name: "Gold", hex: "#c6a15b" },
  { name: "Orange", hex: "#d97757" },
  { name: "Yellow", hex: "#e2c044" },
  { name: "Purple", hex: "#6d4c8d" },
];

export function swatchHex(name: string): string {
  return COLOR_SWATCHES.find((swatch) => swatch.name.toLowerCase() === name.toLowerCase())?.hex || "#c5bfb6";
}

export function dollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export const glass =
  "border border-[var(--fs-glass-border)] bg-[var(--fs-glass-popover-bg)] shadow-[var(--fs-glass-shadow)] backdrop-blur-[28px]";

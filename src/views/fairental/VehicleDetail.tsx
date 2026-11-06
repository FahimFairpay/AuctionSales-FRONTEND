"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { paths } from "@/routes/paths";
import type { FairentalDetail } from "./fairentalApi";
import { Gallery } from "./Gallery";
import { dollars, glass, swatchHex } from "./swatches";

export function VehicleDetail({ car }: { car: FairentalDetail }) {
  const facts = [
    ["Year", String(car.year)],
    ["Make", car.make],
    ["Model", car.model],
    ["Body", car.bodyStyle],
    ["Exterior", car.exteriorColor],
    ["Interior", car.interiorColor],
  ];
  return (
    <div className="fairautos-landing min-h-screen">
      <PublicHeader mode="inventory" />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 pt-28 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
        <Gallery images={car.images || []} title={car.title} />
        <section className={`${glass} rounded-[28px] p-6`}>
          <Link href={paths.fairental} className="text-[12px] uppercase tracking-[0.16em] text-[var(--fs-muted)] no-underline">
            Fairental
          </Link>
          <h1 className="mt-3 text-[36px] leading-none text-[var(--fs-ink)]">{car.title}</h1>
          <p className="mt-2 text-[var(--fs-text-sub)]">{car.year} {car.make} {car.model}</p>
          <p className="mt-6 text-[32px] text-[var(--fs-claude-orange)]">{dollars(car.price)}</p>
          <div className="mt-6 min-h-12" />
          <dl className="grid grid-cols-2 gap-3">
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[var(--fs-paper)] px-3 py-2">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-[var(--fs-muted)]">{label}</dt>
                <dd className="mt-1 flex items-center gap-2 text-[14px]">
                  {label === "Exterior" || label === "Interior" ? (
                    <span className="h-3 w-3 rounded-full border border-[var(--fs-line)]" style={{ background: swatchHex(value) }} />
                  ) : null}
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          {car.description ? <p className="mt-5 text-[15px] leading-7 text-[var(--fs-text-sub)]">{car.description}</p> : null}
        </section>
      </main>
    </div>
  );
}

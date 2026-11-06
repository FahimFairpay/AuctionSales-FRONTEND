"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { paths } from "@/routes/paths";
import type { FairentalDetail } from "./fairentalApi";
import { dollars } from "./filters";
import { Gallery } from "./Gallery";

export function VehicleDetail({ car }: { car: FairentalDetail }) {
  const heading = [car.year, car.make, car.model].filter(Boolean).join(" ");
  const showTitle = car.title && car.title.trim().toLowerCase() !== heading.toLowerCase();
  const spec = [car.bodyStyle, car.exteriorColor, car.interiorColor].filter(Boolean).join(" · ");

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <PublicHeader mode="inventory" />
      <main className="public-page-frame min-w-0 flex-1">
        <Link href={paths.fairental} className="text-sm text-muted no-underline hover:text-ink">
          Fairental
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Gallery images={car.images || []} title={heading} />
          <section>
            <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] text-ink lg:text-[34px] lg:leading-10">
              {heading}
            </h1>
            {showTitle ? <p className="mt-1 text-sm text-muted">{car.title}</p> : null}
            <p className="mt-4 text-3xl font-medium text-ink">{dollars(car.price)}</p>
            <div className="mt-4 min-h-6" />
            {spec ? <p className="text-sm text-ink">{spec}</p> : null}
            {car.description ? <p className="mt-4 text-sm leading-6 text-muted">{car.description}</p> : null}
          </section>
        </div>
      </main>
    </div>
  );
}

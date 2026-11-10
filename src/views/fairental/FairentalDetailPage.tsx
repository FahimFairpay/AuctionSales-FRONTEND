"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { FairOrb } from "@/components/orb/FairOrb";
import { paths } from "@/routes/paths";
import { adminFairental, listFairental, publicFairental, type FairentalCard, type FairentalDetail } from "./fairentalApi";
import { EMPTY_FILTERS } from "./filters";
import { DetailFacts } from "./DetailFacts";
import { DetailGallery } from "./DetailGallery";
import { MoreCars } from "./MoreCars";
import { carStatus } from "./StatusMark";

export function FairentalDetailPage({ admin }: { admin?: boolean }) {
  const params = useParams();
  const vin = decodeURIComponent(String(params?.vin || ""));
  const list = admin ? paths.adminFairental : paths.fairental;
  const [car, setCar] = useState<FairentalDetail | null>(null);
  const [others, setOthers] = useState<FairentalCard[]>([]);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vin) {
      setLoading(false);
      setMissing(true);
      return;
    }
    let gone = false;
    setLoading(true);
    setMissing(false);
    setCar(null);
    setOthers([]);
    const detail = admin ? adminFairental(vin) : publicFairental(vin);
    Promise.all([detail, listFairental(EMPTY_FILTERS, !!admin).catch(() => ({ items: [] as FairentalCard[] }))])
      .then(([row, page]) => {
        if (gone) return;
        setCar(row);
        setOthers(page.items.filter((item) => item.vin !== row.vin).slice(0, 4));
      })
      .catch(() => {
        if (gone) return;
        setCar(null);
        setMissing(true);
      })
      .finally(() => {
        if (!gone) setLoading(false);
      });
    return () => {
      gone = true;
    };
  }, [vin, admin]);

  const body = loading ? (
    <div className="flex min-h-64 items-center justify-center">
      <FairOrb state="working" />
    </div>
  ) : missing || !car ? (
    <div className="space-y-3">
      <BackLink href={list} />
      <p className="text-sm text-muted">This car is not available.</p>
      <Link href={list} className="text-sm text-ink hover:underline">See all cars</Link>
    </div>
  ) : (
    <div className="space-y-6">
      <BackLink href={list} />
      <div className="grid min-h-0 gap-5 lg:grid-cols-[minmax(24rem,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <DetailGallery
          key={car.vin}
          urls={(car.images || []).map((image) => image.url).filter(Boolean)}
          status={admin ? carStatus(car) : undefined}
        />
        <DetailFacts car={car} admin={admin} />
      </div>
      <MoreCars cars={others} admin={admin} />
    </div>
  );

  if (admin) return body;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <PublicHeader mode="inventory" />
      <main className="public-page-frame min-w-0 flex-1">{body}</main>
    </div>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Sales
    </Link>
  );
}

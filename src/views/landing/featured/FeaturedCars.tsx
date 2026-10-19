"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paths } from "@/routes/paths";
import { listPublicInventory } from "@/api/publicInventory";
import { ImageGallery } from "@/features/inventory/ImageGallery";
import { expandVisImages, type VisCandidate } from "@/features/inventory/visImages";

interface CarCardItem {
  id: string;
  stockNumber?: string;
  name: string;
  spec: string;
  price: string;
  image: string;
  titleTag: string;
  damageTag: string;
  availability: string;
  damageType: string;
}

const FEATURED_CARS: CarCardItem[] = [
  {
    id: "porsche-macan-2022",
    stockNumber: "45721370",
    name: "2022 Porsche Macan",
    spec: "Base AWD · 38,400 mi · Dallas, TX",
    price: "$24,500",
    image: "/assets/secondlook_hero.jpg",
    titleTag: "Clean title example",
    damageTag: "Accident damage",
    damageType: "accident",
    availability: "Sample listing",
  },
  {
    id: "bmw-330i-2023",
    stockNumber: "36291048",
    name: "2023 BMW 330i",
    spec: "Sport Line · 24,800 mi · Denver, CO",
    price: "$19,000",
    image: "/assets/prefooter_bmw.jpg",
    titleTag: "Clean title example",
    damageTag: "Hail damage",
    damageType: "hail",
    availability: "Auction deadline not supplied",
  },
  {
    id: "mercedes-c300-2022",
    name: "2022 Mercedes-Benz C 300",
    spec: "Premium · 31,200 mi · Houston, TX",
    price: "$20,000",
    image: "/assets/cat_luxury.jpg",
    titleTag: "Clean title example",
    damageTag: "Accident damage",
    damageType: "accident",
    availability: "Sample listing",
  },
  {
    id: "bmw-330i-2021",
    name: "2021 BMW 330i",
    spec: "Base RWD · 46,500 mi · Dallas, TX",
    price: "$15,500",
    image: "/assets/featured_camry.jpg",
    titleTag: "Clean title example",
    damageTag: "Hail damage",
    damageType: "hail",
    availability: "Sample listing",
  },
];

export function FeaturedCars() {
  const [liveCars, setLiveCars] = useState<CarCardItem[]>(FEATURED_CARS);
  const [galleryCar, setGalleryCar] = useState<{ title: string; candidates: VisCandidate[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPublicInventory({ limit: 4 })
      .then((res) => {
        if (cancelled || !res?.items || res.items.length === 0) return;
        const mapped: CarCardItem[] = res.items.slice(0, 4).map((item) => {
          const specParts: string[] = [];
          if (item.year) specParts.push(String(item.year));
          if (item.odometer) specParts.push(`${item.odometer.toLocaleString()} mi`);
          if (item.branch) specParts.push(item.branch);
          if (specParts.length === 0 && item.model) specParts.push(item.model);
  
          const priceVal = item.buyNowPrice || item.currentBid || item.acv;
          const formattedPrice = priceVal ? `$${priceVal.toLocaleString()}` : "$19,000";
  
          return {
            id: item.stockNumber,
            stockNumber: item.stockNumber,
            name: item.title || `${item.year || ""} ${item.make || ""} ${item.model || ""}`.trim() || "Wholesale Vehicle",
            spec: specParts.join(" · ") || "Run & Drive · Clean Title",
            price: formattedPrice,
            image: item.imageUrl || "/assets/secondlook_hero.jpg",
            titleTag: item.titleDoc ? `${item.titleDoc} focus` : "Clean title focus",
            damageTag: item.primaryDamage ? `${item.primaryDamage} damage` : "Minor damage",
            damageType: item.lossType || "wholesale",
            availability: item.auctionDate || "Auction deadline not supplied",
          };
        });
        setLiveCars(mapped);
      })
      .catch((err) => {
        console.warn("Failed to fetch live inventory for landing, using fallback:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
        <section className="inventory-section section">
          <div className="section-heading">
            <div>
              <div className="eyebrow dark">01 / FIND YOUR POTENTIAL</div>
              <h2>
                A second look.
                <br />
                <em>A better opportunity.</em>
              </h2>
            </div>
            <div className="section-heading-aside">
              <Link href={paths.publicInventory} className="browse-all-link">
                <span>Browse all cars</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <p>
                Browse wholesale prices on your own. When you want the full repair and
                road-ready cost, request a personalized quote.
              </p>
            </div>
          </div>
  
          <div className="car-grid featured-grid">
            {liveCars.map((car) => {
              const carHref = `/inventory/${car.stockNumber || car.id}`;
              return (
                <article key={car.id} className="car-card">
                  <div className="car-photo group/thumb">
                    <img
                      src={car.image}
                      alt={`${car.name} photo`}
                      loading="lazy"
                    />
                    <span className="title-tag">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {car.titleTag}
                    </span>
  
                    <span className="damage-tag">{car.damageTag}</span>
  
                    {/* All Images Stack Button with Pop Modal at Bottom-Right */}
                    <button
                      type="button"
                      aria-label="All images"
                      className="car-image-stack-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const vis = expandVisImages(car.image);
                        const candidates: VisCandidate[] =
                          vis.length > 0
                            ? vis
                            : [{ thumb: car.image, large: car.image, index: 1, set: null }];
                        setGalleryCar({ title: car.name, candidates });
                      }}
                    >
                      <span className="stack-icon-wrap">
                        <svg viewBox="0 0 24 24" className="stack-svg" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M12 3l9 4.5-9 4.5L3 7.5 12 3z" strokeLinejoin="round" />
                          <path d="M3 12l9 4.5L21 12" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 16.5L12 21l9-4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="stack-label">All Images</span>
                    </button>
                  </div>
  
                  <div className="car-info">
                    <Link href={carHref} className="car-name-link" title={`View ${car.name}`}>
                      <h3>{car.name}</h3>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path d="M7 7h10v10" />
                        <path d="M7 17 17 7" />
                      </svg>
                    </Link>
                    <p className="car-meta">{car.spec}</p>
  
                    <div className="car-bottom-row">
                      <div className="car-bottom-left">
                        <span className="car-auction-date">{car.availability}</span>
                        <Link href={paths.publicInventory} className="view-all-cars-btn">
                          <span>View All Cars</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
  
                      <div className="car-pricing-cluster">
                        <span className="price-label">Wholesale · Asking price</span>
                        <strong className="price-figure">{car.price}</strong>
                        <span className="price-disclaimer">Before fees &amp; repairs</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
  
          {galleryCar ? (
            <ImageGallery
              title={galleryCar.title}
              candidates={galleryCar.candidates}
              onClose={() => setGalleryCar(null)}
            />
          ) : null}
  
          <p className="fine-print">
            Wholesale figures reflect active dealer inventory and auction bids before repair estimates, buyer fees, taxes, and shipping.
          </p>
        </section>
  );
}

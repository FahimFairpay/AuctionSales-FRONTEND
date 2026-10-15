"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { paths } from "@/routes/paths";
import { CopilotDrawer, type CopilotDrawerHandle } from "@/components/copilot/CopilotDrawer";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { BrandWordmark } from "@/components/layout/BrandWordmark";
import { FiveSteps } from "./five-steps/FiveSteps";
import { GuideValue } from "./guide-value/GuideValue";
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

const FAQ_ITEMS = [
  {
    q: "Does clean title mean accident-free?",
    a: "No. Clean title refers to title status, not accident history or safety. Verify the title and VIN history and get an independent inspection before buying.",
  },
  {
    q: "What are your fees?",
    a: "Our service fee and applicable auction, transport, tax and registration costs will be itemized in your written quote. Fees have not yet been published on this site.",
  },
  {
    q: "Can the car be inspected before I buy?",
    a: "Ask for the inspection options available for your selected vehicle before committing. Access and inspection scope depend on the seller or auction.",
  },
  {
    q: "How do I get a repair estimate?",
    a: "Sign in and request a road-ready quote with your ZIP code, budget and buying timeline. Our team manually evaluates the request. Repair estimates depend on the available evidence and inspection.",
  },
  {
    q: "Can you help with shipping?",
    a: "Yes, shipping guidance is part of the planned buying service. Availability, transport timing and cost are confirmed for the selected vehicle and delivery address.",
  },
  {
    q: "How long does purchase through registration take?",
    a: "Timing varies with the seller, transport, parts, repair scope and registration requirements. The team can outline a vehicle-specific timeline during quote review.",
  },
  {
    q: "Is the 25% saving guaranteed?",
    a: "No. It is a target. Actual savings depend on purchase price, repairs, fees and comparable market value. No road-ready price is published before manual review.",
  },
];

export function LandingPage() {
  const [liveCars, setLiveCars] = useState<CarCardItem[]>(FEATURED_CARS);
  const [galleryCar, setGalleryCar] = useState<{ title: string; candidates: VisCandidate[] } | null>(null);
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const copilotRef = useRef<CopilotDrawerHandle>(null);

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

  const handleHeroAskAiClick = () => {
    copilotRef.current?.focusAndShow();
  };

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="fairsales-landing">
      {/* Morphing Adaptive Header: Zero size shift, early scroll trigger */}
      <PublicHeader mode="landing" />

      {/* ====================================================================
           HERO SECTION: FULL-PAGE VIEWPORT FILL + DITTO "POTENTIAL, WITH A PLAN"
           ==================================================================== */}
      <section className="hero-section" id="hero">
        {/* Full-bleed Luxury Sports Car Background */}
        <div className="hero-bg-container">
          <img
            src="/assets/secondlook_hero.jpg"
            alt="Illustrative sports car on an open road"
            className="hero-bg-car"
          />
          <div className="hero-bg-scrim" />
        </div>

        {/* Main Hero Center Content Grid */}
        <div className="hero-layout-grid">
          <div className="hero-left-content">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              <span>A DIFFERENT ROAD TO OWNERSHIP</span>
            </div>

            <h1 className="hero-headline">
              Your next car.
              <br />
              <em>A smarter price.</em>
            </h1>

            <p className="hero-subtext">
              A curated list of wholesale cars with minor damage. <br />
              Expert guidance from purchase through registration. <br />
              A smarter path to savings of around 25%.
            </p>

            <div className="hero-buttons-row">
              <Link href={paths.signUp} className="btn-hero-get-started">
                <span>Get Started</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </Link>

              {/* Ask us Button: Apple VisionOS liquid glass with Claude AI sparkle */}
              <button
                type="button"
                className="btn-hero-ai"
                onClick={handleHeroAskAiClick}
                aria-label="Ask FairSales AI Copilot"
              >
                <span className="btn-ai-sparkle-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="btn-ai-sparkle"
                  >
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
                    <path d="M19 4v4" />
                    <path d="M21 6h-4" />
                  </svg>
                </span>
                <span>Ask us</span>
              </button>
            </div>

            <div className="hero-assurance">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Clean-title focus</span>
              <span className="dot-sep">·</span>
              <span>Wholesale access</span>
              <span className="dot-sep">·</span>
              <span>Guided all the way</span>
            </div>
          </div>

          {/* POTENTIAL, WITH A PLAN (Structure from sales.fairpy.com) */}
          <div className="hero-float">
            <span className="tiny">POTENTIAL, WITH A PLAN</span>
            <strong>
              Target Savings<br />After Repairs
            </strong>
            <div>
              <span>
                Your car.<br />Your smart move.
              </span>
              <b>25%↘︎</b>
            </div>
          </div>
        </div>

        {/* Hero Bottom Bar Pinned Elegantly at Viewport Base */}
        <div className="hero-bottom">
          <span>SEE THE POTENTIAL. KNOW THE PROCESS.</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </section>



      {/* ====================================================================
           SECTION 1: INTRO STRIP (BELOW HERO)
           ==================================================================== */}
      <section className="intro-strip">
        <span>
          Find the potential.
          <br />
          <b>We’ll help with the plan.</b>
        </span>
        <p>
          Start with a curated wholesale car. Get an expert opinion and a personalized
          road-ready quote before you make a decision.
        </p>
        <Link href={paths.publicInventory} className="intro-link glass-cta">
          <span>Explore inventory</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </Link>
      </section>

      {/* ====================================================================
           SECTION 2: 01 / FIND YOUR POTENTIAL (FEATURED CARS)
           ==================================================================== */}
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

      <FiveSteps />

      <GuideValue />

      {/* ====================================================================
           SECTION 5: 04 / PROOF, IN THE DETAILS (SAVINGS & EVIDENCE)
           ==================================================================== */}
      <section className="proof-section section" id="savings">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark">04 / PROOF, IN THE DETAILS</div>
            <h2>
              Real savings.
              <br />
              <em>The whole story.</em>
            </h2>
          </div>
          <p>
            Completed purchases should show the starting condition, finished result and
            total amount spent.
          </p>
        </div>

        <div className="proof-placeholder">
          <div className="proof-photos">
            <div className="photo-box">
              <span>BEFORE</span>
              <strong>
                Purchase photos
                <br />
                coming soon
              </strong>
            </div>
            <div className="photo-box">
              <span>AFTER</span>
              <strong>
                Road-ready photos
                <br />
                coming soon
              </strong>
            </div>
          </div>

          <div className="proof-copy">
            <span className="eyebrow dark">VERIFIED CASE STUDIES PENDING</span>
            <h3>No made-up success stories.</h3>
            <p>
              We’ll publish completed purchases with actual before-and-after photos, total
              spending and comparable market value once the records are available.
            </p>
            <Link href={paths.publicInventory} className="proof-link">
              <span>Explore the possibilities</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
           SECTION 6: 05 / PEOPLE BEHIND THE PROCESS (TRUST)
           ==================================================================== */}
      <section className="trust-section section" id="trust">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark">05 / PEOPLE BEHIND THE PROCESS</div>
            <h2>
              Know who’s
              <br />
              <em>on your side.</em>
            </h2>
          </div>
          <p>Meet the people helping you turn a wholesale opportunity into your next car.</p>
        </div>

        <div className="trust-grid">
          <div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h3>Business location</h3>
            <p>Full business address and service area will be added before launch.</p>
          </div>
          <div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h3>Your buying team</h3>
            <p>Verified team names, roles and photos are awaiting business details.</p>
          </div>
          <div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            </svg>
            <h3>Customer experiences</h3>
            <p>Real customer reviews will appear here once supplied and approved for publication.</p>
          </div>
        </div>

        <div className="contact-strip">
          <div>
            <b>Let’s talk about your next car.</b>
            <p>
              Business phone and email pending. You can submit a car-specific quote request
              today.
            </p>
          </div>
          <Link href={paths.publicInventory} className="btn-contact-choose glass-cta">
            <span>Choose a car</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ====================================================================
           SECTION 7: YOUR CO-PILOT (AI GUIDE)
           ==================================================================== */}
      <section className="guide-section section">
        <div className="guide-orb-wrap">
          <div className="guide-orb">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
            <span>YOUR CO-PILOT</span>
          </div>
        </div>

        <div className="guide-copy">
          <div className="eyebrow dark">A GREAT PLACE TO START</div>
          <h2>
            Questions?
            <br />
            <em>Ask us.</em>
          </h2>
          <p>
            Understand clean titles, narrow your choices and start a quote request for a car
            you like.
          </p>
          <button
            type="button"
            className="btn-guide-ask"
            onClick={handleHeroAskAiClick}
            aria-label="Ask FairSales"
          >
            <span>Ask us</span>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
          </button>
        </div>

        <div className="guide-suggestions">
          <button
            type="button"
            onClick={() => copilotRef.current?.ask("Help me find a car under $20,000.")}
          >
            <span>Help me find a car under $20,000.</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => copilotRef.current?.ask("What does clean title mean?")}
          >
            <span>What does clean title mean?</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => copilotRef.current?.ask("How do I request a road-ready quote?")}
          >
            <span>How do I request a road-ready quote?</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </button>
          <small>Guided preview · live AI connection pending</small>
        </div>
      </section>

      {/* ====================================================================
           SECTION 8: FAQ ACCORDION (CLEAR ANSWERS)
           ==================================================================== */}
      <section className="faq-section section" id="faq">
        <div>
          <div className="eyebrow dark">BEFORE YOU TAKE THE WHEEL</div>
          <h2>
            Clear answers.
            <em>No surprises.</em>
          </h2>
        </div>

        <div className="faq-accordion-list">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = !!openFaqs[idx];
            return (
              <div key={idx} className={`faq-row ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={`faq-chevron ${isOpen ? "rotated" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {isOpen && <p className="faq-answer-text">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
           SECTION 9: FINAL CTA
           ==================================================================== */}
      <section className="final-cta">
        <span>THE ROAD AHEAD IS YOURS.</span>
        <h2>
          Find your <em>next car.</em>
        </h2>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginTop: "24px" }}>
          <Link href={paths.signUp} className="btn-claude-primary">
            <span>Create Free Account</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </Link>
          <Link href={paths.publicInventory} className="btn-final-cta glass-cta glass-cta-on-dark" style={{ margin: 0 }}>
            <span>Browse Cars</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ====================================================================
           SECTION 10: MINIMALIST FOOTER
           ==================================================================== */}
      <footer className="site-footer">
        <Link href="/" className="footer-logo" aria-label="FairSales Home">
          <BrandWordmark size="display" />
        </Link>
        <p>A smarter way from potential to pavement.</p>
        <div className="footer-links">
          <button type="button">Privacy</button>
          <button type="button">Terms</button>
          <span>© 2026 FairSales</span>
        </div>
      </footer>

      {/* ====================================================================
           FULL COPILOT DRAWER (AI Vehicle Advisor with Live Search & Bedrock AI)
           ==================================================================== */}
      <CopilotDrawer
        ref={copilotRef}
        publicDock
        hideUntilScroll
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onOpen={() => setIsCopilotOpen(true)}
      />
    </div>
  );
}

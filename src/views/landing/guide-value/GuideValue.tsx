"use client";

import { useEffect, useRef, useState } from "react";
import "./guide-value.css";

const GUIDES = [
  {
    num: "01",
    kicker: "Evaluation",
    title: "Expert evaluation",
    body: "A practical opinion on condition, repair scope and purchase potential.",
    meta: "Condition Clarity",
    detail: "Inspection \u2022 Auction Audit",
  },
  {
    num: "02",
    kicker: "Access",
    title: "Wholesale access",
    body: "Help navigating wholesale opportunities and buying through us.",
    meta: "Licensed Purchasing",
    detail: "Direct Dealer Access",
  },
  {
    num: "03",
    kicker: "Shipping",
    title: "Shipping help",
    body: "Guidance arranging transport to the right destination.",
    meta: "Seamless Dispatch",
    detail: "Port & Trucking Coordinated",
  },
  {
    num: "04",
    kicker: "Repairs",
    title: "Repair guidance",
    body: "Support understanding estimates, repair options and next steps.",
    meta: "Estimate Control",
    detail: "Scope & Parts Sourcing",
  },
  {
    num: "05",
    kicker: "Registration",
    title: "Registration support",
    body: "Help navigating the documents and local registration process.",
    meta: "Title Finality",
    detail: "Clear Paperwork & DMV",
  },
] as const;

const LAST = GUIDES.length - 1;

export function GuideValue() {
  const stageRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target = 0;
    let smooth = 0;
    let frame = 0;

    const tick = () => {
      const rect = stage.getBoundingClientRect();
      const dist = stage.offsetHeight - window.innerHeight;
      if (dist > 0) target = Math.max(0, Math.min(1, -rect.top / dist));

      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const lerpSpeed = isMobile ? 0.22 : 0.12;
      smooth += (target - smooth) * lerpSpeed;
      if (Math.abs(target - smooth) < 0.0005) smooth = target;

      const stepPos = smooth * LAST;
      const nextActive = Math.min(LAST, Math.max(0, Math.round(stepPos)));
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }

      const cards = [...track.querySelectorAll<HTMLElement>(".guide-value-card")];
      const first = cards[0];
      const second = cards[1];
      const width = first?.offsetWidth ?? 460;
      const pitch = first && second ? second.offsetLeft - first.offsetLeft : width + 72;
      track.style.transform = `translate3d(${-width / 2 - stepPos * pitch}px, 0, 0)`;

      cards.forEach((item, index) => {
        const distance = Math.abs(index - stepPos);
        const influence = Math.max(0, 1 - distance);
        item.style.transform = `scale(${0.96 + influence * 0.04})`;
        item.style.opacity = String(0.55 + influence * 0.45);
        item.style.zIndex = String(distance < 0.5 ? 3 : 1);
      });

      if (fillRef.current) fillRef.current.style.width = `${20 + smooth * 80}%`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const scrollToStep = (index: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dist = stage.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: stage.offsetTop + (index / LAST) * Math.max(dist, 0),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const current = GUIDES[active];

  return (
    <section className="guide-value" ref={stageRef} aria-label="The value of a guide">
      <div className="guide-value-pin">
        <header className="guide-value-copy section-heading">
          <div>
            <div className="eyebrow dark">03 / THE VALUE OF A GUIDE</div>
            <h2>
              More than access.
              <br />
              <em>A plan you understand.</em>
            </h2>
          </div>
          <p>Wholesale buying has moving parts. We help you make informed choices at each step.</p>
        </header>

        <div className="guide-value-viewport">
          <div className="guide-value-track" ref={trackRef}>
            {GUIDES.map((step, index) => (
              <article
                key={step.num}
                className={`guide-value-card${index === active ? " is-focal" : ""}`}
                tabIndex={0}
                onClick={() => scrollToStep(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    scrollToStep(index);
                  }
                }}
              >
                <div>
                  <span>
                    {step.num} / {step.kicker}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
                <div className="guide-value-foot">
                  <span>{step.meta}</span>
                  <span>{step.detail}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="guide-value-hud" aria-live="polite">
          <span>
            {current.num} / 05
          </span>
          <div className="guide-value-meter">
            <span ref={fillRef} />
          </div>
          <span>{current.title}</span>
        </div>
      </div>
    </section>
  );
}

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
  const mobileProgressRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target = 0;
    let smooth = 0;
    let frame = 0;
    let touchStartY = 0;
    let touchStartX = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
      const isMobile = window.innerWidth < 900;
      if (!isMobile) return;
      const stageEl = stageRef.current;
      if (!stageEl) return;

      const headerOffset = 72;
      const lockScrollY = Math.round(stageEl.offsetTop - headerOffset);
      const currentScrollY = Math.round(window.scrollY);

      const deltaY = touchStartY - e.touches[0].clientY;
      const deltaX = touchStartX - e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;

      // Horizontal swipe directly on cards
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 4) {
        if (deltaX > 0 && mobileProgressRef.current < 1) {
          mobileProgressRef.current = Math.min(1, mobileProgressRef.current + 0.25);
        } else if (deltaX < 0 && mobileProgressRef.current > 0) {
          mobileProgressRef.current = Math.max(0, mobileProgressRef.current - 0.25);
        }
        return;
      }

      // Check if user is at or past lock point
      const isAtLock = Math.abs(currentScrollY - lockScrollY) <= 12;

      // When scroll animation starts (deltaY > 0 moving down):
      // DO NOT MOVE THE PAGE while animation is running (mobileProgress < 1)!
      if ((isAtLock || currentScrollY >= lockScrollY) && deltaY > 0 && mobileProgressRef.current < 1) {
        if (e.cancelable) e.preventDefault();
        window.scrollTo(0, lockScrollY);
        // Slower animation: 1100px total scroll needed
        mobileProgressRef.current = Math.min(1, mobileProgressRef.current + deltaY / 1100);
        return;
      }

      // When scrolling back up (deltaY < 0 moving up):
      // DO NOT MOVE THE PAGE while reverse animation is running (mobileProgress > 0)!
      if ((isAtLock || currentScrollY <= lockScrollY) && deltaY < 0 && mobileProgressRef.current > 0) {
        if (e.cancelable) e.preventDefault();
        window.scrollTo(0, lockScrollY);
        mobileProgressRef.current = Math.max(0, mobileProgressRef.current + deltaY / 1100);
        return;
      }
    };

    const onWheel = (e: WheelEvent) => {
      const isMobile = window.innerWidth < 900;
      if (!isMobile) return;
      const stageEl = stageRef.current;
      if (!stageEl) return;

      const headerOffset = 72;
      const lockScrollY = Math.round(stageEl.offsetTop - headerOffset);
      const currentScrollY = Math.round(window.scrollY);
      const isAtLock = Math.abs(currentScrollY - lockScrollY) <= 12;

      if ((isAtLock || currentScrollY >= lockScrollY) && e.deltaY > 0 && mobileProgressRef.current < 1) {
        e.preventDefault();
        window.scrollTo(0, lockScrollY);
        mobileProgressRef.current = Math.min(1, mobileProgressRef.current + e.deltaY / 1100);
      } else if ((isAtLock || currentScrollY <= lockScrollY) && e.deltaY < 0 && mobileProgressRef.current > 0) {
        e.preventDefault();
        window.scrollTo(0, lockScrollY);
        mobileProgressRef.current = Math.max(0, mobileProgressRef.current + e.deltaY / 1100);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("wheel", onWheel, { passive: false });

    const tick = () => {
      const stageEl = stageRef.current;
      const trackEl = trackRef.current;
      if (!stageEl || !trackEl) return;
      const rect = stageEl.getBoundingClientRect();
      const isMobile = typeof window !== "undefined" && window.innerWidth < 900;

      if (isMobile) {
        const headerOffset = 72;
        const lockScrollY = Math.round(stageEl.offsetTop - headerOffset);
        const currentScrollY = Math.round(window.scrollY);

        if (currentScrollY < lockScrollY - 14) {
          // Strictly above lock point -> hold firmly at Step 01
          mobileProgressRef.current = 0;
          target = 0;
          smooth = 0;
        } else if (currentScrollY > lockScrollY + 14 && mobileProgressRef.current >= 1) {
          // Animation finished and page moved past lock point -> complete at 1
          target = 1;
        } else {
          // Inside animation region: FREEZE PAGE POSITION at lockScrollY until finished!
          if (mobileProgressRef.current < 1 && Math.abs(currentScrollY - lockScrollY) > 0 && currentScrollY >= lockScrollY - 6) {
            window.scrollTo(0, lockScrollY);
          }
          target = mobileProgressRef.current;
        }
      } else {
        const dist = Math.max(1, stageEl.offsetHeight - window.innerHeight);
        target = Math.max(0, Math.min(1, -rect.top / dist));
      }

      // Slower, calmer, more luxurious glide
      const lerpSpeed = 0.08;
      smooth += (target - smooth) * lerpSpeed;
      if (Math.abs(target - smooth) < 0.0005) smooth = target;

      const stepPos = smooth * LAST;
      const nextActive = Math.min(LAST, Math.max(0, Math.round(stepPos)));
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }

      const cards = [...trackEl.querySelectorAll<HTMLElement>(".guide-value-card")];
      const first = cards[0];
      const second = cards[1];
      const width = first?.offsetWidth ?? 460;
      const pitch = first && second ? second.offsetLeft - first.offsetLeft : width + 72;
      trackEl.style.transform = `translate3d(${-width / 2 - stepPos * pitch}px, 0, 0)`;

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
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  const scrollToStep = (index: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 900;
    if (isMobile) {
      const headerOffset = 72;
      mobileProgressRef.current = index / LAST;
      setActive(index);
      activeRef.current = index;
      window.scrollTo({
        top: stage.offsetTop - headerOffset,
        behavior: reduce ? "auto" : "smooth",
      });
    } else {
      const dist = Math.max(1, stage.offsetHeight - window.innerHeight);
      window.scrollTo({
        top: stage.offsetTop + (index / LAST) * dist,
        behavior: reduce ? "auto" : "smooth",
      });
    }
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
          <span className="guide-value-hud-num">{current.num}&nbsp;/&nbsp;05</span>
          <div className="guide-value-meter">
            <span ref={fillRef} />
          </div>
          <span className="guide-value-hud-title">{current.title}</span>
        </div>
      </div>
    </section>
  );
}

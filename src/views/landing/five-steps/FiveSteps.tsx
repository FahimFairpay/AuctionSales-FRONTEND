"use client";

import { useEffect, useRef, useState } from "react";
import "./five-steps.css";

const STEPS = [
  {
    num: "01",
    title: "Find your car",
    body: "Choose from our curated wholesale cars.",
  },
  {
    num: "02",
    title: "Get expert advice",
    body: "Understand the damage, potential and estimated costs.",
  },
  {
    num: "03",
    title: "Buy through us",
    body: "Get help purchasing your chosen wholesale car.",
  },
  {
    num: "04",
    title: "Get road-ready",
    body: "We guide shipping, repairs and registration.",
  },
  {
    num: "05",
    title: "Enjoy the ride",
    body: "Drive the car you wanted at the right price.",
  },
] as const;

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

export function FiveSteps() {
  const [active, setActive] = useState(0);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 900px)");
    if (reduce.matches) return;

    let frame = 0;
    const activeNow = { current: 0 };
    const visuals = STEPS.map(() => ({ blur: 3, opacity: 0.72, scale: 0.99 }));

    const tick = () => {
      const cards = cardsRef.current.filter((card): card is HTMLElement => card !== null);
      const center = window.innerHeight * 0.5;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - center);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
        const isNarrow = window.innerWidth <= 900 || narrow.matches;
        if (isNarrow) {
          card.style.filter = "none";
          const isFocal = distance < 180;
          card.style.opacity = isFocal ? "1" : "0.75";
          card.style.transform = "none";
          card.style.width = "100%";
          card.style.maxWidth = "100%";
          return;
        }

        const range = Math.max(rect.height + 220, window.innerHeight * 0.55);
        const eased = smoothstep(distance / range);
        const visual = visuals[index];
        visual.blur += (eased * 3 - visual.blur) * 0.1;
        visual.opacity += (1 - eased * 0.28 - visual.opacity) * 0.1;
        visual.scale += (1.01 - eased * 0.02 - visual.scale) * 0.1;
        card.style.filter = visual.blur < 0.2 ? "none" : `blur(${visual.blur.toFixed(2)}px)`;
        card.style.opacity = visual.opacity.toFixed(3);
        card.style.transform = `scale(${visual.scale.toFixed(3)})`;
      });

      if (bestIndex !== activeNow.current) {
        activeNow.current = bestIndex;
        setActive(bestIndex);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const scrollToStep = (index: number) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cardsRef.current[index]?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <section className="five-steps-split" id="journey" aria-label="Your five steps">
      <div className="five-steps-grid">
        <header className="five-steps-sticky">
          <span className="five-steps-eyebrow">02 / YOUR FIVE STEPS</span>
          <h2>
            From a good find
            <br />
            <em>to a great drive.</em>
          </h2>
          <p>One clear path. Expert support. You stay in control of the purchase.</p>
          <nav className="five-steps-pills" aria-label="Step navigation">
            {STEPS.map((step, index) => (
              <div key={step.num} className="five-steps-pill-wrap">
                {index > 0 ? (
                  <span
                    className={`five-steps-connector${index <= active ? " is-lit" : ""}`}
                    aria-hidden="true"
                  />
                ) : null}
                <button
                  type="button"
                  className={`five-steps-pill${index === active ? " is-active" : ""}`}
                  aria-current={index === active ? "step" : undefined}
                  onClick={() => scrollToStep(index)}
                >
                  <span>{step.num}</span>
                  {step.title}
                </button>
              </div>
            ))}
          </nav>
        </header>

        <div className="five-steps-flow">
          {STEPS.map((step, index) => (
            <article
              key={step.num}
              ref={(node) => {
                cardsRef.current[index] = node;
              }}
              className={`five-steps-card${index === active ? " is-active" : ""}`}
              data-flow={index}
              tabIndex={0}
              onClick={() => scrollToStep(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  scrollToStep(index);
                }
              }}
            >
              <span>{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

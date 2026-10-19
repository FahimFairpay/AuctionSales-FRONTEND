"use client";

import { useState } from "react";

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

export function LandingFaq() {
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});
  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
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
  );
}

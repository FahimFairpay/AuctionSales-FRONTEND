"use client";

import React from "react";

export function TermsOfServiceContent() {
  return (
    <div className="space-y-4 text-xs leading-relaxed text-stone-300">
      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          1. Wholesale Brokerage & Bidding Representation
        </h4>
        <p>
          FairSales operates as a wholesale vehicle brokerage providing qualified commercial buyers with access to live salvage, insurance, and pre-auction inventory from major auction houses (including IAAI and Copart). All vehicle listings and inventory representations are subject to live auction availability.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          2. As-Is / Where-Is Salvage Vehicle Disclaimers
        </h4>
        <p>
          All salvage, insurance total loss, hail-damaged, repossessed, or fleet-disposed vehicles are offered strictly <strong>"AS-IS, WHERE-IS"</strong> with no warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, or roadworthiness. Auction title classifications (Clean, Salvage, Non-Repairable, Rebuilt, Bill of Sale) are derived from auction yard intake documents. Buyers are solely responsible for conducting independent VIN history reviews, physical lot inspections, and state titling verifications prior to placing bids.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          3. Binding Bidding Commitments & Hammer Price
        </h4>
        <p>
          When you submit a bid authorization or request proxy representation through the FairSales platform, your submission represents a binding, irrevocable commitment to purchase the subject vehicle at or below your designated maximum hammer price, plus applicable auction transaction fees, gate fees, platform brokerage fees, and freight charges.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          4. Payment Timelines & Default
        </h4>
        <p>
          In accordance with wholesale auction house rules, all winning bids must be satisfied in full via bank wire transfer or certified commercial funds within two (2) business days of lot award. Failure to deliver timely cleared funds constitutes commercial default, forfeiting any deposits and incurring storage and restocking fees.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          5. Mandatory Phone Contact Authorization
        </h4>
        <p>
          Because auction lane execution occurs in real time, you explicitly authorize FairSales sales desks and licensed bidding agents to contact your registered US telephone number via direct voice call and SMS regarding lot status, hammer limits, and pre-auction lane instructions.
        </p>
      </section>
    </div>
  );
}

"use client";

import React from "react";

export function PrivacyPolicyContent() {
  return (
    <div className="space-y-4 text-xs leading-relaxed text-stone-300">
      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          1. Information We Collect
        </h4>
        <p>
          FairSales collects commercial identity and contact information including your full legal name, business email address, verified United States mobile telephone number, company dealership affiliation, vehicle search queries, favorited lots, and bidding request records.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          2. Purpose of Processing & Lead Verification
        </h4>
        <p>
          Your information is utilized strictly to provide access to pre-auction salvage inventory, verify commercial buyer identity, prevent fraudulent bidding activity, broker auction lot transactions, calculate automated repair and value estimates, and facilitate urgent outbound phone communications from our wholesale bidding desk.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          3. Information Sharing with Auction Venues
        </h4>
        <p>
          To complete vehicle acquisitions and register buyer credentials, we share necessary purchaser identity and state dealer registration documents exclusively with authorized salvage auction clearinghouses (e.g., Insurance Auto Auctions, Inc., Copart Inc.) and bonded automotive logistics carriers. We never sell commercial buyer contact records to third-party consumer advertisers.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          4. Website Measurement
        </h4>
        <p>
          FairSales uses Google Analytics to measure visits, pages, and how visitors move through the public pages. Google may set cookies named _ga and _ga_X1PJW54Z33 for that measurement. The tag does not receive your name, email address, or phone number. Buyer contact records are not sold to third-party advertisers.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-sm text-stone-100 mb-1">
          5. Security of Credentials
        </h4>
        <p>
          Account access is secured by AWS Cognito identity infrastructure with cryptographically enforced SRP (Secure Remote Password) protocol and encrypted sessions. Passwords are never stored in plain text or transmitted unencrypted.
        </p>
      </section>
    </div>
  );
}

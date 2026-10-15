"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { MatchedVehicle } from "../../api/copilot";
import { Link, useNavigate } from "@/compat/router";
import { paths } from "../../routes/paths";
import { getCurrentUser } from "../../auth/session";
import { useFavorites } from "../../features/inventory/useFavorites";
import { ImageGallery } from "../../features/inventory/ImageGallery";
import { expandVisImages, type VisCandidate } from "../../features/inventory/visImages";
import { markChatNavigating } from "./useCopilotChat";
import { AuthPromptModal } from "./AuthPromptModal";

// Formats auction date & time as requested: "Tue Oct 06, 9:30am"
export function formatCrispAuctionDateTime(dateVal?: string, timeVal?: string, dateTimeVal?: string): string {
  const combined = dateTimeVal || dateVal || "";
  const trimmed = combined.trim();
  if (!trimmed || trimmed.toLowerCase().includes("upcoming")) return "Upcoming";

  // 1. Strip timezone suffix like "CDT", "EDT", "PDT", "CST", "EST", "PST", "MST", "UTC", "GMT", etc.
  const cleaned = trimmed
    .replace(/\s+(?:CDT|EDT|PDT|MDT|CST|EST|PST|MST|UTC|GMT|[A-Z]{3,4})\s*$/i, "")
    .trim();

  // 2. Direct match for IAAI style: 'Tue Oct 06, 9:30am', 'Tue Oct 6, 9:30 AM', 'Tue Oct 06 9:30am'
  const iaaiMatch = cleaned.match(
    /^([A-Za-z]{3})\s+([A-Za-z]{3})\s+(\d{1,2})(?:,\s*|\s+)(\d{1,2}(?::\d{2})?)\s*([AaPp][Mm])?$/i
  );
  if (iaaiMatch) {
    const [, wday, mon, day, timeDigits, ampm] = iaaiMatch;
    const formattedDay = day.padStart(2, "0");
    const capitalizedWday = wday.charAt(0).toUpperCase() + wday.slice(1, 3).toLowerCase();
    const capitalizedMon = mon.charAt(0).toUpperCase() + mon.slice(1, 3).toLowerCase();
    let timeStr = timeDigits;
    if (ampm) {
      timeStr = `${timeDigits}${ampm.toLowerCase()}`;
    }
    return `${capitalizedWday} ${capitalizedMon} ${formattedDay}, ${timeStr}`;
  }

  // 3. Match 'Day Mon DD' without time
  const dayMonMatch = cleaned.match(/^([A-Za-z]{3})\s+([A-Za-z]{3})\s+(\d{1,2})$/i);
  if (dayMonMatch) {
    const [, wday, mon, day] = dayMonMatch;
    const formattedDay = day.padStart(2, "0");
    const capitalizedWday = wday.charAt(0).toUpperCase() + wday.slice(1, 3).toLowerCase();
    const capitalizedMon = mon.charAt(0).toUpperCase() + mon.slice(1, 3).toLowerCase();
    if (timeVal) {
      const cleanTime = timeVal.trim().toLowerCase().replace(/\s+/g, "");
      return `${capitalizedWday} ${capitalizedMon} ${formattedDay}, ${cleanTime}`;
    }
    return `${capitalizedWday} ${capitalizedMon} ${formattedDay}`;
  }

  // 4. Handle "Tomorrow" / "Today"
  if (cleaned.toLowerCase().startsWith("tomorrow") || cleaned.toLowerCase().startsWith("today")) {
    const isTomorrow = cleaned.toLowerCase().startsWith("tomorrow");
    const target = new Date();
    if (isTomorrow) target.setDate(target.getDate() + 1);
    const weekday = target.toLocaleDateString("en-US", { weekday: "short" });
    const month = target.toLocaleDateString("en-US", { month: "short" });
    const day = String(target.getDate()).padStart(2, "0");
    let extractedTime = timeVal ? timeVal.trim().toLowerCase().replace(/\s+/g, "") : "";
    const timeMatch = cleaned.match(/(\d{1,2}(?::\d{2})?\s*[AaPp][Mm])/i);
    if (!extractedTime && timeMatch) {
      extractedTime = timeMatch[1].toLowerCase().replace(/\s+/g, "");
    }
    return extractedTime ? `${weekday} ${month} ${day}, ${extractedTime}` : `${weekday} ${month} ${day}`;
  }

  // 5. Standard Date parse (ISO or 'MM/DD/YYYY HH:MM AM')
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000) {
    const weekday = parsed.toLocaleDateString("en-US", { weekday: "short" });
    const month = parsed.toLocaleDateString("en-US", { month: "short" });
    const day = String(parsed.getDate()).padStart(2, "0");
    let extractedTime = "";
    if (cleaned.includes("T") || cleaned.includes(":") || timeVal) {
      try {
        const rawTime = parsed.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        extractedTime = rawTime.replace(/\s*([AP]M)/i, (_, p) => p.toLowerCase());
      } catch {}
    }
    return extractedTime ? `${weekday} ${month} ${day}, ${extractedTime}` : `${weekday} ${month} ${day}`;
  }

  return cleaned;
}

export function formatCrispYard(branchOrLocation?: string): string {
  if (!branchOrLocation) return "Online";
  const clean = branchOrLocation.split(",")[0].trim();
  return clean || "Online";
}

interface VehicleCardProps {
  vehicle: MatchedVehicle;
  index?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onViewGallery?: (vehicle: MatchedVehicle) => void;
  animate?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  index = 0,
  isExpanded: controlledExpanded,
  onToggleExpand,
  onViewGallery,
  animate = false,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  // Freeze the animate value at mount time. The parent may pass animate={false}
  // on subsequent renders (once it marks the card as "already animated"), but we
  // must NOT let that cancel a transition that is already in flight.
  const shouldAnimateRef = useRef(animate);
  const [settled, setSettled] = useState(!shouldAnimateRef.current);

  useEffect(() => {
    // Only run the flip animation if the card was mounted with animate=true.
    // Ignore any later prop changes to animate.
    if (!shouldAnimateRef.current) return;
    const timer = setTimeout(() => {
      setSettled(true);
    }, 60);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  const [activeTab, setActiveTab] = useState<"overview" | "salvage" | "condition">("overview");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // App-wide Interested / Favorites hook
  const favorites = useFavorites();
  const isInterested = favorites.isFavorite(vehicle.stockNumber);

  // Derived Title and Subtitle
  const makeModel = `${vehicle.year ? vehicle.year + " " : ""}${vehicle.make || ""} ${vehicle.model || ""}`.trim().toUpperCase() || `LOT #${vehicle.stockNumber}`;
  const trimSubtitle = `${vehicle.series || "Base"} • #${vehicle.stockNumber}`;

  // Valuation Spread calculations
  const bid = Number(vehicle.currentBid || 0);
  const acv = Number(vehicle.acv || 0);
  const calculatedSpread = acv > bid && bid > 0 ? acv - bid : vehicle.spread || 0;
  const spreadPct = acv > 0 && calculatedSpread > 0 
    ? `${Math.round((calculatedSpread / acv) * 100)}% under ACV`
    : vehicle.spreadPct || "";

  // Image resolution & VIS gallery candidates
  const heroImage = vehicle.imageUrl || vehicle.imageThumbnailUrl || (vehicle.imageUrls && vehicle.imageUrls[0]) || "";
  
  const shots = useMemo<VisCandidate[]>(() => {
    if (heroImage) {
      const expanded = expandVisImages(heroImage);
      if (expanded.length > 0) return expanded;
    }
    if (vehicle.imageUrls && vehicle.imageUrls.length > 0) {
      return vehicle.imageUrls.map((url, idx) => ({
        thumb: url,
        large: url,
        index: idx + 1,
        set: null,
      }));
    }
    if (heroImage) {
      return [{ thumb: heroImage, large: heroImage, index: 1, set: null }];
    }
    return [];
  }, [heroImage, vehicle.imageUrls]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If guest / unauthenticated: show dedicated Auth Prompt Modal instead of error toast
    if (!getCurrentUser()) {
      setAuthModalOpen(true);
      return;
    }

    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 300);
    try {
      await favorites.toggle(vehicle.stockNumber, {
        stockNumber: vehicle.stockNumber,
        title: makeModel,
        imageUrl: heroImage,
        branch: vehicle.branch || vehicle.location,
        currentBid: vehicle.currentBid,
        acv: vehicle.acv,
        primaryDamage: vehicle.primaryDamage,
      });
    } catch (err) {
      console.error("Failed to toggle interested status:", err);
    }
  };

  const navigate = useNavigate();
  const inventoryHref = (getCurrentUser() ? paths.inventoryItem : paths.publicInventoryItem)(
    vehicle.stockNumber,
  );

  const handleOpenGallery = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewGallery) {
      onViewGallery(vehicle);
    } else if (shots.length > 0) {
      setGalleryOpen(true);
    } else {
      markChatNavigating();
      navigate(inventoryHref);
    }
  };

  return (
    <>
      <article
        className={`copilot-public-bubble group relative flex flex-col shrink-0 w-[320px] overflow-hidden rounded-2xl border text-left select-none text-[#141413] dark:text-[#f7f6f2] hover:-translate-y-0.5 ${
          shouldAnimateRef.current ? "card-perspective-flip" : ""
        } ${settled ? "flip-settled" : "flip-initial"}`}
        style={{
          background: "var(--glass-card-bg)",
          border: "var(--glass-card-border)",
          backdropFilter: "blur(28px) saturate(190%)",
          WebkitBackdropFilter: "blur(28px) saturate(190%)",
          boxShadow: "var(--glass-card-shadow)",
          color: "var(--ink)",
          scrollSnapAlign: "start",
          transition: shouldAnimateRef.current
            ? undefined
            : "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s ease, transform 0.25s ease",
          transitionDelay: shouldAnimateRef.current ? `${index * 140}ms` : "0ms",
        }}
      >
        {/* ======================================================== */}
        {/* 1. NAME SECTION: Clickable Header (Expand / Collapse)     */}
        {/* ======================================================== */}
        <header
          onClick={toggleExpand}
          className="flex flex-col gap-0.5 px-3.5 py-2.5 border-b border-black/[0.06] dark:border-white/10 bg-white/25 dark:bg-white/[0.02] hover:bg-white/40 dark:hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center justify-between gap-2">
            <h4
              className="truncate text-[13px] font-bold tracking-tight text-[#141413] dark:text-[#f7f6f2]"
              title={makeModel}
            >
              {makeModel}
            </h4>

            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* Top-Right Quick Link Arrow (ONLY PRESENT WHEN COLLAPSED) */}
              {!isExpanded && (
                <Link
                  to={inventoryHref}
                  onClick={() => markChatNavigating()}
                  aria-label={`View ${makeModel} in inventory`}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.18] border border-black/10 dark:border-white/20 hover:border-black/20 dark:hover:border-white/40 text-[#141413] dark:text-[#f7f6f2] hover:text-black dark:hover:text-white transition-all shadow-xs cursor-pointer"
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              )}

              {/* Expand / Collapse Chevron Indicator */}
              <button
                type="button"
                onClick={toggleExpand}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse vehicle specs" : "Expand vehicle specs"}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] border border-black/10 dark:border-white/15 text-muted dark:text-[#9da3b4] hover:text-ink dark:hover:text-white transition-all cursor-pointer"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>

          {/* Subtitle: Same font, single row */}
          <p className="truncate text-[11.5px] font-medium text-[#475569] dark:text-[#9da3b4] tracking-tight">
            {trimSubtitle}
          </p>
        </header>

        {/* ======================================================== */}
        {/* 2. IMAGE SECTION: 142px (Always visible in both states)  */}
        {/* ======================================================== */}
        <div className="group/thumb relative h-[142px] w-full overflow-hidden bg-black/40">
          {heroImage ? (
            <img
              src={heroImage}
              alt={makeModel}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105 cursor-pointer"
              onClick={handleOpenGallery}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted dark:text-[#9da3b4]">
              🚗 No Auction Photos
            </div>
          )}

          {/* Interested / Favorite Heart Button Overlay */}
          <button
            type="button"
            onClick={handleFavorite}
            disabled={favorites.isPending}
            aria-pressed={isInterested}
            aria-label={
              isInterested
                ? `Remove stock #${vehicle.stockNumber} from interested`
                : `Mark stock #${vehicle.stockNumber} as interested`
            }
            title={
              isInterested
                ? "Interested (Admin notified to confirm bid)"
                : "Express interest (Notify team for bidding)"
            }
            className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full border transition-all cursor-pointer shadow-md ${
              isInterested
                ? "bg-[#c4673a]/25 border-[#c4673a]/50 text-[#c4673a] scale-105"
                : "bg-black/45 border-white/20 text-white/80 hover:bg-black/65 hover:text-white"
            }`}
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              className={`transition-transform duration-200 ${heartAnimating ? "scale-125" : ""} ${
                isInterested
                  ? "fill-[#c4673a] text-[#c4673a]"
                  : "fill-transparent stroke-current hover:stroke-[#c4673a]"
              }`}
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Stack Animation "All Images" Button Overlay */}
          {shots.length > 0 && (
            <button
              type="button"
              aria-label="All images"
              className="absolute bottom-2 right-2 z-10 inline-flex max-w-[calc(100%-0.5rem)] items-center justify-center rounded-full border border-white/20 bg-[#141413]/85 backdrop-blur-md text-white shadow-[0_4px_12px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out group-hover/thumb:w-auto group-hover/thumb:bg-accent h-7 w-7 group-hover/thumb:px-1.5 cursor-pointer"
              onClick={handleOpenGallery}
            >
              <span className="inline-flex shrink-0 items-center justify-center h-7 w-7">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 3l9 4.5-9 4.5L3 7.5 12 3z" strokeLinejoin="round" />
                  <path d="M3 12l9 4.5L21 12" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 16.5L12 21l9-4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="max-w-0 overflow-hidden font-semibold whitespace-nowrap opacity-0 transition-all duration-200 group-hover/thumb:max-w-24 group-hover/thumb:opacity-100 text-[11px] group-hover/thumb:ml-1 group-hover/thumb:mr-1">
                All Images
              </span>
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. EXPANDED ACCORDION: Circular Tabs + 12 Specs + CTA   */}
        {/* ======================================================== */}
        {isExpanded && (
          <div className="flex flex-col border-t border-black/[0.07] dark:border-white/10 animate-in fade-in duration-200">
            {/* Circular Edge Glass Tabs Bar (Overview | Salvage | Condition) */}
            <div className="px-3 pt-2.5 pb-1">
              <div className="flex items-center gap-1 p-1 rounded-full border border-black/[0.06] dark:border-white/10 bg-black/[0.03] dark:bg-black/35 backdrop-blur-md shadow-inner">
                {(["overview", "salvage", "condition"] as const).map((tabKey) => {
                  const isActive = activeTab === tabKey;
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setActiveTab(tabKey)}
                      className={`flex-1 py-1.5 px-3 rounded-full text-[11px] font-medium transition-all capitalize cursor-pointer text-center ${
                        isActive
                          ? "bg-white/80 dark:bg-white/[0.18] text-[#141413] dark:text-white font-semibold border border-white/85 dark:border-white/25 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.45)]"
                          : "text-[#64748b] dark:text-[#9ba1b2] hover:text-[#141413] dark:hover:text-white hover:bg-black/[0.025] dark:hover:bg-white/[0.06]"
                      }`}
                      style={
                        isActive
                          ? {
                              backdropFilter: "blur(14px)",
                              WebkitBackdropFilter: "blur(14px)",
                            }
                          : {}
                      }
                    >
                      {tabKey}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 12 Spec Rows (4 per tab) - Uniform Calm Typography */}
            <div className="flex flex-col gap-1.5 p-3 min-h-[110px]">
              {activeTab === "overview" && (
                <>
                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-black/[0.07] dark:border-white/10">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">
                      {vehicle.hasActiveBids ? "Current Bid" : "Opening Bid"}
                    </span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right">
                      ${bid.toLocaleString()} {vehicle.hasActiveBids === false ? "(Pre-Bid)" : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-black/[0.07] dark:border-white/10">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Est. ACV</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right">
                      ${acv.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-black/[0.07] dark:border-white/10">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Arbitrage Spread</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right">
                      {calculatedSpread > 0
                        ? `+$${calculatedSpread.toLocaleString()} (${spreadPct})`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11.5px]">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5] shrink-0">Date & Yard</span>
                    <span
                      className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right truncate text-[11px]"
                      title={`${vehicle.auctionDate || vehicle.auctionDateTime || "Upcoming"} • ${vehicle.branch || vehicle.location || "Online"}`}
                    >
                      {formatCrispAuctionDateTime(vehicle.auctionDate, vehicle.auctionTime, vehicle.auctionDateTime)} • {formatCrispYard(vehicle.branch || vehicle.location)}
                    </span>
                  </div>
                </>
              )}

              {activeTab === "salvage" && (
                <>
                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-black/[0.07] dark:border-white/10">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Primary Damage</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right">
                      {vehicle.primaryDamage || "Normal Wear"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-black/[0.07] dark:border-white/10">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Secondary Damage</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right">
                      {vehicle.secondaryDamage || "None"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-black/[0.07] dark:border-white/10">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Title / Document</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right truncate max-w-[170px]" title={vehicle.titleDoc || vehicle.titleType || "Salvage Certificate"}>
                      {vehicle.titleDoc || vehicle.titleType || "Salvage Certificate"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px]">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Loss & Seller Type</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right truncate max-w-[170px]" title={`${vehicle.lossType || "Collision"} • ${vehicle.sellerType || "Insurance Co"}`}>
                      {vehicle.lossType || "Collision"} • {vehicle.sellerType || "Insurance Co"}
                    </span>
                  </div>
                </>
              )}

              {activeTab === "condition" && (
                <>
                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-black/[0.07] dark:border-white/10">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Score</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right">
                      {vehicle.vehicleScore || vehicle.score || 50} / 50
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-black/[0.07] dark:border-white/10">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Start Code & Key</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right">
                      {vehicle.startCode || vehicle.startStatus || "Run & Drive"} • {vehicle.keyStatus || "Key Present"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px] pb-1 border-b border-dashed border-black/[0.07] dark:border-white/10">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Odometer</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right">
                      {typeof vehicle.odometer === "number"
                        ? `${vehicle.odometer.toLocaleString()} mi`
                        : vehicle.odometer || "Verified Low"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11.5px]">
                    <span className="text-[11px] font-medium text-[#64748b] dark:text-[#8e94a5]">Airbags</span>
                    <span className="font-semibold text-[#141413] dark:text-[#f7f6f2] text-right">
                      {vehicle.airbags || "Intact (Not Deployed)"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action CTA: Circular Edges & Enhanced Glassmorphism */}
            <div className="p-3 pt-0">
              <Link
                to={inventoryHref}
                onClick={() => markChatNavigating()}
                className="group/btn relative flex items-center justify-center gap-2 w-full py-2.5 px-5 rounded-full text-xs font-semibold text-[#141413] dark:text-[#f7f6f2] hover:text-black dark:hover:text-white transition-all cursor-pointer whitespace-nowrap overflow-hidden border border-white/80 dark:border-white/20 border-t-white dark:border-t-white/40 bg-white/70 dark:bg-white/[0.08] hover:bg-white/90 dark:hover:bg-white/[0.15] shadow-[0_4px_14px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.50)] active:scale-[0.99]"
                style={{
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                }}
              >
                <span className="relative z-10">View Details</span>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative z-10 transition-transform duration-200 group-hover/btn:translate-x-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </article>

      {/* Lightbox Image Gallery Modal for vehicle photos */}
      {galleryOpen && shots.length > 0 && (
        <ImageGallery
          title={makeModel}
          candidates={shots}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {/* Auth Prompt Modal for unauthenticated visitors trying to save vehicle */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        stockNumber={vehicle.stockNumber}
      />
    </>
  );
};



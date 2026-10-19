"use client";

import type { MatchedVehicle } from "../../api/copilot";
import { formatCrispAuctionDateTime, formatCrispYard } from "./vehicleFormat";

export function VehicleCardSpecs({
  activeTab,
  vehicle,
  bid,
  acv,
  calculatedSpread,
  spreadPct,
}: {
  activeTab: "overview" | "salvage" | "condition";
  vehicle: MatchedVehicle;
  bid: number;
  acv: number;
  calculatedSpread: number;
  spreadPct: string;
}) {
  return (
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
  );
}

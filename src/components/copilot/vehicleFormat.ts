"use client";

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

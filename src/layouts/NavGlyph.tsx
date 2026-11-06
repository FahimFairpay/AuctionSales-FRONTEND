export function NavGlyph({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-5 w-5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": true as const,
  };
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "watchlists") {
    return (
      <svg {...common}>
        <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (name === "logs") {
    return (
      <svg {...common}>
        <path d="M3 12h4l2.5 7 5-14L17 12h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "account") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19.5c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="2.6" />
        <circle cx="16" cy="9" r="2.2" />
        <path d="M4 18c1.2-2.4 3.2-3.6 5.5-3.6 2 0 3.6.8 4.8 2.2M14 18c.6-1.2 1.6-1.8 2.8-1.8 1.4 0 2.5.7 3.2 1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "all") {
    return (
      <svg {...common}>
        <path d="M4 7h16v4.5H4zM4 13.5h16V18H4z" strokeLinejoin="round" />
        <path d="M8 9.25h3M8 15.75h5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "fail") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5M12 16.5v.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "inventory") {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 10h16M9 5v14" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "fairental") {
    return (
      <svg {...common}>
        <path d="M4 15.5 6.2 9.5h11.6L20 15.5" strokeLinejoin="round" />
        <path d="M6.5 15.5h11M7.5 18.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6ZM16.5 18.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "scrape") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5v2M12 17v2M5 12h2M17 12h2M7.2 7.2l1.4 1.4M15.4 15.4l1.4 1.4M7.2 16.8l1.4-1.4M15.4 8.6l1.4-1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "recipe") {
    return (
      <svg {...common}>
        <path d="M7 4h10v16H7z" strokeLinejoin="round" />
        <path d="M10 8h4M10 12h4M10 16h2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5M12 16.5v.5" strokeLinecap="round" />
    </svg>
  );
}

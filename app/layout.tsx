import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import "@/views/landing/landing.css";
import "@/views/landing/glass-cta.css";
import { Providers } from "./providers";
import { VisitorTracker } from "@/components/VisitorTracker";
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "FairPy Sales",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,500;1,8..60,600;1,8..60,700&display=swap"
          rel="stylesheet"
        />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {
              try {
                var isAuth =
                  window.location.pathname.startsWith('/sign-') ||
                  window.location.pathname.startsWith('/login') ||
                  window.location.pathname.startsWith('/new-password') ||
                  window.location.pathname.startsWith('/forgot-password');
                var isLanding = window.location.pathname === '/' || window.location.pathname === '';
                var userSelected = localStorage.getItem("fps-theme-selected") === "true";
                var stored = localStorage.getItem("fps-appearance");
                if (!userSelected || !stored) {
                  stored = "dark";
                }
                var dark =
                  isAuth ||
                  (isLanding && !userSelected) ||
                  stored === "dark" ||
                  (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
                document.documentElement.style.colorScheme = dark ? "dark" : "light";
                if (dark) {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (error) {}
            })();`,
          }}
        />
      </head>
      <body>
        <VisitorTracker />
        <Providers>{children}</Providers>
        {clarityProjectId ? <MicrosoftClarity projectId={clarityProjectId} /> : null}
        {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
      </body>
    </html>
  );
}

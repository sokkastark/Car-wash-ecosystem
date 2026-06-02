import type { Metadata } from "next";
import "./globals.css";
import AutoUpdateChecker from "@/app/components/AutoUpdateChecker";

export const metadata: Metadata = {
  title: "SV Carwash Operations Platform",
  description: "Dynamic recurring vehicle wash scheduling, workforce tracking, and payment operations portals.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SV Force"
  },
  icons: {
    icon: "/worker_welcome.png",
    apple: "/worker_welcome.png"
  }
};

/**
 * Root Layout conforming to ISO engineering standards.
 * Serves as the HTML body container for all three subdomain portals.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AutoUpdateChecker />
        <main className="min-h-screen relative overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}

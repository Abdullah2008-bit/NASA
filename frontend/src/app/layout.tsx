import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkyCast – NASA Space Apps Air Quality Intelligence",
    template: "%s | SkyCast",
  },
  description:
    "SkyCast: Real-time global air quality intelligence, NASA TEMPO insights, forecasting, anomaly detection and planetary visualization for NASA Space Apps 2025.",
  applicationName: "SkyCast",
  authors: [{ name: "SkyCast Team" }],
  keywords: [
    "NASA",
    "Space Apps",
    "Air Quality",
    "TEMPO",
    "Forecasting",
    "AQI",
    "Earth",
    "Environmental Intelligence",
  ],
  openGraph: {
    title: "SkyCast – NASA Space Apps Air Quality Intelligence",
    description:
      "Real-time global AQI, satellite fusion, anomaly detection and forecasting powered by NASA datasets.",
    url: "https://skycast.app",
    siteName: "SkyCast",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SkyCast – NASA Space Apps Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyCast – NASA Space Apps Air Quality Intelligence",
    description:
      "Global air quality intelligence with NASA TEMPO satellite data and advanced forecasting.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#050814" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>        
        {children}
      </body>
    </html>
  );
}

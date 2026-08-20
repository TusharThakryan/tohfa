import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const clashDisplay = localFont({
  src: [
    { path: "../public/fonts/ClashDisplay-Medium.woff2", weight: "500" },
    { path: "../public/fonts/ClashDisplay-Semibold.woff2", weight: "600" },
    { path: "../public/fonts/ClashDisplay-Bold.woff2", weight: "700" },
  ],
  variable: "--font-clash",
  display: "swap",
});

export const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Medium.woff2", weight: "500" },
    { path: "../public/fonts/Satoshi-Bold.woff2", weight: "700" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

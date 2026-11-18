import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Stinger from "@/components/motion/Stinger";
import MarkCursor from "@/components/motion/MarkCursor";
import "./globals.css";

// next/font downloads and self-hosts it at build time.
// Measured from the reference: Inter Display-style headlines at 800, Inter for text.
const display = Inter_Tight({ variable: "--font-display-face", subsets: ["latin"], weight: ["600", "700", "800"] });
const body = Inter({ variable: "--font-body-face", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meriity | Make trust visible · Melbourne growth partner",
  description:
    "You're not losing on price. You're losing on trust. Meriity is a Melbourne growth partner that makes every touchpoint of your business tell the same trusted story.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={`${display.variable} ${body.variable}`}>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body> before React loads. */}
      <body suppressHydrationWarning>
        <Stinger />
        <MarkCursor />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}

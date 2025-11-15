/**
 * @file Registers Geist font families for inclusion via next/font.
 */
import { Geist, Geist_Mono } from "next/font/google";

/**
 * Sans-serif font used for most UI text.
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Monospace variant used in telemetry readouts.
 */
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

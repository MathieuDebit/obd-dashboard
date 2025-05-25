import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Link from 'next/link'
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartLine, Navigation, Settings, Wrench } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OBD Dashboard Web",
  description: "Web dashboard for OBD data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-100`}
      >
        <div className="flex flex-row h-screen p-3">
          <div className="flex flex-col w-20 justify-around pr-3">
            <Link className="bg-stone-50 border rounded-lg h-full flex flex-1 justify-center items-center" href="/"><Navigation /></Link>
            <Link className="bg-stone-50 border rounded-lg h-full flex flex-1 justify-center items-center my-2" href="/commands"><ChartLine /></Link>
            <Link className="bg-stone-50 border rounded-lg h-full flex flex-1 justify-center items-center mb-2" href="/diagnostics"><Wrench /></Link>
            <Link className="bg-stone-50 border rounded-lg aspect-square flex flex-none justify-center items-center" href="/settings"><Settings /></Link>
          </div>

          <ScrollArea className="bg-white flex grow rounded-xl border p-4 overflow-hidden">
            {children}
          </ScrollArea>
        </div>
      </body>
    </html>
  );
}

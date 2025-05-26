import type { Metadata } from "next";
import { geistSans, geistMono } from "@/ui/fonts";
import { ScrollArea } from "@/ui/scroll-area";
import Nav from "@/ui/nav";
import '@/ui/css/globals.css';


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
          <Nav />

          <ScrollArea className="bg-white flex grow rounded-xl border p-4 overflow-hidden">
            {children}
          </ScrollArea>
        </div>
      </body>
    </html>
  );
}

'use client';

import { useContext, useEffect } from "react";
import { geistSans, geistMono } from "@/ui/fonts";
import { ScrollArea } from "@/ui/scroll-area";
import Nav from "@/ui/nav";
import { ThemeContext } from "@/app/ThemeContext";


export default function HTML({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useContext(ThemeContext);

  return (
    <html lang="en" className={theme}>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-muted`}
        >
            <div className="flex flex-row h-screen p-3">
            <Nav />

            <ScrollArea className="bg-background flex grow rounded-xl border p-4 overflow-hidden">
                {children}
            </ScrollArea>
            </div>
        </body>
    </html>
  );
}

'use client';

import type { PropsWithChildren } from "react";

import PerformanceProfiler from "@/components/dev/PerformanceProfiler";
import Nav from "@/ui/nav";
import { ScrollArea } from "@/ui/scroll-area";

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <PerformanceProfiler>
      <div className="flex h-screen flex-col p-3">
        <Nav />

        <ScrollArea className="bg-background flex grow overflow-hidden rounded-xl border p-4">
          {children}
        </ScrollArea>
      </div>
    </PerformanceProfiler>
  );
}

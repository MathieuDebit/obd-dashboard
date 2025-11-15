'use client';

import { PropsWithChildren } from "react";
import { ScrollArea } from "@/ui/scroll-area";
import Nav from "@/ui/nav";
import PerformanceProfiler from "@/components/dev/PerformanceProfiler";

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

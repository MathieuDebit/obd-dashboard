'use client';

/**
 * @file Declares the top-level application shell that wraps every page with
 * navigation, scrollable content area, and optional developer tooling overlays.
 */

import type { PropsWithChildren } from "react";

import PerformanceProfiler from "@/components/dev/PerformanceProfiler";
import Nav from "@/ui/nav";
import { ScrollArea } from "@/ui/scroll-area";

/**
 * AppShell renders the persistent navigation plus a scrollable viewport that
 * hosts page content while also enabling the optional performance profiler.
 *
 * @param props.children - Nested page nodes that should appear in the shell
 * layout.
 * @returns The shell layout tree shared by all pages.
 */
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

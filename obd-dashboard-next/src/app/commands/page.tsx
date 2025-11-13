'use client'

import { useState, useEffect, useMemo } from "react";
import useOBD from "@/hooks/useOBD";
import { ScrollArea } from "@/ui/scroll-area";
import { Markdown } from "@/components/Markdown";
import { ChartAreaStep } from "@/components/ChartAreaStep";
import { Info, X } from "lucide-react";
import { usePidHistory } from "@/store/pidHistory";

export default function CommandsPage() {
    const [currentTab, setCurrentTab] = useState<string | null>(null);
    const [infoPid, setInfoPid] = useState<string | null>(null);
    const { pids, error, isLoading } = useOBD();
    const pidHistory = usePidHistory(currentTab ?? null);

    useEffect(() => {
        if (!currentTab && pids.length > 0) {
            setCurrentTab(pids[0].pid);
        }
    }, [pids, currentTab]);

    const onPidSelect = (pid: string) => {
        setCurrentTab(pid);
    };

    const selectedPid = pids.find(({ pid }) => pid === currentTab);
    const chartData = useMemo(() => {
        if (!selectedPid || pidHistory.length === 0) {
            return [];
        }

        return pidHistory.map(({ timestamp, value }) => ({
            time: timestamp,
            value,
        }));
    }, [selectedPid?.pid, pidHistory]);

    const infoPidData = infoPid ? pids.find(({ pid }) => pid === infoPid) ?? null : null;

    if (error) {
        return <div>failed to load</div>
    }

    if (isLoading) {
        return <div>loading...</div>
    }

    return (
        <div className="absolute w-full h-full top-0 left-0 p-3">
            <div className="flex flex-col h-full gap-4">
                <ScrollArea className="w-full h-1/2">
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {pids.map(({ pid, name, value }) => {
                            const isActive = pid === currentTab;
                            return (
                                <button
                                    key={`pid-button-${pid}`}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => onPidSelect(pid)}
                                    className={`w-full rounded-md border p-3 text-left transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                                        isActive ? "border-primary bg-primary/5" : "border-muted"
                                    }`}
                                >
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{name}</div>
                                    <div className="text-2xl font-semibold">{value ?? "--"}</div>
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>

                <div className="flex-1 overflow-hidden">
                    {selectedPid ? (
                        <div className="relative h-full">
                            <button
                                type="button"
                                aria-label={`Show ${selectedPid.name} description`}
                                onClick={() => setInfoPid(selectedPid.pid)}
                                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-muted bg-background/80 text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            >
                                <Info className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <ChartAreaStep
                                title={selectedPid.name}
                                description={selectedPid.pid}
                                chartData={chartData}
                            />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            Select a PID to display its chart.
                        </div>
                    )}
                </div>
            </div>
            {infoPidData && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setInfoPid(null)}
                >
                    <div
                        className="relative w-full max-w-lg rounded-lg border border-muted bg-background p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            aria-label="Close description"
                            onClick={() => setInfoPid(null)}
                            className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <h2 className="text-lg font-semibold">{infoPidData.name}</h2>
                        <p className="text-sm text-muted-foreground">{infoPidData.pid}</p>
                        <ScrollArea className="mt-4 max-h-64">
                            <Markdown content={infoPidData.description || "No description provided for this PID yet."} />
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    );
}

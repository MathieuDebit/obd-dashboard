'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
import useOBD from "@/hooks/useOBD";
import { ScrollArea } from "@/ui/scroll-area";
import { Markdown } from "@/components/Markdown";
import { ChartAreaStep } from "@/components/ChartAreaStep";
import { Info, X } from "lucide-react";


const SERIES_LENGTH = 60;
const createEmptySeries = () =>
    Array.from({ length: SERIES_LENGTH }, () => ({ time: 0, value: 0 }));

export default function CommandsPage() {
    const [currentTab, setCurrentTab] = useState<string | null>(null);
    const [chartHistory, setChartHistory] = useState<Record<string, { time: number, value: number }[]>>({});
    const [infoPid, setInfoPid] = useState<string | null>(null);
    const { pids, error, isLoading } = useOBD();

    const updateChartData = useCallback((pid: string, value: number) => {
        setChartHistory(prev => {
            const prevSeries = prev[pid] ?? createEmptySeries();
            const nextSeries = [
                ...prevSeries.slice(1),
                { time: prevSeries[prevSeries.length - 1].time + 1, value }
            ];

            return {
                ...prev,
                [pid]: nextSeries,
            };
        });
    }, []);

    const currentPidRawValue = useMemo<number | null>(() => {
        if (!currentTab) return null;
        const currentPid = pids.find(p => p.pid === currentTab);
        return currentPid ? Number(currentPid.rawValue) : null;
    }, [pids, currentTab]);

    useEffect(() => {
        if (!currentTab) return;
        if (!(currentTab in chartHistory)) {
            setChartHistory(prev => ({
                ...prev,
                [currentTab]: createEmptySeries(),
            }));
        }
    }, [chartHistory, currentTab]);

    useEffect(() => {
        if (currentPidRawValue === null || !currentTab) return;
        updateChartData(currentTab, currentPidRawValue);
    }, [currentPidRawValue, currentTab, updateChartData]);

    useEffect(() => {
        setChartHistory(prev => {
            let changed = false;
            const next = { ...prev };
            pids.forEach(({ pid }) => {
                if (!next[pid]) {
                    next[pid] = createEmptySeries();
                    changed = true;
                }
            });
            return changed ? next : prev;
        });

        if (!currentTab && pids.length > 0) {
            setCurrentTab(pids[0].pid);
        }
    }, [pids, currentTab]);

    const onPidSelect = (pid: string) => {
        setCurrentTab(pid);
        setChartHistory(prev => ({
            ...prev,
            [pid]: prev[pid] ?? createEmptySeries(),
        }));
    };

    if (error) {
        return <div>failed to load</div>
    }

    if (isLoading) {
        return <div>loading...</div>
    }

    const selectedPid = pids.find(({ pid }) => pid === currentTab);
    const infoPidData = infoPid ? pids.find(({ pid }) => pid === infoPid) ?? null : null;

    return (
        <div className="absolute w-full h-full top-0 left-0 p-3">
            <div className="flex flex-col h-full gap-4">
                <ScrollArea className="w-full">
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
                                chartData={chartHistory[selectedPid.pid] ?? createEmptySeries()}
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

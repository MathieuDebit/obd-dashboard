'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
import useOBD from "@/hooks/useOBD";
import { ScrollArea } from "@/ui/scroll-area";
import { ChartAreaStep } from "@/components/ChartAreaStep";


const SERIES_LENGTH = 60;
const createEmptySeries = () =>
    Array.from({ length: SERIES_LENGTH }, () => ({ time: 0, value: 0 }));

export default function CommandsPage() {
    const [currentTab, setCurrentTab] = useState<string | null>(null);
    const [chartHistory, setChartHistory] = useState<Record<string, { time: number, value: number }[]>>({});
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
                                    className={`rounded-md border p-3 text-left transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
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
                        <ChartAreaStep
                            title={selectedPid.name}
                            description={selectedPid.pid}
                            chartData={chartHistory[selectedPid.pid] ?? createEmptySeries()}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            Select a PID to display its chart.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

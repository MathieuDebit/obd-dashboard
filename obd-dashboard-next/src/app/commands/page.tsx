'use client'

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import useOBD from "@/hooks/useOBD";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Card, CardContent } from "@/ui/card";
import { ScrollArea } from "@/ui/scroll-area";
import { Markdown } from '@/components/Markdown'
import { ChartAreaStep } from "@/components/ChartAreaStep";


const SERIES_LENGTH = 60;
const createEmptySeries = () =>
    Array.from({ length: SERIES_LENGTH }, () => ({ time: 0, value: 0 }));

const CardDescription = memo(({ description }: { description: string }) => {
        return (
            <Card className="mt-3">
                <CardContent>
                    <ScrollArea>
                        <Markdown content={description} />
                    </ScrollArea>
                </CardContent>
            </Card>
        )
    })

CardDescription.displayName = "CardDescription";

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

    const onTabChange = (tab: string) => {
        setCurrentTab(tab);
        setChartHistory(prev => ({
            ...prev,
            [tab]: prev[tab] ?? createEmptySeries(),
        }));
    };

    if (error) {
        return <div>failed to load</div>
    }

    if (isLoading) {
        return <div>loading...</div>
    }

    return (
        <div className="absolute w-full h-full top-0 left-0 p-3">
            <Tabs defaultValue="" className="flex flex-row overflow-hidden h-full" onValueChange={onTabChange}>
                <TabsList className="w-1/3 flex flex-col h-full">
                    <ScrollArea className="w-full h-full">
                        { pids.map(({ pid, name, value }) =>
                            <TabsTrigger key={`trigger-${pid}`} className="w-full flex justify-between" value={pid}>
                                <span>{ name }</span>
                                <span>{ value }</span>
                            </TabsTrigger>
                        )}
                    </ScrollArea>
                </TabsList>

                { pids.map(({ pid, name, description }) =>
                    <TabsContent key={`content-${pid}`} className="flex flex-col" value={pid}>
                        <ChartAreaStep title={name} description={pid} chartData={chartHistory[pid] ?? createEmptySeries()} />

                        <CardDescription description={description} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

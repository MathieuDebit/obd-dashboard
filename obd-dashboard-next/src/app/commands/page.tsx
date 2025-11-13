'use client'

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import useOBD from "@/hooks/useOBD";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Card, CardContent } from "@/ui/card";
import { ScrollArea } from "@/ui/scroll-area";
import { Markdown } from '@/components/Markdown'
import { ChartAreaStep } from "@/components/ChartAreaStep";


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
    const [chartData, setChartData] = useState(
        Array.from({ length:60 }, () => ({ time: 0, value: 0 }))
    );
    const { pids, error, isLoading } = useOBD();

    const updateChartData = useCallback((value: number) => {
        setChartData(prev => [
        ...prev.slice(1),
        { time: prev[prev.length - 1].time + 1, value }
        ]);
    }, []);

    const currentPidRawValue = useMemo<number | null>(() => {
        if (!currentTab) return null;
        const currentPid = pids.find(p => p.pid === currentTab);
        return currentPid ? Number(currentPid.rawValue) : null;
    }, [pids, currentTab]);

    useEffect(() => {
        if (currentPidRawValue === null) return;
        updateChartData(currentPidRawValue);
    }, [currentPidRawValue, updateChartData]);

    const onTabChange = (tab: string) => {
        setCurrentTab(tab);
        setChartData(Array.from({ length:60 }, () => ({ time: 0, value: 0 })));
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
                        <ChartAreaStep title={name} description={pid} chartData={chartData} />

                        <CardDescription description={description} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

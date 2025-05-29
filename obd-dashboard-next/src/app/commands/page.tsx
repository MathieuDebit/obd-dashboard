'use client'

import useOBD from "@/hooks/useOBD";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Card, CardContent } from "@/ui/card";
import { ScrollArea } from "@/ui/scroll-area";
import { Markdown } from '@/components/Markdown'

export default function CommandsPage() {
    const { pids, error, isLoading } = useOBD();

    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>

    return (
        <div className="absolute w-full h-full top-0 left-0 p-3">
            <Tabs defaultValue="" className="flex flex-row overflow-hidden h-full">
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

                { pids.map(({ pid, name, value, description }) =>
                    <TabsContent key={`content-${pid}`} className="" value={pid}>
                        <Card className="">
                            <CardContent className="">
                                <div className="text-xl font-bold pb-5">{pid}: {value}</div>
                                <Markdown content={description} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
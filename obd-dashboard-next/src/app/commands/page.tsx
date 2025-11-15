'use client';

import { Info, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/app/LanguageContext";
import { ChartAreaStep } from "@/components/ChartAreaStep";
import type { ChartSeriesConfig } from "@/components/ChartAreaStep";
import { Markdown } from "@/components/Markdown";
import { toPidKey } from "@/constants/pids";
import useOBD from "@/hooks/useOBD";
import { usePidHistory } from "@/store/pidHistory";
import { ScrollArea } from "@/ui/scroll-area";
import { translateUi } from "@/utils/i18n";

type CorrelationCardDefinition = {
    id: string;
    titleKey: string;
    descriptionKey: string;
    primaryPid: string;
    secondaryPid: string;
    primaryKey: string;
    secondaryKey: string;
    primaryLabelKey: string;
    secondaryLabelKey: string;
    primaryColor: string;
    secondaryColor: string;
    primaryUnit: string;
    secondaryUnit: string;
};

type LocalizedCorrelationCard = CorrelationCardDefinition & {
    title: string;
    description: string;
    primaryLabel: string;
    secondaryLabel: string;
};

const CORRELATION_CARD_DEFINITIONS: CorrelationCardDefinition[] = [
    {
        id: "rpm-speed",
        titleKey: "commands.card.rpm_speed.title",
        descriptionKey: "commands.card.rpm_speed.description",
        primaryPid: "RPM",
        secondaryPid: "SPEED",
        primaryKey: "engineRpm",
        secondaryKey: "vehicleSpeed",
        primaryLabelKey: "commands.card.rpm_speed.primary",
        secondaryLabelKey: "commands.card.rpm_speed.secondary",
        primaryColor: "#6366f1",
        secondaryColor: "#f97316",
        primaryUnit: "tr/min",
        secondaryUnit: "km/h",
    },
    {
        id: "throttle-load",
        titleKey: "commands.card.throttle_load.title",
        descriptionKey: "commands.card.throttle_load.description",
        primaryPid: "THROTTLE_POS",
        secondaryPid: "ENGINE_LOAD",
        primaryKey: "throttlePosition",
        secondaryKey: "engineLoad",
        primaryLabelKey: "commands.card.throttle_load.primary",
        secondaryLabelKey: "commands.card.throttle_load.secondary",
        primaryColor: "#14b8a6",
        secondaryColor: "#ef4444",
        primaryUnit: "%",
        secondaryUnit: "%",
    },
];

const mergeCorrelationData = (
    primary: { timestamp: number; value: number }[],
    secondary: { timestamp: number; value: number }[],
    primaryKey: string,
    secondaryKey: string,
) => {
    const points = new Map<number, { time: number; [key: string]: number }>();

    const addSamples = (samples: { timestamp: number; value: number }[], key: string) => {
        samples.forEach(({ timestamp, value }) => {
            const existing = points.get(timestamp) ?? { time: timestamp };
            existing[key] = value;
            points.set(timestamp, existing);
        });
    };

    addSamples(primary, primaryKey);
    addSamples(secondary, secondaryKey);

    return Array.from(points.values()).sort((a, b) => a.time - b.time);
};

const extractUnitFromValue = (value?: string | number | null) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    const match = trimmed.match(/[^\d\s.,-]+.*$/);
    if (!match) return undefined;
    const unit = match[0].trim();
    return unit.length > 0 ? unit : undefined;
};

export default function CommandsPage() {
    const [currentTab, setCurrentTab] = useState<string | null>(null);
    const [infoPid, setInfoPid] = useState<string | null>(null);
    const [selectedCorrelationId, setSelectedCorrelationId] = useState<string | null>(null);
    const { pids, error, isLoading } = useOBD();
    const { locale } = useLanguage();

    const correlationCards = useMemo<LocalizedCorrelationCard[]>(
        () =>
            CORRELATION_CARD_DEFINITIONS.map((card) => ({
                ...card,
                title: translateUi(card.titleKey, locale, card.titleKey),
                description: translateUi(card.descriptionKey, locale, card.descriptionKey),
                primaryLabel: translateUi(card.primaryLabelKey, locale, card.primaryLabelKey),
                secondaryLabel: translateUi(card.secondaryLabelKey, locale, card.secondaryLabelKey),
            })),
        [locale],
    );

    const selectedCorrelation = useMemo(
        () => correlationCards.find((card) => card.id === selectedCorrelationId) ?? null,
        [correlationCards, selectedCorrelationId],
    );

    const pidMap = useMemo(() => {
        const map = new Map<string, { name: string; description?: string }>();
        pids.forEach((pid) => map.set(toPidKey(pid.pid), { name: pid.name, description: pid.description }));
        return map;
    }, [pids]);

    const selectedPid = pids.find(({ pid }) => pid === currentTab) ?? null;
    const selectedPidUnit = useMemo(
        () => extractUnitFromValue(selectedPid?.value),
        [selectedPid?.value]
    );
    const singlePidHistory = usePidHistory(selectedPid?.pid ?? null);
    const correlationPrimaryHistory = usePidHistory(selectedCorrelation ? selectedCorrelation.primaryPid : null);
    const correlationSecondaryHistory = usePidHistory(selectedCorrelation ? selectedCorrelation.secondaryPid : null);

    useEffect(() => {
        if (!currentTab && pids.length > 0 && !selectedCorrelationId) {
            setCurrentTab(pids[0].pid);
        }
    }, [pids, currentTab, selectedCorrelationId]);

    useEffect(() => {
        if (!selectedPid) {
            setInfoPid(null);
        }
    }, [selectedPid]);

    const onPidSelect = (pid: string) => {
        setCurrentTab(pid);
        setSelectedCorrelationId(null);
    };

    const onCorrelationSelect = (id: string) => {
        setSelectedCorrelationId(id);
        setCurrentTab(null);
    };

    const {
        chartData,
        chartSeries,
        chartTitle,
        chartDescription,
        yAxisLeftUnit,
        yAxisRightUnit,
    }: {
        chartData: { time: number; [key: string]: number }[];
        chartSeries?: ChartSeriesConfig[];
        chartTitle?: string;
        chartDescription?: string;
        yAxisLeftUnit?: string;
        yAxisRightUnit?: string;
    } = useMemo(() => {
        if (selectedCorrelation) {
            const merged = mergeCorrelationData(
                correlationPrimaryHistory,
                correlationSecondaryHistory,
                selectedCorrelation.primaryKey,
                selectedCorrelation.secondaryKey,
            );

            const series: ChartSeriesConfig[] = [
                {
                    dataKey: selectedCorrelation.primaryKey,
                    name: selectedCorrelation.primaryLabel,
                    color: selectedCorrelation.primaryColor,
                    yAxisId: "left",
                    unit: selectedCorrelation.primaryUnit,
                },
                {
                    dataKey: selectedCorrelation.secondaryKey,
                    name: selectedCorrelation.secondaryLabel,
                    color: selectedCorrelation.secondaryColor,
                    yAxisId: "right",
                    unit: selectedCorrelation.secondaryUnit,
                },
            ];

            return {
                chartData: merged,
                chartSeries: series,
                chartTitle: selectedCorrelation.title,
                chartDescription: selectedCorrelation.description,
                yAxisLeftUnit: selectedCorrelation.primaryUnit,
                yAxisRightUnit: selectedCorrelation.secondaryUnit,
            };
        }

        if (selectedPid) {
            const singleSeries: ChartSeriesConfig[] = [
                {
                    dataKey: "value",
                    name: selectedPid.name,
                    yAxisId: "left",
                    unit: selectedPidUnit,
                },
            ];

            return {
                chartData: singlePidHistory.map(({ timestamp, value }) => ({
                    time: timestamp,
                    value,
                })),
                chartSeries: singleSeries,
                chartTitle: selectedPid.name,
                chartDescription: selectedPid.pid,
                yAxisLeftUnit: selectedPidUnit,
                yAxisRightUnit: undefined,
            };
        }

        return {
            chartData: [],
            chartSeries: undefined,
            chartTitle: undefined,
            chartDescription: undefined,
            yAxisLeftUnit: undefined,
            yAxisRightUnit: undefined,
        };
    }, [
        correlationPrimaryHistory,
        correlationSecondaryHistory,
        selectedCorrelation,
        selectedPid,
        singlePidHistory,
        selectedPidUnit,
    ]);

    const infoPidData = infoPid ? pids.find(({ pid }) => pid === infoPid) ?? null : null;
    const canShowInfoButton = Boolean(selectedPid);
    const livePidHeading = translateUi("commands.livePids.heading", locale, "Live Vehicle PIDs");
    const correlationsHeading = translateUi("commands.correlations.heading", locale, "Correlations");
    const pendingDataLabel = translateUi("commands.correlations.pending", locale, "Pending data");
    const emptyChartLabel = translateUi("commands.chart.empty", locale, "Select a PID or correlation to display the chart.");
    const noDescriptionLabel = translateUi("commands.modal.noDescription", locale, "No description provided for this PID yet.");
    const errorLabel = translateUi("commands.status.error", locale, "failed to load");
    const loadingLabel = translateUi("commands.status.loading", locale, "loading...");
    const infoButtonLabel = translateUi("commands.chart.infoButton", locale, "Show description");
    const closeDescriptionLabel = translateUi("commands.modal.close", locale, "Close description");

    if (error) {
        return <div>{errorLabel}</div>
    }

    if (isLoading) {
        return <div>{loadingLabel}</div>
    }

    return (
        <div className="absolute left-0 top-0 h-full w-full p-3">
            <div className="flex h-full flex-col gap-4">
                <ScrollArea className="h-1/2 w-full">
                    <div className="space-y-4">
                        <div>
                            <p className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
                                {livePidHeading}
                            </p>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                {pids.map(({ pid, name, value }) => {
                                    const isActive = pid === currentTab && !selectedCorrelation;
                                    return (
                                        <button
                                            key={`pid-button-${pid}`}
                                            type="button"
                                            aria-pressed={isActive}
                                            onClick={() => onPidSelect(pid)}
                                            className={`hover:border-primary focus-visible:ring-primary/50 w-full rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 ${
                                                isActive ? "border-primary bg-primary/5" : "border-muted"
                                            }`}
                                        >
                                            <div className="text-muted-foreground text-xs uppercase tracking-wide">{name}</div>
                                            <div className="text-2xl font-semibold">{value ?? "--"}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
                                {correlationsHeading}
                            </p>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {correlationCards.map((card) => {
                                    const primaryKey = toPidKey(card.primaryPid);
                                    const secondaryKey = toPidKey(card.secondaryPid);
                                    const primaryName = pidMap.get(primaryKey)?.name ?? card.primaryLabel;
                                    const secondaryName = pidMap.get(secondaryKey)?.name ?? card.secondaryLabel;
                                    const isActive = selectedCorrelation?.id === card.id;
                                    const hasLiveData = pidMap.has(primaryKey) && pidMap.has(secondaryKey);
                                    return (
                                        <button
                                            key={card.id}
                                            type="button"
                                            aria-pressed={isActive}
                                            onClick={() => onCorrelationSelect(card.id)}
                                            className={`focus-visible:ring-primary/50 w-full rounded-md border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 ${
                                                isActive ? "border-primary bg-primary/5" : "border-muted"
                                            } ${!hasLiveData ? "opacity-75" : "hover:border-primary"}`}
                                        >
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                {card.title}
                                                {!hasLiveData && (
                                                    <span className="text-muted-foreground text-[10px] font-normal uppercase tracking-wide">
                                                        {pendingDataLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {primaryName} ↔ {secondaryName}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex-1 overflow-hidden">
                    {selectedPid || selectedCorrelation ? (
                        <div className="relative h-full">
                            {canShowInfoButton && selectedPid && (
                                <button
                                    type="button"
                                    aria-label={`${infoButtonLabel} - ${selectedPid.name}`}
                                    onClick={() => setInfoPid(selectedPid.pid)}
                                    className="border-muted bg-background/80 text-muted-foreground hover:text-primary focus-visible:ring-primary/50 absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2"
                                >
                                    <Info className="h-4 w-4" aria-hidden="true" />
                                </button>
                            )}
                            <ChartAreaStep
                                title={chartTitle}
                                description={chartDescription}
                                chartData={chartData}
                                series={chartSeries}
                                yAxisLeftUnit={yAxisLeftUnit}
                                yAxisRightUnit={yAxisRightUnit}
                            />
                        </div>
                    ) : (
                        <div className="text-muted-foreground flex h-full items-center justify-center">
                            {emptyChartLabel}
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
                        className="border-muted bg-background relative w-full max-w-lg rounded-lg border p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            aria-label={closeDescriptionLabel}
                            onClick={() => setInfoPid(null)}
                            className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 absolute right-3 top-3 rounded-full p-1 focus-visible:outline-none focus-visible:ring-2"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <h2 className="text-lg font-semibold">{infoPidData.name}</h2>
                        <p className="text-muted-foreground text-sm">{infoPidData.pid}</p>
                        <ScrollArea className="mt-4 max-h-64">
                            <Markdown content={infoPidData.description || noDescriptionLabel} />
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    );
}

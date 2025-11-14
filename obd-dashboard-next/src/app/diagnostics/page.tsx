'use client';

import { Card, CardContent } from "@/ui/card";
import CarScene from "./CarScene";
import { KeyboardEvent, useMemo, useState } from "react";
import { cn } from "@/utils/classNames";
import { ArrowRight, Car, TriangleAlert, X } from "lucide-react";
import { Separator } from "@/ui/separator";
import { ScrollArea } from "@/ui/scroll-area";
import { useLanguage } from "@/app/LanguageContext";
import { translateUi } from "@/utils/i18n";

type CarSpecDefinition = {
  titleKey: string;
  titleFallback: string;
  specs: {
    labelKey: string;
    labelFallback: string;
    valueKey: string;
    valueFallback: string;
  }[];
};

const CAR_SPEC_DEFINITIONS: CarSpecDefinition[] = [
  {
    titleKey: "diagnostics.specs.overview.title",
    titleFallback: "Overview",
    specs: [
      {
        labelKey: "diagnostics.specs.overview.model.label",
        labelFallback: "Model",
        valueKey: "diagnostics.specs.overview.model.value",
        valueFallback: "Renault Clio II Phase 2 Extreme",
      },
      {
        labelKey: "diagnostics.specs.overview.body.label",
        labelFallback: "Body",
        valueKey: "diagnostics.specs.overview.body.value",
        valueFallback: "Hatchback · 3 doors",
      },
      {
        labelKey: "diagnostics.specs.overview.seats.label",
        labelFallback: "Seats",
        valueKey: "diagnostics.specs.overview.seats.value",
        valueFallback: "5 (2+3 layout)",
      },
      {
        labelKey: "diagnostics.specs.overview.production.label",
        labelFallback: "Production",
        valueKey: "diagnostics.specs.overview.production.value",
        valueFallback: "2001 – 2003",
      },
    ],
  },
  {
    titleKey: "diagnostics.specs.powertrain.title",
    titleFallback: "Powertrain",
    specs: [
      {
        labelKey: "diagnostics.specs.powertrain.engine.label",
        labelFallback: "Engine",
        valueKey: "diagnostics.specs.powertrain.engine.value",
        valueFallback: "1.4L inline-4 DOHC 16V (K4J)",
      },
      {
        labelKey: "diagnostics.specs.powertrain.displacement.label",
        labelFallback: "Displacement",
        valueKey: "diagnostics.specs.powertrain.displacement.value",
        valueFallback: "1390 cm³",
      },
      {
        labelKey: "diagnostics.specs.powertrain.aspiration.label",
        labelFallback: "Aspiration",
        valueKey: "diagnostics.specs.powertrain.aspiration.value",
        valueFallback: "Naturally aspirated",
      },
      {
        labelKey: "diagnostics.specs.powertrain.compression.label",
        labelFallback: "Compression",
        valueKey: "diagnostics.specs.powertrain.compression.value",
        valueFallback: "10:1",
      },
      {
        labelKey: "diagnostics.specs.powertrain.fuelSystem.label",
        labelFallback: "Fuel system",
        valueKey: "diagnostics.specs.powertrain.fuelSystem.value",
        valueFallback: "Multi-port indirect injection",
      },
      {
        labelKey: "diagnostics.specs.powertrain.layout.label",
        labelFallback: "Layout",
        valueKey: "diagnostics.specs.powertrain.layout.value",
        valueFallback: "Front transverse · FWD",
      },
      {
        labelKey: "diagnostics.specs.powertrain.transmission.label",
        labelFallback: "Transmission",
        valueKey: "diagnostics.specs.powertrain.transmission.value",
        valueFallback: "5-speed manual",
      },
    ],
  },
  {
    titleKey: "diagnostics.specs.performance.title",
    titleFallback: "Performance",
    specs: [
      {
        labelKey: "diagnostics.specs.performance.power.label",
        labelFallback: "Power",
        valueKey: "diagnostics.specs.performance.power.value",
        valueFallback: "98 hp @ 6000 rpm",
      },
      {
        labelKey: "diagnostics.specs.performance.torque.label",
        labelFallback: "Torque",
        valueKey: "diagnostics.specs.performance.torque.value",
        valueFallback: "127 Nm @ 3750 rpm",
      },
      {
        labelKey: "diagnostics.specs.performance.acceleration.label",
        labelFallback: "0-100 km/h",
        valueKey: "diagnostics.specs.performance.acceleration.value",
        valueFallback: "10.5 s",
      },
      {
        labelKey: "diagnostics.specs.performance.topSpeed.label",
        labelFallback: "Top speed",
        valueKey: "diagnostics.specs.performance.topSpeed.value",
        valueFallback: "185 km/h",
      },
      {
        labelKey: "diagnostics.specs.performance.weightToPower.label",
        labelFallback: "Weight-to-power",
        valueKey: "diagnostics.specs.performance.weightToPower.value",
        valueFallback: "10 kg/hp",
      },
    ],
  },
  {
    titleKey: "diagnostics.specs.fuel.title",
    titleFallback: "Fuel & Emissions",
    specs: [
      {
        labelKey: "diagnostics.specs.fuel.type.label",
        labelFallback: "Fuel type",
        valueKey: "diagnostics.specs.fuel.type.value",
        valueFallback: "Petrol (Euro 3)",
      },
      {
        labelKey: "diagnostics.specs.fuel.city.label",
        labelFallback: "City consumption",
        valueKey: "diagnostics.specs.fuel.city.value",
        valueFallback: "9.2 L/100 km",
      },
      {
        labelKey: "diagnostics.specs.fuel.highway.label",
        labelFallback: "Highway consumption",
        valueKey: "diagnostics.specs.fuel.highway.value",
        valueFallback: "5.3 L/100 km",
      },
      {
        labelKey: "diagnostics.specs.fuel.combined.label",
        labelFallback: "Combined consumption",
        valueKey: "diagnostics.specs.fuel.combined.value",
        valueFallback: "6.7 L/100 km",
      },
      {
        labelKey: "diagnostics.specs.fuel.co2.label",
        labelFallback: "CO₂ emissions",
        valueKey: "diagnostics.specs.fuel.co2.value",
        valueFallback: "160 g/km",
      },
      {
        labelKey: "diagnostics.specs.fuel.tank.label",
        labelFallback: "Fuel tank",
        valueKey: "diagnostics.specs.fuel.tank.value",
        valueFallback: "50 L",
      },
      {
        labelKey: "diagnostics.specs.fuel.range.label",
        labelFallback: "Typical range",
        valueKey: "diagnostics.specs.fuel.range.value",
        valueFallback: "≈746 km",
      },
    ],
  },
  {
    titleKey: "diagnostics.specs.dimensions.title",
    titleFallback: "Dimensions & Weight",
    specs: [
      {
        labelKey: "diagnostics.specs.dimensions.wheelbase.label",
        labelFallback: "Wheelbase",
        valueKey: "diagnostics.specs.dimensions.wheelbase.value",
        valueFallback: "247.2 cm",
      },
      {
        labelKey: "diagnostics.specs.dimensions.length.label",
        labelFallback: "Length",
        valueKey: "diagnostics.specs.dimensions.length.value",
        valueFallback: "381.2 cm",
      },
      {
        labelKey: "diagnostics.specs.dimensions.width.label",
        labelFallback: "Width",
        valueKey: "diagnostics.specs.dimensions.width.value",
        valueFallback: "163.9 cm",
      },
      {
        labelKey: "diagnostics.specs.dimensions.height.label",
        labelFallback: "Height",
        valueKey: "diagnostics.specs.dimensions.height.value",
        valueFallback: "141.7 cm",
      },
      {
        labelKey: "diagnostics.specs.dimensions.frontTrack.label",
        labelFallback: "Front track",
        valueKey: "diagnostics.specs.dimensions.frontTrack.value",
        valueFallback: "139.2 cm",
      },
      {
        labelKey: "diagnostics.specs.dimensions.rearTrack.label",
        labelFallback: "Rear track",
        valueKey: "diagnostics.specs.dimensions.rearTrack.value",
        valueFallback: "137.2 cm",
      },
      {
        labelKey: "diagnostics.specs.dimensions.curbWeight.label",
        labelFallback: "Curb weight",
        valueKey: "diagnostics.specs.dimensions.curbWeight.value",
        valueFallback: "980 kg",
      },
      {
        labelKey: "diagnostics.specs.dimensions.grossWeight.label",
        labelFallback: "Gross weight",
        valueKey: "diagnostics.specs.dimensions.grossWeight.value",
        valueFallback: "1525 kg",
      },
    ],
  },
  {
    titleKey: "diagnostics.specs.cabin.title",
    titleFallback: "Cabin & Storage",
    specs: [
      {
        labelKey: "diagnostics.specs.cabin.seatDistribution.label",
        labelFallback: "Seat distribution",
        valueKey: "diagnostics.specs.cabin.seatDistribution.value",
        valueFallback: "2 front · 3 rear",
      },
      {
        labelKey: "diagnostics.specs.cabin.boot.label",
        labelFallback: "Boot capacity",
        valueKey: "diagnostics.specs.cabin.boot.value",
        valueFallback: "255 L · 1037 L seats folded",
      },
    ],
  },
  {
    titleKey: "diagnostics.specs.chassis.title",
    titleFallback: "Chassis & Steering",
    specs: [
      {
        labelKey: "diagnostics.specs.chassis.frontBrakes.label",
        labelFallback: "Front brakes",
        valueKey: "diagnostics.specs.chassis.frontBrakes.value",
        valueFallback: "Vented discs",
      },
      {
        labelKey: "diagnostics.specs.chassis.rearBrakes.label",
        labelFallback: "Rear brakes",
        valueKey: "diagnostics.specs.chassis.rearBrakes.value",
        valueFallback: "Solid discs",
      },
      {
        labelKey: "diagnostics.specs.chassis.frontTyres.label",
        labelFallback: "Front tyres",
        valueKey: "diagnostics.specs.chassis.frontTyres.value",
        valueFallback: "185/55 R15",
      },
      {
        labelKey: "diagnostics.specs.chassis.rearTyres.label",
        labelFallback: "Rear tyres",
        valueKey: "diagnostics.specs.chassis.rearTyres.value",
        valueFallback: "185/55 R15",
      },
      {
        labelKey: "diagnostics.specs.chassis.steering.label",
        labelFallback: "Steering",
        valueKey: "diagnostics.specs.chassis.steering.value",
        valueFallback: "Rack and pinion",
      },
      {
        labelKey: "diagnostics.specs.chassis.frontSuspension.label",
        labelFallback: "Front suspension",
        valueKey: "diagnostics.specs.chassis.frontSuspension.value",
        valueFallback: "MacPherson struts with coil springs",
      },
      {
        labelKey: "diagnostics.specs.chassis.rearSuspension.label",
        labelFallback: "Rear suspension",
        valueKey: "diagnostics.specs.chassis.rearSuspension.value",
        valueFallback: "Torsion beam with coil springs",
      },
    ],
  },
];


export default function Page() {
  const { locale } = useLanguage();
  const [opened, setOpened] = useState(false);
  const [currentErrorCard, setCurrentErrorCard] = useState<string | null>(null);

  const t = (key: string, fallback: string) => translateUi(key, locale, fallback);

  const specCategories = useMemo(
    () =>
      CAR_SPEC_DEFINITIONS.map((category) => ({
        title: t(category.titleKey, category.titleFallback),
        specs: category.specs.map((spec) => ({
          label: t(spec.labelKey, spec.labelFallback),
          value: t(spec.valueKey, spec.valueFallback),
        })),
      })),
    [locale],
  );

  const vehicleSpecsHeading = t("diagnostics.specs.heading", "Vehicle Specs");
  const vehicleSpecsSubheading = t(
    "diagnostics.specs.subheading",
    "Renault Clio II Phase 2 1.4L 16V Extreme",
  );

  const toogleOpen = () => {
    setOpened((state) => !state);
    setCurrentErrorCard(null);
  }

  const handleOpenErrorCard = (errorCode: string) => {
    if (currentErrorCard === errorCode) {
      setCurrentErrorCard(null);
    } else {
      setCurrentErrorCard(errorCode);
    }
  }

  const handleKeyDown = (errorCode: string) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenErrorCard(errorCode);
    }
  }

  return (
    <div>
      <CarScene />

      <Card className={cn(
        "z-20",
        !opened && "absolute top-5 right-5 transition-[width,height,opacity,border] duration-200 delay-[200ms,200ms,250ms,200ms] ease-in-out w-15 h-15 opacity-0 border-0",
          opened && "absolute top-5 right-5 transition-[width,height,opacity,border] duration-200 ease-in-out w-2/5 h-2/3 opacity-100 border",
      )}>
        <CardContent className={cn(
          !opened && "pt-15 px-5 transition-[opacity] duration-300 delay-0 opacity-0",
          opened && "pt-15 px-5 transition-[opacity] duration-300 delay-200 opacity-100",
        )}>
          <div className={cn(
            currentErrorCard && "overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms,500ms,500ms, 100ms] delay-[500ms,500ms,500ms,0ms] h-0 opacity-0 m-0 p-0",
            !currentErrorCard && "overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms, 500ms, 500ms,100ms] delay-[200ms,200ms,200ms,500ms] h-30 opacity-100 m-3"
          )}>
            <div className="text-lg font-bold">Nissan Skyline R34 GT-R</div>
            <div className="text-sm">VIN : WP0ZZZ99ZTS39</div>
            <div className="font-bold mt-8 mb-4">2 erreurs</div>
          </div>
          
          <div className="">
            <Card
              className={cn(
                !currentErrorCard && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms,500ms,500ms,100ms] delay-[0ms,0ms,0ms,500ms] opacity-100 h-22",
                currentErrorCard && currentErrorCard === 'P0170' && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms,500ms,500ms,100ms] delay-[400ms,0ms,0ms,500ms] opacity-100 h-97",
                currentErrorCard && currentErrorCard !== 'P0170' && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms,500ms,500ms,100ms] delay-[500ms,500ms,500ms,0ms] opacity-0 h-0 p-0 m-0"
              )}
              role="button"
              tabIndex={0}
              aria-expanded={currentErrorCard === 'P0170'}
              onClick={() => handleOpenErrorCard('P0170')}
              onKeyDown={handleKeyDown('P0170')}
            >
              <CardContent className="">
                <div className="flex flex-center">
                  <div className="flex-1 mr-5">
                    <div className="text-sm">Garniture de carburant (banque 1)</div>
                    <div className="text-xs">Code défaut P0170</div>
                  </div>
                  {currentErrorCard === 'P0170' ? <X /> : <ArrowRight />}
                </div>
                { currentErrorCard === 'P0170' &&
                  <div className="">
                    <Separator className="mt-7 mb-5"/>
                    <div className="text-sm">Ce code erreur indique un dysfonctionnement dans le système de carburant, pouvant affecter la performance globale du moteur.</div>
                  </div>
                  }
              </CardContent>
            </Card>

            <Card
              className={cn(
                !currentErrorCard && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms, 500ms, 500ms,100ms] delay-[0ms,0ms,0ms,500ms] opacity-100 h-25",
                currentErrorCard && currentErrorCard === 'P0320' && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms,500ms,500ms,100ms] delay-[400ms,0ms,0ms,500ms] opacity-100 h-97",
                currentErrorCard && currentErrorCard !== 'P0320' && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms,500ms,500ms,100ms] delay-[500ms,500ms,500ms,0ms] opacity-0 h-0 p-0 m-0"
              )}
              role="button"
              tabIndex={0}
              aria-expanded={currentErrorCard === 'P0320'}
              onClick={() => handleOpenErrorCard('P0320')}
              onKeyDown={handleKeyDown('P0320')}
            >
              <CardContent className="">
                <div className="flex flex-center">
                  <div className="flex-1 mr-5">
                    <div className="text-sm">Capteur de vilebrequin – panne du circuit</div>
                    <div className="text-xs">Code défaut P0320</div>
                  </div>
                  {currentErrorCard === 'P0320' ? <X /> : <ArrowRight />}
                </div>
                { currentErrorCard === 'P0320' &&
                  <div className="">
                    <Separator className="mt-7 mb-5"/>
                    <div className="text-sm">Ce code erreur indique une défaillance du capteur de vilebrequin, suggérant un problème potentiel dans le circuit de détection.</div>
                  </div>
                }
              </CardContent>
            </Card>
          </div>
          
        </CardContent>
      </Card>

      <div
        className="absolute top-9 right-9 size-12 flex justify-center items-center border-2 bg-primary-foreground rounded-lg"
        role="button"
        tabIndex={0}
        aria-pressed={opened}
        onClick={toogleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toogleOpen();
          }
        }}
      >
        <Car size={30} />
        <div className="absolute top-0 left-0 -translate-2">
          <span className="absolute inline-flex size-7 -translate-1 rounded-full bg-orange-400 opacity-100"></span>
          <span className="absolute inline-flex size-7 -translate-1 rounded-full bg-orange-300 opacity-100"></span>
          <TriangleAlert size={20} className="relative" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-10 w-full h-1/2 p-5">
        <Card className="h-full w-full bg-background/95 backdrop-blur pointer-events-auto">
          <CardContent className="flex h-full min-h-0 flex-col gap-4 p-5">
            <div className="shrink-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {vehicleSpecsHeading}
              </p>
              <p className="text-lg font-semibold">{vehicleSpecsSubheading}</p>
            </div>
            <ScrollArea className="w-full flex-1 min-h-0">
              <div className="grid gap-4 pr-3 sm:grid-cols-2 lg:grid-cols-3">
                {specCategories.map((category) => (
                  <div
                    key={category.title}
                    className="rounded-lg border bg-card/80 p-4 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {category.title}
                    </p>
                    <dl className="mt-3 space-y-2">
                      {category.specs.map((spec) => (
                        <div key={`${category.title}-${spec.label}`} className="text-sm">
                          <dt className="text-muted-foreground">{spec.label}</dt>
                          <dd className="font-medium">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

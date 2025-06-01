'use client';

import { Card, CardContent } from "@/ui/card";
import CarScene from "./CarScene";
import { useState } from "react";
import { cn } from "@/utils/classNames";
import { ArrowRight, Car, TriangleAlert, X } from "lucide-react";
import { Separator } from "@/ui/separator";


export default function Page() {
  const [opened, setOpened] = useState(false);
  const [currentErrorCard, setCurrentErrorCard] = useState<string | null>(null);

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

  return (
    <div>
      <CarScene />

      <Card className={cn(
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
              onClick={() => handleOpenErrorCard('P0170')}
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
              onClick={() => handleOpenErrorCard('P0320')}
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

      <div className="absolute top-9 right-9 size-12 flex justify-center items-center border-2 bg-primary-foreground rounded-lg" onClick={toogleOpen}>
        <Car size={30} />
        <div className="absolute top-0 left-0 -translate-2">
          <span className="absolute inline-flex size-7 -translate-1 rounded-full bg-orange-400 opacity-100"></span>
          <span className="absolute inline-flex size-7 -translate-1 rounded-full bg-orange-300 opacity-100"></span>
          <TriangleAlert size={20} className="relative" />
        </div>
      </div>
    </div>
  )
}
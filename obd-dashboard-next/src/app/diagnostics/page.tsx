'use client';

import { Card, CardContent } from "@/ui/card";
import CarScene from "./CarScene";
import { useState } from "react";
import { cn } from "@/utils/classNames";
import { ArrowRight, Car, TriangleAlert } from "lucide-react";


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
        "absolute top-5 right-5 size-20 transition-all duration-200 ease-in-out opacity-0 border-0",
          opened && "w-2/5 h-2/3 opacity-100 border",
      )}>
        <CardContent className="pt-15 px-5">
          <div className={cn(
            currentErrorCard && "overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms,500ms,500ms, 100ms] delay-[500ms,500ms,500ms,0ms] h-0 opacity-0 m-0 p-0",
            !currentErrorCard && "overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms, 500ms, 500ms,100ms] delay-[0ms,0ms,0ms,500ms] h-30 opacity-100 m-3"
          )}>
            <div className="text-lg font-bold">Nissan Skyline R34 GT-R</div>
            <div className="text-sm">VIN : WP0ZZZ99ZTS39</div>
            <div className="font-bold mt-8 mb-4">2 erreurs</div>
          </div>
          
          <div className="">
            <Card
              className={cn(
                !currentErrorCard && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms, 500ms, 500ms,100ms] delay-[0ms,0ms,0ms,500ms] opacity-100 max-h-100",
                currentErrorCard && currentErrorCard !== 'P0170' && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms,500ms,500ms,100ms] delay-[500ms,500ms,500ms,0ms] opacity-0 h-0 p-0 m-0"
              )}
              onClick={() => handleOpenErrorCard('P0170')}
            >
              <CardContent className="flex items-center">
                <div className="flex-1 mr-5">
                  <div className="text-sm">Garniture de carburant (banque 1)</div>
                  <div className="text-xs">Code défaut P0170</div>
                </div>
                <ArrowRight />
              </CardContent>
            </Card>

            <Card
              className={cn(
                !currentErrorCard && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms, 500ms, 500ms,100ms] delay-[0ms,0ms,0ms,500ms] opacity-100 max-h-100",
                currentErrorCard && currentErrorCard !== 'P0320' && "mb-3 overflow-hidden transition-[height,margin,padding,opacity] duration-[500ms,500ms,500ms,100ms] delay-[500ms,500ms,500ms,0ms] opacity-0 h-0 p-0 m-0"
              )}
              onClick={() => handleOpenErrorCard('P0320')}
            >
              <CardContent className="flex items-center">
              <div className="flex-1 mr-5">
                <div className="text-sm">Capteur de vilebrequin – panne du circuit</div>
                <div className="text-xs">Code défaut P0320</div>
              </div>
              <ArrowRight />
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
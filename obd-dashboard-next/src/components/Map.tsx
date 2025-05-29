"use client";

import { useContext } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/ui/card";
import { ThemeContext } from '@/app/ThemeContext';

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Routing = dynamic(() => import("./Routing"), {
  ssr: false,
});


export default function MapRoute() {
  const { theme } = useContext(ThemeContext);

  return (
    <div>
      <MapContainer
        className="absolute top-0 left-0 z-0 w-full h-full"
        center={[47.21725000, -1.55336000]}
        zoom={19}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/${theme}_all/{z}/{x}/{y}{r}.png`}
        />

        <Card className="absolute z-1000 right-0 top-0 h-min m-5">
            <CardContent className="">
                <Routing />
            </CardContent>
        </Card>
      </MapContainer>
    </div>
  );
}
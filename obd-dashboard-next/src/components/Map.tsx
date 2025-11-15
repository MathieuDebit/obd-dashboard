"use client";

import dynamic from "next/dynamic";
import { useContext } from "react";

import { ThemeContext } from "@/app/ThemeContext";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);


export default function MapRoute() {
  const { theme } = useContext(ThemeContext);

  return (
    <div>
      <MapContainer
        className="absolute left-0 top-0 z-0 h-full w-full"
        center={[47.21725000, -1.55336000]}
        zoom={19}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/${theme}_all/{z}/{x}/{y}{r}.png`}
        />
      </MapContainer>
    </div>
  );
}

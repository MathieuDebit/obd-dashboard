// @ts-nocheck
"use client";

/**
 * @file Declares the Leaflet-based MapRoute component that renders a themed map
 * under the dashboard using dynamic imports.
 */

import dynamic from "next/dynamic";
import { useContext } from "react";

import { ThemeContext } from "@/app/ThemeContext";

const MapContainer = dynamic(
  () =>
    // @ts-ignore - react-leaflet types pull in unpublished @react-leaflet/core internals
    import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () =>
    // @ts-ignore - react-leaflet types pull in unpublished @react-leaflet/core internals
    import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);


/**
 * MapRoute renders the Leaflet map and syncs the tile style with the current
 * theme to keep the base map consistent with the UI.
 *
 * @returns Map container markup.
 */
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

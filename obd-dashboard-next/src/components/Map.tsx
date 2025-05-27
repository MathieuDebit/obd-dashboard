'use client';

import { useContext, useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { ThemeContext } from '@/app/ThemeContext';

export default function Map() {
  const map = useRef<L.Map>(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (!map.current) {
      map.current = L.map('mapId').setView([47.21725000, -1.55336000], 19);

      L.tileLayer(`https://{s}.basemaps.cartocdn.com/${theme}_all/{z}/{x}/{y}{r}.png`, {
        minZoom: 0,
        maxZoom: 20,
      }).addTo(map.current);

    L.marker([47.21725000, -1.55336000], {
      icon: L.icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
        iconSize: [28, 75],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
      }),
    })
      .addTo(map.current)
      .bindPopup('I am an example marker.');

    }
  }, [theme]);

  return <div id="mapId" className="absolute top-0 left-0 z-0 w-full h-full"></div>;
}
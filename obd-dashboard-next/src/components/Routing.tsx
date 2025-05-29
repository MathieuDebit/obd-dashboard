import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
});

export default function Routing() {
  const map = useMap();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map && !containerRef.current) return;
    if (containerRef.current?.childElementCount && containerRef.current.childElementCount > 0) return;

    const routingControl = L.Routing.control({
        waypoints: [L.latLng(47.218372, -1.553621), L.latLng(48.856613, 2.352222)],
        routeWhileDragging: false,

        lineOptions: {
          styles: [
            { color: "#3a80e9", weight: 5 },
            { color: "#ffffff", weight: 2, opacity: 0.7 }
          ]
        },
      });

      const ctrlEl = routingControl.onAdd(map);
      containerRef.current?.appendChild(ctrlEl);

      return () => {
        if (containerRef.current?.contains(ctrlEl)) {
          containerRef.current.removeChild(ctrlEl);
        }
      };
  }, [map]);

  return (
    <div ref={containerRef} />
  );
}

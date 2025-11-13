import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

const DEFAULT_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
});

L.Marker.prototype.options.icon = DEFAULT_ICON;

export default function Routing() {
  const map = useMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!map || !container) {
      return;
    }

    if (controlRef.current) {
      return;
    }

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(47.218372, -1.553621),
        L.latLng(48.856613, 2.352222),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      lineOptions: {
        styles: [
          { color: "#3a80e9", weight: 5 },
          { color: "#ffffff", weight: 2, opacity: 0.7 },
        ],
      },
    });

    controlRef.current = routingControl;

    const controlElement = routingControl.onAdd(map);
    container.appendChild(controlElement);

    return () => {
      controlRef.current = null;
      routingControl.off();
      routingControl.remove();

      if (container.contains(controlElement)) {
        container.removeChild(controlElement);
      }
    };
  }, [map]);

  return <div ref={containerRef} />;
}

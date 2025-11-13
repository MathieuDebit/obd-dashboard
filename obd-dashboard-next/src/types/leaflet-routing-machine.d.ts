import * as L from 'leaflet';

declare module 'leaflet-routing-machine' {
  const routing: Record<string, unknown>;
  export = routing;
}

declare module 'leaflet' {
  namespace Routing {
    interface ControlOptions {
      waypoints?: L.LatLngExpression[];
      position?: L.ControlPosition;
      lineOptions?: {
        styles: L.PathOptions[];
      };
      showAlternatives?: boolean;
      collapsible?: boolean;
      routeWhileDragging?: boolean;
      createMarker?: (i: number, wp: Waypoint, n: number) => L.Marker;
    }
    interface Waypoint {
      latLng: L.LatLngExpression;
      name?: string;
    }
  }
  namespace Routing {
    function control(options?: ControlOptions): L.Control & {
        onAdd(map: L.Map): HTMLElement;
    };
  }
}

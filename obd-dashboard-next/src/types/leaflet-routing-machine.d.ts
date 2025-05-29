import * as L from 'leaflet';

declare module 'leaflet-routing-machine' {
  const routing: any;
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
      createMarker?: (i: number, wp: any, n: number) => L.Marker;
    }
  }
  namespace Routing {
    function control(options?: ControlOptions): L.Control & {
        onAdd(map: L.Map): HTMLElement;
    };
  }
}

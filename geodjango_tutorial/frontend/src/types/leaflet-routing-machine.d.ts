declare module 'leaflet-routing-machine' {
    namespace Routing {
      interface RoutingControlOptions {
        createMarker?: (
          i: number,
          waypoint: Waypoint,
          n: number
        ) => L.Marker | null; // Allow null to suppress markers
      }
    }
  }
  
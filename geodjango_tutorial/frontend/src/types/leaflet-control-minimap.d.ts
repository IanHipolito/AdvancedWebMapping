declare module 'leaflet-minimap' {
    import * as L from 'leaflet';
  
    export class Control {
      static MiniMap: new (layer: L.Layer, options?: any) => L.Control;
    }
  }
  
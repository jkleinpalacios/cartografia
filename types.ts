export interface CommuneConfig {
  name: string;
  code: number;
  layerName: string;
}

export interface SIIFeatureData {
  rol?: string;
  nombreComuna?: string;
  direccion?: string;
  destinoDescripcion?: string;
  valorTotal?: number;
  periodo?: string;
}

export interface SIIResponse {
  data: SIIFeatureData;
  metaData: any;
}

export interface ClickContext {
  lat: number;
  lng: number;
  containerPoint: { x: number; y: number };
  bounds: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  };
  size: { x: number; y: number };
}

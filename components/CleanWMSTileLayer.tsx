import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { WORKER_URL } from '../constants';

interface CleanWMSTileLayerProps {
  url: string;
  layers: string;
  styles?: string;
  transparent?: boolean;
  version?: string;
  className?: string;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
}

export const CleanWMSTileLayer: React.FC<CleanWMSTileLayerProps> = (props) => {
  const map = useMap();
  const layerRef = useRef<L.TileLayer.WMS | null>(null);

  useEffect(() => {
    // Extend L.TileLayer.WMS to override createTile
    const CanvasWMS = L.TileLayer.WMS.extend({
      createTile: function(coords: L.Coords, done: L.DoneCallback) {
        // Create a Canvas element instead of an Image
        const tile = document.createElement('canvas');
        const size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;
        
        // Add standard leaflet classes for animation/positioning
        L.DomUtil.addClass(tile, 'leaflet-tile');

        // Calculate WMS URL using standard Leaflet logic
        const url = this.getTileUrl(coords);
        
        // REWRITE URL FOR PROXY (CORS SUPPORT)
        const proxyUrl = url.replace('https://www4.sii.cl', WORKER_URL);

        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Essential for manipulating pixel data
        img.src = proxyUrl;
        
        img.onload = () => {
           const ctx = tile.getContext('2d');
           if (!ctx) {
             done(null, tile);
             return;
           }

           // Draw image to canvas
           ctx.drawImage(img, 0, 0);
           
           // --- ALGORITMO DE RECONSTRUCCIÓN ESTRUCTURAL (DSP) ---
           try {
             const width = size.x;
             const height = size.y;
             const imgData = ctx.getImageData(0, 0, width, height);
             const data = imgData.data;
             const totalPixels = width * height;
             
             // Mapa de píxeles borrados para la Fase 2
             const ablatedPixels = new Int8Array(totalPixels); 

             // --- FASE 1: IDENTIFICACIÓN ESPECTRAL Y ABLACIÓN ---
             for(let i = 0; i < data.length; i += 4) {
               const r = data[i];
               const g = data[i+1];
               const b = data[i+2];
               const a = data[i+3];

               // Si ya es transparente, ignorar
               if (a < 50) continue;

               // Lógica "Hacker":
               // El texto del SII es Gris Oscuro/Negro (RGB bajos y parecidos).
               // Las líneas son Celestes/Azules (Azul/Verde significativamente mayor que Rojo).
               
               const isLineStructure = (b > r + 20) || (g > r + 20); // Es color vivo (Cyan/Verde/Azul)
               const isText = r < 100 && g < 100 && b < 100 && !isLineStructure; // Es oscuro y NO es estructura

               if (isText) {
                 // ABLACIÓN: Volver transparente
                 data[i+3] = 0;
                 // Marcar en nuestro mapa de índices (i / 4 = índice del pixel)
                 ablatedPixels[i / 4] = 1;
               }
             }

             // --- FASE 2: PUENTEO DE LÍNEAS (LINE BRIDGING) ---
             // Reparamos los cortes causados por la ablación extendiendo las estructuras adyacentes.
             
             // Offsets para vecinos: Arriba, Abajo, Izquierda, Derecha
             const offsets = [-width, width, -1, 1];

             for (let p = 0; p < totalPixels; p++) {
               if (ablatedPixels[p] === 1) {
                 const baseIdx = p * 4;
                 
                 // Mirar vecinos
                 for (const offset of offsets) {
                   const neighborPixel = p + offset;
                   
                   // Verificar límites del canvas
                   if (neighborPixel >= 0 && neighborPixel < totalPixels) {
                     const nIdx = neighborPixel * 4;
                     const nR = data[nIdx];
                     const nG = data[nIdx+1];
                     const nB = data[nIdx+2];
                     const nA = data[nIdx+3];

                     // Si el vecino es ESTRUCTURA (Línea visible y colorida)
                     // Nota: Usamos la misma lógica de "isLineStructure" de arriba
                     if (nA > 50 && ((nB > nR + 20) || (nG > nR + 20))) {
                       // CICATRIZAR: Copiar color del vecino al píxel borrado
                       data[baseIdx]   = nR;
                       data[baseIdx+1] = nG;
                       data[baseIdx+2] = nB;
                       data[baseIdx+3] = 255; // Restaurar opacidad total
                       break; // Ya encontramos puente, pasar al siguiente
                     }
                   }
                 }
               }
             }
             
             // Escribir píxeles procesados
             ctx.putImageData(imgData, 0, 0);
           } catch (e) {
             console.warn("Error en procesamiento DSP", e);
           }
           
           done(null, tile);
        };
        
        img.onerror = (e: any) => {
           console.error("Tile load error", e);
           done(e, tile);
        };

        return tile;
      }
    });

    const wmsOptions: L.WMSOptions = {
      layers: props.layers,
      styles: props.styles || '',
      format: 'image/png',
      transparent: props.transparent,
      version: props.version || '1.1.1',
      zIndex: props.zIndex,
      minZoom: props.minZoom,
      maxZoom: props.maxZoom,
      className: props.className
    };

    // Create instance
    const layer = new CanvasWMS(props.url, wmsOptions);
    layerRef.current = layer;

    // Add to map
    layer.addTo(map);

    // Cleanup on unmount
    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
    };
  }, [map, props.url, props.layers, props.styles, props.className, props.zIndex, props.transparent, props.version, props.minZoom, props.maxZoom]); 

  return null;
};
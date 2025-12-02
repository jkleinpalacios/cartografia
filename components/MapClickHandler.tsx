import React from 'react';
import { useMapEvents, Popup } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { fetchFeatureInfo } from '../services/siiService';
import { SIIFeatureData } from '../types';

interface MapClickHandlerProps {
  activeLayers: string[];
  setPopupData: (data: { position: LatLng; content: SIIFeatureData | null; loading: boolean; error?: string }) => void;
  popupData: { position: LatLng | null; content: SIIFeatureData | null; loading: boolean; error?: string };
  onClosePopup: () => void;
}

export const MapClickHandler: React.FC<MapClickHandlerProps> = ({ 
  activeLayers, 
  setPopupData, 
  popupData,
  onClosePopup 
}) => {
  const map = useMapEvents({
    click: async (e) => {
      const zoom = map.getZoom();
      
      // Enforce zoom level constraint
      if (zoom < 18) {
        setPopupData({
          position: e.latlng,
          content: null,
          loading: false,
          error: "Acerca el mapa (Zoom 18+) para consultar."
        });
        return;
      }

      if (activeLayers.length === 0) {
        setPopupData({
          position: e.latlng,
          content: null,
          loading: false,
          error: "Selecciona al menos una comuna en el menú lateral."
        });
        return;
      }

      setPopupData({
        position: e.latlng,
        content: null,
        loading: true
      });

      try {
        const bounds = map.getBounds();
        const size = map.getSize();
        
        const context = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          containerPoint: e.containerPoint,
          bounds: {
            sw: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
            ne: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng }
          },
          size: { x: size.x, y: size.y }
        };

        const result = await fetchFeatureInfo(context, activeLayers);
        
        if (result.data && result.data.rol) {
          setPopupData({
            position: e.latlng,
            content: result.data,
            loading: false
          });
        } else {
          setPopupData({
            position: e.latlng,
            content: null,
            loading: false,
            error: "No se encontró información de predio en este punto."
          });
        }

      } catch (err: any) {
        console.error(err);
        setPopupData({
          position: e.latlng,
          content: null,
          loading: false,
          error: `Error: ${err.message}`
        });
      }
    }
  });

  if (!popupData.position) return null;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  return (
    <Popup position={popupData.position} onClose={onClosePopup}>
      <div className="min-w-[200px]">
        {popupData.loading && (
          <div className="flex items-center gap-2 text-blue-600 font-medium">
             <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
             Consultando SII...
          </div>
        )}

        {popupData.error && (
          <div className="text-red-600 font-medium p-1">
            <h3 className="font-bold text-sm mb-1 text-red-700">Aviso</h3>
            <p className="text-sm">{popupData.error}</p>
          </div>
        )}

        {popupData.content && (
          <div className="text-sm">
            <h3 className="font-bold text-base mb-2 border-b pb-1 text-gray-800">Información del Predio</h3>
            <div className="space-y-1">
              <p><span className="font-semibold text-gray-600">Comuna:</span> {popupData.content.nombreComuna || 'N/A'}</p>
              <p><span className="font-semibold text-gray-600">ROL:</span> {popupData.content.rol}</p>
              <p><span className="font-semibold text-gray-600">Dirección:</span> {popupData.content.direccion || 'No disponible'}</p>
              <p><span className="font-semibold text-gray-600">Destino:</span> {popupData.content.destinoDescripcion || 'No disponible'}</p>
              <p><span className="font-semibold text-gray-600">Avalúo Total:</span> <span className="text-green-700 font-bold">{popupData.content.valorTotal ? formatCurrency(popupData.content.valorTotal) : 'N/A'}</span></p>
              <p><span className="font-semibold text-gray-600">Periodo:</span> {popupData.content.periodo || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
    </Popup>
  );
};

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, ZoomControl, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { COMUNAS_CONFIG, WMS_URL } from './constants';
import { LayerSidebar } from './components/LayerSidebar';
import { MapClickHandler } from './components/MapClickHandler';
import { CleanWMSTileLayer } from './components/CleanWMSTileLayer';
import { SIIFeatureData } from './types';
import L from 'leaflet';

// Fix for Leaflet default icon issues in React environment
// We use direct CDN URLs instead of importing image files which fails in ESM environments without loaders
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const App: React.FC = () => {
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [baseLayer, setBaseLayer] = useState<'osm' | 'satellite'>('osm');
  
  // Layer Style State
  const [layerColor, setLayerColor] = useState<string>('original'); // 'original', 'purple', 'red', etc.
  const [isCleanMode, setIsCleanMode] = useState<boolean>(false);   // Removes black text via pixel processing

  const [zoomLevel, setZoomLevel] = useState(10);
  
  // Initialize with Santiago Centro active so user sees something
  useEffect(() => {
    setActiveLayers(['sii:BR_CART_SANTIAGO_CENTRO_WMS']);
  }, []);

  const [popupData, setPopupData] = useState<{
    position: LatLng | null;
    content: SIIFeatureData | null;
    loading: boolean;
    error?: string;
  }>({ position: null, content: null, loading: false });

  const toggleLayer = (layerName: string) => {
    setActiveLayers(prev => 
      prev.includes(layerName) 
        ? prev.filter(l => l !== layerName) 
        : [...prev, layerName]
    );
  };

  const center: [number, number] = [-33.45, -70.66]; // Santiago Center

  // CSS Class for coloring
  // Since Clean Mode now outputs a Cyan image (just without text), we use standard color filters for both.
  const currentClass = `wms-color-${layerColor}`;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      
      <LayerSidebar 
        activeLayers={activeLayers} 
        toggleLayer={toggleLayer} 
        baseLayer={baseLayer}
        setBaseLayer={setBaseLayer}
        layerColor={layerColor}
        setLayerColor={setLayerColor}
        isCleanMode={isCleanMode}
        setIsCleanMode={setIsCleanMode}
      />

      <div className="w-full h-full relative">
        <MapContainer 
          center={center} 
          zoom={10} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          {/* Base Layers */}
          {baseLayer === 'osm' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          )}

          {/* Boundaries Layer (Always on top of base, below predios) */}
          <WMSTileLayer
            url={WMS_URL}
            layers="sii:BR_CART_LIMITE_COMUNAL"
            styles="LIMITE_COMUNAL_V0"
            format="image/png"
            transparent={true}
            version="1.1.1"
            zIndex={10}
            minZoom={10}
            maxZoom={22}
          />

          {/* Active Commune Layers */}
          {activeLayers.map(layerName => (
            isCleanMode ? (
              // Custom Layer that removes text (CPU intensive, requires Proxy)
              <CleanWMSTileLayer
                 key={`${layerName}-clean-${currentClass}`}
                 url={WMS_URL}
                 layers={layerName}
                 styles="PREDIOS_WMS_V0"
                 transparent={true}
                 version="1.1.1"
                 minZoom={18}
                 maxZoom={22}
                 className={currentClass} 
                 zIndex={20}
              />
            ) : (
              // Standard Fast Layer
              <WMSTileLayer
                key={`${layerName}-std-${currentClass}`} 
                url={WMS_URL}
                layers={layerName}
                styles="PREDIOS_WMS_V0"
                format="image/png"
                transparent={true}
                version="1.1.1"
                minZoom={18}
                maxZoom={22}
                className={currentClass}
                zIndex={20}
              />
            )
          ))}

          <ZoomControl position="bottomright" />
          
          <MapClickHandler 
            activeLayers={activeLayers}
            popupData={popupData}
            setPopupData={setPopupData}
            onClosePopup={() => setPopupData({ ...popupData, position: null })}
          />

          {/* Map Event Listener to track Zoom for UI feedback */}
          <ZoomTracker setZoom={setZoomLevel} />
          
        </MapContainer>

        {/* Floating Zoom Indicator */}
        <div className="absolute bottom-6 right-16 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md text-sm font-semibold text-gray-700 z-[1000] border border-gray-200">
          Zoom: {zoomLevel.toFixed(1)}
        </div>

        {/* User Hint if zoomed out */}
        {zoomLevel < 18 && activeLayers.length > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100/90 text-yellow-800 px-4 py-2 rounded-lg shadow-lg border border-yellow-200 z-[1000] text-sm font-medium flex items-center gap-2 pointer-events-none">
            <span>🔍 Acerca el mapa (Zoom 18+) para ver predios</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component to track zoom level
const ZoomTracker: React.FC<{ setZoom: (z: number) => void }> = ({ setZoom }) => {
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
    moveend: () => {
      setZoom(map.getZoom());
    }
  });
  return null;
};

export default App;

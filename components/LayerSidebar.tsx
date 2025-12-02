import React, { useState } from 'react';
import { COMUNAS_CONFIG } from '../constants';
import { Map, Layers, ChevronRight, ChevronLeft, CheckSquare, Square } from 'lucide-react';

interface LayerSidebarProps {
  activeLayers: string[];
  toggleLayer: (layerName: string) => void;
  baseLayer: 'osm' | 'satellite';
  setBaseLayer: (layer: 'osm' | 'satellite') => void;
}

export const LayerSidebar: React.FC<LayerSidebarProps> = ({ 
  activeLayers, 
  toggleLayer,
  baseLayer,
  setBaseLayer
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Group communes alphabetically for easier navigation, but pin Santiago Centro to top
  const sortedComunas = [...COMUNAS_CONFIG].sort((a, b) => {
    const priority = "Santiago Centro";
    if (a.name === priority) return -1;
    if (b.name === priority) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={`absolute left-0 top-0 h-full z-[1000] transition-all duration-300 flex ${isOpen ? 'w-80' : 'w-12'}`}>
      
      <div className={`bg-white shadow-xl h-full flex flex-col transition-all duration-300 overflow-hidden ${isOpen ? 'w-full' : 'w-0'}`}>
        <div className="p-4 bg-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Map size={20} />
            <h1 className="font-bold text-lg whitespace-nowrap">Cartografía RM</h1>
          </div>
        </div>

        {/* Base Map Selection */}
        <div className="p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} /> Mapa Base
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setBaseLayer('osm')}
              className={`flex-1 py-2 px-3 text-xs rounded-md border transition-colors ${baseLayer === 'osm' ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            >
              Estándar
            </button>
            <button 
              onClick={() => setBaseLayer('satellite')}
              className={`flex-1 py-2 px-3 text-xs rounded-md border transition-colors ${baseLayer === 'satellite' ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            >
              Satelital
            </button>
          </div>
        </div>

        {/* Communes List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <h2 className="text-xs font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider sticky top-0 bg-white pb-2 pt-2">
            Comunas Disponibles
          </h2>
          <div className="space-y-1">
            {sortedComunas.map((comuna) => {
              const isActive = activeLayers.includes(comuna.layerName);
              return (
                <button
                  key={comuna.code}
                  onClick={() => toggleLayer(comuna.layerName)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${isActive ? 'bg-blue-50 text-blue-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {isActive ? <CheckSquare size={16} className="text-blue-600 shrink-0" /> : <Square size={16} className="text-gray-400 shrink-0" />}
                  <span className="truncate">{comuna.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 text-xs text-gray-500 border-t text-center shrink-0">
          Uso referencial
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-6 top-4 bg-white p-1 rounded-r-md shadow-md border-y border-r border-gray-200 z-[1001] hover:bg-gray-50"
        title={isOpen ? "Cerrar panel" : "Abrir panel"}
      >
        {isOpen ? <ChevronLeft size={20} className="text-gray-600" /> : <ChevronRight size={20} className="text-gray-600" />}
      </button>

      {!isOpen && (
        <div className="absolute left-0 top-0 w-12 h-full bg-white shadow-xl flex flex-col items-center pt-4 gap-4 z-[1000]">
           <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-gray-100 rounded-md text-blue-900">
             <Layers size={24} />
           </button>
        </div>
      )}
    </div>
  );
};
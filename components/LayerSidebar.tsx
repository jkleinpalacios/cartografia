import React, { useState } from 'react';
import { COMUNAS_CONFIG } from '../constants';
import { Map, Layers, ChevronRight, ChevronLeft, CheckSquare, Square, Palette, EyeOff, Eye, Cpu } from 'lucide-react';

interface LayerSidebarProps {
  activeLayers: string[];
  toggleLayer: (layerName: string) => void;
  baseLayer: 'osm' | 'satellite';
  setBaseLayer: (layer: 'osm' | 'satellite') => void;
  layerColor: string;
  setLayerColor: (color: string) => void;
  isCleanMode: boolean;
  setIsCleanMode: (isClean: boolean) => void;
}

export const LayerSidebar: React.FC<LayerSidebarProps> = ({ 
  activeLayers, 
  toggleLayer,
  baseLayer,
  setBaseLayer,
  layerColor,
  setLayerColor,
  isCleanMode,
  setIsCleanMode
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Group communes alphabetically for easier navigation
  const sortedComunas = [...COMUNAS_CONFIG].sort((a, b) => a.name.localeCompare(b.name));

  const colorOptions = [
    { id: 'original', label: 'Original', color: 'bg-cyan-400' },
    { id: 'purple', label: 'Morado', color: 'bg-purple-600' },
    { id: 'red', label: 'Rojo', color: 'bg-red-600' },
    { id: 'orange', label: 'Naranja', color: 'bg-orange-500' },
    { id: 'green', label: 'Verde', color: 'bg-green-600' },
    { id: 'black', label: 'Negro', color: 'bg-black' },
  ];

  return (
    <div className={`absolute left-0 top-0 h-full z-[1000] transition-all duration-300 flex ${isOpen ? 'w-80' : 'w-12'}`}>
      
      <div className={`bg-white shadow-xl h-full flex flex-col transition-all duration-300 overflow-hidden ${isOpen ? 'w-full' : 'w-0'}`}>
        <div className="p-4 bg-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Map size={20} />
            <h1 className="font-bold text-lg whitespace-nowrap">Visor SII</h1>
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

        {/* Layer Style Selection */}
        <div className="p-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between mb-3">
             <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Palette size={14} /> Estilo y Color
             </h2>
          </div>

          {/* Clean Mode Toggle */}
          <div className={`mb-4 p-2 rounded-lg border transition-colors ${isCleanMode ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-100'}`}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                   {isCleanMode ? <Cpu size={16} className="text-purple-600" /> : <Eye size={16} className="text-gray-500" />}
                   <span className={`font-medium ${isCleanMode ? 'text-purple-800' : ''}`}>Algoritmo DSP</span>
                </div>
                
                <button 
                  onClick={() => setIsCleanMode(!isCleanMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isCleanMode ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isCleanMode ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
             </div>
             <p className="text-[10px] text-gray-500 mt-2 pl-6 leading-tight">
               {isCleanMode 
                 ? "Activo: Ablación espectral de texto y puenteo estructural de líneas."
                 : "Modo Limpio desactivado."
               }
             </p>
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-2 gap-2">
            {colorOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLayerColor(opt.id)}
                className={`flex items-center gap-2 py-1.5 px-2 text-xs rounded-md border transition-all ${layerColor === opt.id ? 'bg-gray-100 border-gray-400 ring-1 ring-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <span className={`w-3 h-3 rounded-full ${opt.color} border border-gray-300`}></span>
                {opt.label}
              </button>
            ))}
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
          Datos provistos por SII. Uso referencial.
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
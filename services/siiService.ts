import { WORKER_URL, COMUNAS_CONFIG } from '../constants';
import { ClickContext, SIIResponse } from '../types';

export const fetchFeatureInfo = async (
  clickContext: ClickContext,
  activeLayerNames: string[]
): Promise<SIIResponse> => {
  const activeServices: any[] = [];
  const activeLayerConfigNames: string[] = [];

  // Filter configuration based on what is currently active on the map
  COMUNAS_CONFIG.forEach((config) => {
    if (activeLayerNames.includes(config.layerName)) {
      const serviceInfo = {
        comuna: config.code,
        layer: config.layerName,
        style: "PREDIOS_WMS_V0",
        eac: 0,
        eacano: 0
      };
      
      activeServices.push(serviceInfo);
      
      // Add secondary layers (implied logic from original code)
      activeServices.push({
        ...serviceInfo,
        layer: "sii:BR_CART_AH_MUESTRAS",
        style: "AH_MUESTRA_EAC_14_2022",
        eac: 14,
        eacano: 2022
      });
      activeServices.push({
        ...serviceInfo,
        layer: "sii:BR_CART_CSA_MUESTRAS",
        style: "CSA_MUESTRA_EAC_16_2024",
        eac: 16,
        eacano: 2024
      });

      activeLayerConfigNames.push(config.layerName);
    }
  });

  if (activeServices.length === 0) {
    throw new Error("No communes selected");
  }

  const payload = {
    metaData: { 
      namespace: "cl.sii.sdi.lob.bbrr.mapas.data.api.interfaces.MapasFacadeService/getFeatureInfo", 
      conversationId: "UNAUTHENTICATED-CALL", 
      transactionId: crypto.randomUUID() 
    },
    data: {
      clickInfo: {
        x: clickContext.containerPoint.x, 
        y: clickContext.containerPoint.y,
        southwestx: clickContext.bounds.sw.lat, 
        southwesty: clickContext.bounds.sw.lng,
        northeastx: clickContext.bounds.ne.lat, 
        northeasty: clickContext.bounds.ne.lng,
        layer: activeLayerConfigNames.join(','),
        width: clickContext.size.x, 
        height: clickContext.size.y,
        servicios: activeServices
      }
    }
  };

  const featureInfoUrl = `${WORKER_URL}/mapasui/services/data/mapasFacadeService/getFeatureInfo`;

  const response = await fetch(featureInfoUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Error en la petición. Status: ${response.status}`);
  }

  return response.json();
};
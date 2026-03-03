import React, { useState, useEffect } from 'react';
import { Ship, Anchor, AlertCircle } from 'lucide-react';
import vesselService from '../../services/vesselService';

/**
 * Composant pour sélectionner un navire réel via API AIS
 * Affiche les navires présents dans le port d'origine en temps réel
 */
const ShipSelector = ({ originPortId, onVesselSelect, selectedVesselMmsi }) => {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔄 [ShipSelector] useEffect triggered, originPortId:', originPortId);
    if (originPortId) {
      console.log('✅ [ShipSelector] originPortId exists, calling loadVesselsAtPort');
      loadVesselsAtPort();
    } else {
      console.log('⚠️ [ShipSelector] No originPortId, clearing vessels');
      setVessels([]);
    }
  }, [originPortId]);

  const loadVesselsAtPort = async () => {
    console.log('🚢 [ShipSelector] loadVesselsAtPort START for portId:', originPortId);
    setLoading(true);
    setError(null);
    try {
      console.log(`🚢 [ShipSelector] Calling vesselService.getVesselsByPort(${originPortId})`);
      const data = await vesselService.getVesselsByPort(originPortId);
      console.log(`✅ [ShipSelector] Received data:`, data);
      console.log(`✅ [ShipSelector] Data length: ${data.length}`);
      console.log(`✅ [ShipSelector] Vessels:`, data);
      
      setVessels(data);
      console.log(`✅ [ShipSelector] State updated with ${data.length} vessels`);
      
      // Ne pas afficher d'erreur si on a des navires (même mockés)
      if (data.length === 0) {
        console.log('⚠️ [ShipSelector] No vessels found');
        setError('Aucun navire détecté dans ce port actuellement');
      } else {
        console.log('✅ [ShipSelector] Vessels available for selection');
        setError(null); // Clear any previous error
      }
    } catch (err) {
      console.error('❌ [ShipSelector] Error loading vessels:', err);
      console.error('❌ [ShipSelector] Error details:', err.response?.data || err.message);
      
      // Afficher un message d'erreur seulement si vraiment aucune donnée
      setError('Erreur lors du chargement des navires (API indisponible)');
      setVessels([]);
    } finally {
      setLoading(false);
      console.log('🏁 [ShipSelector] loadVesselsAtPort COMPLETE');
    }
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log('📊 [ShipSelector] State updated - vessels:', vessels.length, 'error:', error);
  }, [vessels, error]);

  const handleSelectCarrier = (vessel) => {
    console.log('🚢 [ShipSelector] handleSelectCarrier called with:', vessel);
    
    if (selectedVesselMmsi === vessel.mmsi) {
      console.log('⚠️ [ShipSelector] Deselecting vessel');
      onVesselSelect(null);
    } else {
      console.log('✅ [ShipSelector] Selecting vessel:', vessel.name);
      onVesselSelect({
        mmsi: vessel.mmsi,
        name: vessel.name,
        type: vessel.type
      });
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Ship className="w-4 h-4 text-maritime-navy" />
        Navires disponibles (données AIS temps réel)
      </label>
      
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <Anchor className="w-4 h-4 animate-spin" />
          Chargement des navires via API AIS...
        </div>
      ) : vessels.length > 0 ? (
        <>
          <p className="text-xs text-green-600 flex items-center gap-1 mb-2">
            <Ship className="w-3 h-3" />
            {vessels.length} navire(s) détecté(s) dans ce port
          </p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {vessels.map(vessel => {
              const isSelected = selectedVesselMmsi === vessel.mmsi;
              
              return (
                <div
                  key={vessel.mmsi}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Ship className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-green-600' : 'text-blue-600'}`} />
                        <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                          {vessel.name}
                        </h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Type:</span> {vessel.type}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">MMSI:</span> {vessel.mmsi}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSelectCarrier(vessel)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                        isSelected
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSelected ? '✓ Sélectionné' : 'Sélectionner'}
                    </button>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                        <span>✓</span> Ce navire sera utilisé pour le calcul du transport maritime
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : error && !loading ? (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      ) : null}
      
      {!originPortId && (
        <p className="text-sm text-gray-500">
          Veuillez d'abord sélectionner le port d'origine
        </p>
      )}
    </div>
  );
};

export default ShipSelector;

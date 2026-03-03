import React from 'react';
import { Ship, Anchor, MapPin, Clock, DollarSign } from 'lucide-react';

const MaritimeTransportDetails = ({ maritimeTransport, currency = 'USD' }) => {
  if (!maritimeTransport) return null;

  const formatCurrency = (value, curr = currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="bg-white border-2 border-maritime-navy rounded-xl p-6 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
        <Ship className="w-6 h-6 text-maritime-navy" />
        <h3 className="text-xl font-bold text-maritime-navy">Transport Maritime</h3>
      </div>

      {/* Ship Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Ship className="w-5 h-5 text-accent-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Navire</p>
              <p className="text-sm font-bold text-gray-900">{maritimeTransport.vesselName}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Anchor className="w-5 h-5 text-accent-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">MMSI</p>
              <p className="text-sm font-bold text-gray-900">{maritimeTransport.vesselMmsi}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-accent-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Poids</p>
              <p className="text-sm font-bold text-gray-900">{maritimeTransport.weightTonnes} tonnes</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-accent-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Distance</p>
              <p className="text-sm font-bold text-gray-900">
                {maritimeTransport.distanceNm?.toFixed(0)} NM ({maritimeTransport.distanceKm?.toFixed(0)} km)
              </p>
              <p className="text-xs text-blue-600">Source: {maritimeTransport.dataSource}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-accent-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Délai estimé</p>
              <p className="text-sm font-bold text-gray-900">{maritimeTransport.estimatedDays} jours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mt-4 pt-4 border-t-2 border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-accent-600" />
          <h4 className="text-sm font-bold text-gray-700 uppercase">Détail des coûts</h4>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Fret maritime</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(maritimeTransport.freightCost, maritimeTransport.currency)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Frais port départ</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(maritimeTransport.originPortFees, maritimeTransport.currency)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Frais port arrivée</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(maritimeTransport.destPortFees, maritimeTransport.currency)}
            </span>
          </div>
          
          {maritimeTransport.bunkerSurcharge > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Surcharge carburant (BAF)</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(maritimeTransport.bunkerSurcharge, maritimeTransport.currency)}
              </span>
            </div>
          )}
          
          {maritimeTransport.canalFees > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Frais canaux</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(maritimeTransport.canalFees, maritimeTransport.currency)}
              </span>
            </div>
          )}
          
          {maritimeTransport.securitySurcharge > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Surcharge sécurité</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(maritimeTransport.securitySurcharge, maritimeTransport.currency)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Assurance transport</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(maritimeTransport.insuranceCost, maritimeTransport.currency)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 bg-maritime-navy rounded-lg px-3 mt-2">
            <span className="text-sm font-bold text-white uppercase">Total Transport Maritime</span>
            <span className="text-lg font-bold text-accent-300">
              {formatCurrency(maritimeTransport.totalCost, maritimeTransport.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Container Type & Incoterm */}
      <div className="flex gap-4 text-xs text-gray-500 pt-2">
        <span>Conteneur: <strong>{maritimeTransport.containerType || '20FT'}</strong></span>
        <span>Incoterm: <strong>{maritimeTransport.incoterm || 'FOB'}</strong></span>
      </div>
    </div>
  );
};

export default MaritimeTransportDetails;

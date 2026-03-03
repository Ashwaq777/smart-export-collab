import React from 'react'
import { DollarSign, TrendingUp, Package, Anchor } from 'lucide-react'

function CostDashboard({ result }) {
  const formatCurrency = (value, currency = 'EUR') => {
    if (value === null || value === undefined) return 'N/A'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
      red: 'bg-red-50 text-red-600'
    }

    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Résultats du calcul</h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Produit</span>
            <span className="font-semibold text-gray-900">{result.nomProduit}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Code HS</span>
            <span className="font-mono text-gray-900">{result.codeHs}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Destination</span>
            <span className="font-semibold text-gray-900">{result.paysDestination}</span>
          </div>
          {result.nomPort && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Port</span>
              <span className="font-semibold text-gray-900">{result.nomPort}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            title="Total Douane"
            value={formatCurrency(result.montantDouane, result.currency)}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Total TVA"
            value={formatCurrency(result.montantTva, result.currency)}
            icon={TrendingUp}
            color="green"
          />
          {result.montantTaxeParafiscale > 0 && (
            <StatCard
              title="Taxe Parafiscale"
              value={formatCurrency(result.montantTaxeParafiscale, result.currency)}
              icon={DollarSign}
              color="purple"
            />
          )}
          {result.fraisPortuaires > 0 && (
            <StatCard
              title="Frais Portuaires"
              value={formatCurrency(result.fraisPortuaires, result.currency)}
              icon={Anchor}
              color="orange"
            />
          )}
        </div>

        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border-2 border-primary-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-primary-900">Grand Total (Landed Cost)</span>
            <span className="text-3xl font-bold text-primary-700">
              {formatCurrency(result.coutTotal, result.currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Détail des coûts</h3>
        
        <div className="space-y-2">
          <CostRow label="Valeur FOB" value={result.valeurFob} currency={result.currency} />
          <CostRow label="Coût Transport" value={result.coutTransport} currency={result.currency} />
          <CostRow label="Assurance" value={result.assurance} currency={result.currency} />
          <CostRow 
            label="Valeur CAF (CIF)" 
            value={result.valeurCaf} 
            currency={result.currency} 
            bold 
          />
          <div className="border-t border-gray-200 my-2"></div>
          <CostRow 
            label={`Droits de Douane (${result.tauxDouane}%)`} 
            value={result.montantDouane} 
            currency={result.currency} 
          />
          <CostRow 
            label={`TVA (${result.tauxTva}%)`} 
            value={result.montantTva} 
            currency={result.currency} 
          />
          {result.montantTaxeParafiscale > 0 && (
            <CostRow 
              label={`Taxe Parafiscale (${result.taxeParafiscale}%)`} 
              value={result.montantTaxeParafiscale} 
              currency={result.currency} 
            />
          )}
          {result.fraisPortuaires > 0 && (
            <CostRow 
              label="Frais Portuaires" 
              value={result.fraisPortuaires} 
              currency={result.currency} 
            />
          )}
          <div className="border-t-2 border-gray-300 my-2"></div>
          <CostRow 
            label="COÛT TOTAL" 
            value={result.coutTotal} 
            currency={result.currency} 
            bold 
            large 
          />
        </div>
      </div>

      {(result.coutTotalEur || result.coutTotalUsd) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Conversions de devises</h3>
          <div className="grid grid-cols-2 gap-4">
            {result.coutTotalEur && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Total en EUR</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatCurrency(result.coutTotalEur, 'EUR')}
                </p>
              </div>
            )}
            {result.coutTotalUsd && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-600 font-medium">Total en USD</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(result.coutTotalUsd, 'USD')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-800">
          <strong>Disclaimer:</strong> {result.disclaimer}
        </p>
        <p className="text-xs text-yellow-700 mt-2">
          Source des taux de change: {result.exchangeRateSource}
        </p>
      </div>
    </div>
  )
}

function CostRow({ label, value, currency, bold = false, large = false }) {
  const formatCurrency = (val, curr = 'EUR') => {
    if (val === null || val === undefined) return 'N/A'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val)
  }

  return (
    <div className="flex justify-between items-center py-1">
      <span className={`text-gray-700 ${bold ? 'font-semibold' : ''} ${large ? 'text-lg' : ''}`}>
        {label}
      </span>
      <span className={`text-gray-900 ${bold ? 'font-bold' : 'font-medium'} ${large ? 'text-xl' : ''}`}>
        {formatCurrency(value, currency)}
      </span>
    </div>
  )
}

export default CostDashboard

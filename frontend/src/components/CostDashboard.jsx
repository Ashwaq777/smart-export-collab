import React from 'react'
import { TrendingUp, DollarSign, Ship, FileText, Globe, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'

const CostDashboard = ({ result }) => {
  const formatCurrency = (value, currency = result.currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value)
  }
  
  // Check if data is from fallback (estimated) or database (verified)
  const isEstimatedData = result.dataSource === 'WTO_MFN_ESTIMATED' || result.dataSource === 'FALLBACK_ESTIMATED'
  const isVerifiedData = result.dataSource === 'DATABASE'

  const kpiCards = [
    {
      title: 'Total Douane',
      value: result.montantDouane,
      currency: result.currency,
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      percentage: result.tauxDouane,
    },
    {
      title: 'Total TVA',
      value: result.montantTva,
      currency: result.currency,
      icon: TrendingUp,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
      percentage: result.tauxTva,
    },
    {
      title: 'Taxe Parafiscale',
      value: result.montantTaxeParafiscale,
      currency: result.currency,
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      percentage: result.taxeParafiscale,
    },
    {
      title: 'Frais Portuaires',
      value: result.fraisPortuaires || 0,
      currency: result.currency,
      icon: Ship,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Data Source Warning Banner */}
      {isEstimatedData && result.warningMessage && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-800 mb-1">
                Taux douaniers estimés (source: OMC/WTO moyennes MFN)
              </p>
              <p className="text-sm text-yellow-700">
                {result.warningMessage}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Verified Data Badge */}
      {isVerifiedData && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">
                ✅ Données officielles vérifiées
              </p>
              <p className="text-sm text-green-700">
                Taux douaniers et TVA provenant de la base de données officielle.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-maritime-navy to-maritime-deepBlue rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-accent-300 mb-2">TOTAL LANDED COST</h3>
            <div className="text-5xl font-bold">{formatCurrency(result.coutTotal)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-accent-300 mb-1">Currency</div>
            <div className="text-2xl font-bold">{result.currency}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-accent-200">
          <span>{result.nomProduit}</span>
          <span>•</span>
          <span>{result.paysDestination}</span>
          {result.nomPort && (
            <>
              <span>•</span>
              <span>{result.nomPort}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-accent-500 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-accent-100 group-hover:bg-accent-200 transition-colors">
                  <Icon className="w-5 h-5 text-accent-600" />
                </div>
                {kpi.percentage !== undefined && (
                  <span className="text-xs font-semibold text-gray-500">
                    {kpi.percentage}%
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">{kpi.title}</p>
              <p className="text-2xl font-bold text-maritime-navy">
                {formatCurrency(kpi.value, kpi.currency)}
              </p>
            </div>
          )
        })}
      </div>

      <div className="bg-gradient-to-br from-maritime-navy to-maritime-ocean rounded-2xl p-8 shadow-xl border border-maritime-ocean">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-primary-100 text-sm mb-2 leading-relaxed">Coût Total Landed Cost</p>
            <p className="text-5xl font-bold tracking-tight text-white">{formatCurrency(result.coutTotal)}</p>
            {result.nomPort && (
              <p className="text-primary-100 text-sm mt-3 leading-relaxed">
                Port: {result.nomPort}
              </p>
            )}
          </div>
          <div className="text-right space-y-3">
            {result.coutTotalEur && result.currency !== 'EUR' && (
              <div>
                <p className="text-primary-100 text-xs leading-relaxed">Équivalent EUR</p>
                <p className="text-xl font-semibold tracking-tight text-white">{formatCurrency(result.coutTotalEur, 'EUR')}</p>
              </div>
            )}
            {result.coutTotalUsd && result.currency !== 'USD' && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-primary-100 text-xs leading-relaxed">Équivalent USD</p>
                <p className="text-xl font-semibold tracking-tight text-maritime-navy">{formatCurrency(result.coutTotalUsd, 'USD')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-maritime-navy mb-6">Cost Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">Item</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">Amount</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wide">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200">
                <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">Valeur FOB</td>
                  <td className="py-4 px-4 text-sm text-right font-bold text-maritime-navy">{formatCurrency(result.valeurFob, result.currency)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600">-</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                    Transport
                  </td>
                  <td className="py-4 px-4 text-sm text-right font-bold text-maritime-navy">{formatCurrency(result.coutTransport, result.currency)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600">-</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">Assurance</td>
                  <td className="py-4 px-4 text-sm text-right font-bold text-maritime-navy">{formatCurrency(result.assurance, result.currency)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600">-</td>
                </tr>
                <tr className="bg-accent-50 font-semibold border-b border-accent-200">
                  <td className="py-4 px-4 text-sm font-bold text-maritime-navy">CIF Value</td>
                  <td className="py-4 px-4 text-sm text-right font-bold text-maritime-navy">{formatCurrency(result.valeurCaf, result.currency)}</td>
                  <td className="py-4 px-4 text-sm text-right text-gray-600">-</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">Droits de douane</td>
                  <td className="py-4 px-4 text-sm text-right font-bold text-maritime-navy">{formatCurrency(result.montantDouane, result.currency)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600">{result.tauxDouane}%</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">TVA</td>
                  <td className="py-4 px-4 text-sm text-right font-bold text-maritime-navy">{formatCurrency(result.montantTva, result.currency)}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-600">{result.tauxTva}%</td>
                </tr>
                {result.montantTaxeParafiscale > 0 && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700">Taxe parafiscale</td>
                    <td className="py-4 px-4 text-sm text-right font-bold text-maritime-navy">{formatCurrency(result.montantTaxeParafiscale, result.currency)}</td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600">{result.taxeParafiscale}%</td>
                  </tr>
                )}
                {result.fraisPortuaires > 0 && (
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700">Frais portuaires</td>
                    <td className="py-4 px-4 text-sm text-right font-bold text-maritime-navy">{formatCurrency(result.fraisPortuaires, result.currency)}</td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600">-</td>
                  </tr>
                )}
                <tr className="bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold">
                  <td className="py-5 px-4 text-base font-bold">TOTAL LANDED COST</td>
                  <td className="py-5 px-4 text-base text-right font-bold">{formatCurrency(result.coutTotal, result.currency)}</td>
                  <td className="py-5 px-4 text-base text-right">-</td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>

      {/* Profitability Analysis */}
      {result.margeNette !== null && result.margeNette !== undefined && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-maritime-navy mb-6">Analyse de Rentabilité</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <p className="text-sm text-blue-700 font-semibold mb-2">Prix de Vente Prévisionnel</p>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(result.prixVentePrevisionnel)}</p>
            </div>
            <div className={`rounded-xl p-6 border-2 ${result.margeNette >= 0 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'}`}>
              <p className={`text-sm font-semibold mb-2 ${result.margeNette >= 0 ? 'text-green-700' : 'text-red-700'}`}>Marge Nette</p>
              <p className={`text-3xl font-bold ${result.margeNette >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatCurrency(result.margeNette)}
              </p>
              {result.margePourcentage !== null && (
                <p className={`text-sm font-semibold mt-2 ${result.margeNette >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {result.margePourcentage.toFixed(2)}%
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <p className="text-sm text-purple-700 font-semibold mb-2">Indicateur</p>
              <div className="flex items-center gap-2">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  result.indicateurRentabilite === 'POSITIF' ? 'bg-green-500 text-white' :
                  result.indicateurRentabilite === 'NEGATIF' ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {result.indicateurRentabilite}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIV Alert */}
      {result.alerteSiv && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-900 mb-2">⚠️ Alerte Sécurité Douanière (SIV)</h3>
              <p className="text-orange-800 mb-4">{result.messageSiv}</p>
              {result.prixEntreeSivMin && (
                <div className="grid grid-cols-2 gap-4 bg-white rounded-lg p-4 border border-orange-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Valeur CAF actuelle</p>
                    <p className="text-lg font-bold text-orange-900">{formatCurrency(result.valeurCaf)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Prix d'entrée SIV minimum</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(result.prixEntreeSivMin)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Currency Sensitivity */}
      {(result.impactDevise2PourcentPlus || result.impactDevise2PourcentMoins) && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-maritime-navy mb-4">Analyse de Sensibilité Devises</h3>
          <p className="text-sm text-gray-600 mb-6">Impact d'une variation de ±2% du taux de change sur le coût total</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.impactDevise2PourcentPlus && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                <p className="text-sm text-red-700 font-semibold mb-2">Variation +2%</p>
                <p className="text-2xl font-bold text-red-900">
                  +{formatCurrency(result.impactDevise2PourcentPlus)}
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Nouveau total: {formatCurrency(result.coutTotal + result.impactDevise2PourcentPlus)}
                </p>
              </div>
            )}
            {result.impactDevise2PourcentMoins && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <p className="text-sm text-green-700 font-semibold mb-2">Variation -2%</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(result.impactDevise2PourcentMoins)}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Nouveau total: {formatCurrency(result.coutTotal + result.impactDevise2PourcentMoins)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Informations complémentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem 
              icon={Globe} 
              label="Produit" 
              value={`${result.nomProduit} (${result.codeHs})`} 
            />
            <InfoItem 
              icon={Globe} 
              label="Destination" 
              value={result.paysDestination} 
            />
            {result.nomPort && (
              <InfoItem 
                icon={Ship} 
                label="Port" 
                value={result.nomPort} 
              />
            )}
            <InfoItem 
              icon={DollarSign} 
              label="Devise" 
              value={result.currency} 
            />
            
            <div className="pt-3 border-t border-dark-border">
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                <p className="text-xs text-amber-700 font-semibold mb-1">
                  ⚠️ Disclaimer
                </p>
                <p className="text-xs text-amber-600">
                  {result.disclaimer}
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  Source taux de change: {result.exchangeRateSource}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

const CostLine = ({ label, value, currency, bold = false, large = false }) => {
  const formatCurrency = (val, curr) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
    }).format(val)
  }

  return (
    <div className="flex justify-between items-center py-1">
      <span className={`text-gray-600 ${bold ? 'font-semibold' : ''} ${large ? 'text-base' : 'text-sm'}`}>
        {label}
      </span>
      <span className={`text-maritime-navy ${bold ? 'font-bold' : 'font-medium'} ${large ? 'text-lg' : 'text-sm'}`}>
        {formatCurrency(value, currency)}
      </span>
    </div>
  )
}

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gradient-to-br from-maritime-ocean/20 to-maritime-wave/20 border border-maritime-ocean/30 rounded-lg">
        <Icon className="w-4 h-4 text-maritime-ocean" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-maritime-navy">{value}</p>
      </div>
    </div>
  )
}

export default CostDashboard

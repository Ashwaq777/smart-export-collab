import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Ship, FileDown, Map as MapIcon, AlertCircle } from 'lucide-react'

import CountrySelect from '../components/ui/CountrySelect'
import { useMaritimeCountries } from '../hooks/useMaritimeCountries'
import { loadPortsForCountryIso2 } from '../utils/maritimeHelpers'
import { calculateShippingCost } from '../utils/portFeesCalculator'
import { generateMaritimeShippingPdf } from '../services/maritimePdfService'
import { maritimeDistanceService } from '../services/maritimeDistanceService'
import { freightRatesService } from '../services/freightRatesService'

// Fix Leaflet default icon paths (Vite)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const haversineDistanceNm = (a, b) => {
  if (!a || !b) return null
  const toRad = (deg) => (deg * Math.PI) / 180

  const lat1 = Number(a.lat)
  const lon1 = Number(a.lon)
  const lat2 = Number(b.lat)
  const lon2 = Number(b.lon)

  if ([lat1, lon1, lat2, lon2].some((n) => Number.isNaN(n))) return null

  const Rm = 6371e3
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))

  const meters = Rm * y
  const nm = meters / 1852
  return Math.round(nm)
}

const SkeletonLine = ({ className = '' }) => (
  <div className={`h-4 bg-gray-200 rounded ${className}`} />
)

export default function MaritimeShipping() {
  const { countries, loading: countriesLoading, error: countriesError } = useMaritimeCountries()

  const selectCountries = useMemo(
    () =>
      (countries || []).map((c) => ({
        ...c,
        iso2: c.iso2 || c.code,
        name: c.nameFr || c.name,
        flagPng: c.flagPng || c.flag,
      })),
    [countries]
  )

  const [distanceLoading, setDistanceLoading] = useState(false)
  const [distanceError, setDistanceError] = useState(null)
  const [distanceInfo, setDistanceInfo] = useState(null)
  const [apiDistanceNm, setApiDistanceNm] = useState(null)
  const [distanceSource, setDistanceSource] = useState(null)

  const [rateLoading, setRateLoading] = useState(false)
  const [rateError, setRateError] = useState(null)
  const [apiUnitRate, setApiUnitRate] = useState(null)

  const [originIso2, setOriginIso2] = useState('')
  const [destinationIso2, setDestinationIso2] = useState('')

  const [originPorts, setOriginPorts] = useState([])
  const [destinationPorts, setDestinationPorts] = useState([])

  const [originPortId, setOriginPortId] = useState('')
  const [destinationPortId, setDestinationPortId] = useState('')

  const [weightTonnes, setWeightTonnes] = useState('')
  const [containerType, setContainerType] = useState('20')
  const [cargoCategory, setCargoCategory] = useState('agri')
  const [incoterm, setIncoterm] = useState('CIF')

  const [manualDistanceNm, setManualDistanceNm] = useState('')

  useEffect(() => {
    const loadOriginPorts = async () => {
      setOriginPorts([])
      setOriginPortId('')
      if (!originIso2) return
      const res = await loadPortsForCountryIso2(originIso2)
      setOriginPorts(res.ports || [])
    }
    loadOriginPorts()
  }, [originIso2])

  useEffect(() => {
    const loadDestinationPorts = async () => {
      setDestinationPorts([])
      setDestinationPortId('')
      if (!destinationIso2) return
      const res = await loadPortsForCountryIso2(destinationIso2)
      setDestinationPorts(res.ports || [])
    }
    loadDestinationPorts()
  }, [destinationIso2])

  const originPort = useMemo(
    () => originPorts.find((p) => String(p.id) === String(originPortId)) || null,
    [originPorts, originPortId]
  )
  const destinationPort = useMemo(
    () => destinationPorts.find((p) => String(p.id) === String(destinationPortId)) || null,
    [destinationPorts, destinationPortId]
  )

  const computedDistanceNm = useMemo(() => {
    if (manualDistanceNm && Number(manualDistanceNm) > 0) return Math.round(Number(manualDistanceNm))
    if (apiDistanceNm && Number(apiDistanceNm) > 0) return Math.round(Number(apiDistanceNm))
    if (!originPort || !destinationPort) return null
    return haversineDistanceNm(
      { lat: originPort.latitude, lon: originPort.longitude },
      { lat: destinationPort.latitude, lon: destinationPort.longitude }
    )
  }, [manualDistanceNm, apiDistanceNm, originPort, destinationPort])

  useEffect(() => {
    const loadDistance = async () => {
      setApiDistanceNm(null)
      setDistanceError(null)
      setDistanceInfo(null)
      setDistanceSource(null)

      if (manualDistanceNm && Number(manualDistanceNm) > 0) return
      if (!originPortId || !destinationPortId) return

      setDistanceLoading(true)
      try {
        const meta = await maritimeDistanceService.getDistanceMeta({
          originPortId,
          destinationPortId,
        })
        const nm = meta?.nm ?? null
        const source = meta?.dataSource ?? null
        setApiDistanceNm(nm)
        setDistanceSource(source)

        if (!nm) {
          setDistanceError('Distance maritime indisponible')
        } else if (String(source).toUpperCase() === 'ESTIMATED') {
          setDistanceInfo('Distance estimée (mode gratuit)')
        }
      } catch {
        setDistanceError('Erreur lors du chargement de la distance maritime')
      } finally {
        setDistanceLoading(false)
      }
    }

    loadDistance()
  }, [originPortId, destinationPortId, manualDistanceNm])

  useEffect(() => {
    const loadRate = async () => {
      setApiUnitRate(null)
      setRateError(null)

      if (!originPortId || !destinationPortId) return

      setRateLoading(true)
      try {
        const rate = await freightRatesService.getUnitRateUsdPerTonnePer1000Nm({
          originPortId,
          destinationPortId,
          containerType,
          cargoCategory,
          incoterm,
        })

        setApiUnitRate(rate)
        if (!rate) {
          setRateError('Taux fret indisponible (fallback utilisé)')
        }
      } catch {
        setRateError('Erreur lors du chargement du taux de fret')
      } finally {
        setRateLoading(false)
      }
    }

    loadRate()
  }, [originPortId, destinationPortId, containerType, cargoCategory, incoterm])

  const shipping = useMemo(() => {
    const w = Number(weightTonnes)
    if (!originPort || !destinationPort || !computedDistanceNm || !w || w <= 0) return null

    const unitRate =
      apiUnitRate && Number(apiUnitRate) > 0
        ? Number(apiUnitRate)
        : cargoCategory === 'agri'
          ? 18
          : cargoCategory === 'reefer'
            ? 24
            : 20
    const base = calculateShippingCost(
      computedDistanceNm,
      w,
      originPort.fraisPortuaires || 0,
      destinationPort.fraisPortuaires || 0,
      unitRate
    )

    const containerFactor = containerType === '40' ? 1.25 : 1.0
    const incotermFactor =
      incoterm === 'EXW'
        ? 1.15
        : incoterm === 'FOB'
          ? 0.9
          : incoterm === 'DDP'
            ? 1.3
            : 1.0

    const totalCost = Math.round(base.totalCost * containerFactor * incotermFactor)

    return {
      ...base,
      totalCost,
      meta: { unitRate, containerFactor, incotermFactor },
    }
  }, [originPort, destinationPort, computedDistanceNm, weightTonnes, cargoCategory, containerType, incoterm, apiUnitRate])

  const recommendation = useMemo(() => {
    if (!shipping) return null

    const perTonne = shipping.totalCost / Number(weightTonnes)

    if (perTonne < 60) {
      return {
        level: 'Bonne option',
        text: "Coût par tonne faible. Le maritime est compétitif pour ce profil d'envoi.",
      }
    }

    if (perTonne < 120) {
      return {
        level: 'Option acceptable',
        text: 'Coût modéré. Compare avec aérien si contrainte forte de délai.',
      }
    }

    return {
      level: 'À optimiser',
      text: 'Coût élevé. Essaie un autre port, un autre type de conteneur, ou une consolidation.',
    }
  }, [shipping, weightTonnes])

  const handleDownloadPdf = async () => {
    if (!originPort || !destinationPort || !shipping) return

    generateMaritimeShippingPdf({
      originPort,
      destinationPort,
      distanceNm: computedDistanceNm,
      weightTonnes: Number(weightTonnes),
      incoterm,
      cargoCategory,
      containerType,
      shipping,
      recommendation,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-maritime-navy mb-4">Maritime Shipping</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-accent-500 to-accent-600 mx-auto mb-6"></div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sélectionne pays + ports, visualise la route et obtiens une estimation complète des coûts.
        </p>
      </div>

      {countriesError && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>{countriesError}</div>
        </div>
      )}

      {(distanceError || distanceInfo || rateError) && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <div className="font-semibold">Informations</div>
            {distanceError && <div className="text-sm">{distanceError}</div>}
            {distanceInfo && <div className="text-sm">{distanceInfo}</div>}
            {rateError && <div className="text-sm">{rateError}</div>}
          </div>
        </div>
      )}

      <div className="mb-6 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-4">
        <div className="font-semibold">Suivi des navires (AIS)</div>
        <div className="text-sm">
          Indisponible en mode gratuit. Pour activer le suivi temps réel, une API AIS payante (ou free-tier) est
          nécessaire.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sticky top-24">
            <h3 className="text-2xl font-bold text-maritime-navy mb-6 flex items-center gap-2">
              <Ship className="w-6 h-6 text-accent-500" />
              Paramètres transport
            </h3>

            <div className="space-y-5">
              <div>
                {countriesLoading ? (
                  <div className="space-y-2">
                    <SkeletonLine />
                  </div>
                ) : (
                  <CountrySelect
                    label="Pays de départ"
                    valueIso2={originIso2}
                    countries={selectCountries}
                    onChangeIso2={setOriginIso2}
                    disabled={countriesLoading}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-maritime-navy mb-2">Port de départ</label>
                <select
                  value={originPortId}
                  onChange={(e) => setOriginPortId(e.target.value)}
                  disabled={!originIso2 || originPorts.length === 0}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Sélectionner port --</option>
                  {originPorts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nomPort || p.name}
                      {p.ville || p.city ? ` - ${p.ville || p.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                {countriesLoading ? (
                  <div className="space-y-2">
                    <SkeletonLine />
                  </div>
                ) : (
                  <CountrySelect
                    label="Pays de destination"
                    valueIso2={destinationIso2}
                    countries={selectCountries}
                    onChangeIso2={setDestinationIso2}
                    disabled={countriesLoading}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-maritime-navy mb-2">Port de destination</label>
                <select
                  value={destinationPortId}
                  onChange={(e) => setDestinationPortId(e.target.value)}
                  disabled={!destinationIso2 || destinationPorts.length === 0}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Sélectionner port --</option>
                  {destinationPorts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nomPort || p.name}
                      {p.ville || p.city ? ` - ${p.ville || p.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-maritime-navy mb-2">Poids (tonnes)</label>
                  <input
                    type="number"
                    value={weightTonnes}
                    onChange={(e) => setWeightTonnes(e.target.value)}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                    placeholder="Ex: 25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-maritime-navy mb-2">Distance (NM)</label>
                  <input
                    type="number"
                    value={manualDistanceNm}
                    onChange={(e) => setManualDistanceNm(e.target.value)}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                    placeholder={computedDistanceNm ? String(computedDistanceNm) : 'Auto si ports sélectionnés'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-maritime-navy mb-2">Conteneur</label>
                  <select
                    value={containerType}
                    onChange={(e) => setContainerType(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                  >
                    <option value="20">20 ft</option>
                    <option value="40">40 ft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-maritime-navy mb-2">Fret</label>
                  <select
                    value={cargoCategory}
                    onChange={(e) => setCargoCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                  >
                    <option value="agri">Agricole</option>
                    <option value="reefer">Réfrigéré</option>
                    <option value="general">Général</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-maritime-navy mb-2">Incoterm</label>
                  <select
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                  >
                    <option value="EXW">EXW</option>
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="DDP">DDP</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleDownloadPdf}
                disabled={!shipping}
                className="w-full mt-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileDown className="w-5 h-5" />
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-maritime-navy mb-6 flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-accent-500" />
              Carte & route
            </h3>

            <div className="h-[420px] rounded-2xl overflow-hidden border border-gray-200">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <TileLayer
                  attribution='&copy; OpenSeaMap contributors'
                  url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                  opacity={0.7}
                />

                {originPort?.latitude && originPort?.longitude && (
                  <Marker position={[originPort.latitude, originPort.longitude]}>
                    <Popup>
                      <div className="font-semibold">{originPort.nomPort || originPort.name}</div>
                      <div className="text-sm">{originPort.pays || originPort.country}</div>
                    </Popup>
                  </Marker>
                )}

                {destinationPort?.latitude && destinationPort?.longitude && (
                  <Marker position={[destinationPort.latitude, destinationPort.longitude]}>
                    <Popup>
                      <div className="font-semibold">{destinationPort.nomPort || destinationPort.name}</div>
                      <div className="text-sm">{destinationPort.pays || destinationPort.country}</div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-xs font-semibold text-blue-700">Distance (NM)</div>
                <div className="text-2xl font-bold text-blue-900">
                  {distanceLoading ? '...' : computedDistanceNm || '--'}
                </div>
                {computedDistanceNm && !distanceLoading && (
                  <div className="mt-1 text-xs font-semibold text-blue-700">
                    {manualDistanceNm && Number(manualDistanceNm) > 0
                      ? 'Saisie manuellement'
                      : String(distanceSource).toUpperCase() === 'ESTIMATED'
                        ? 'Estimée'
                        : distanceSource
                          ? 'API'
                          : 'Calcul local'}
                  </div>
                )}
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-xs font-semibold text-green-700">Frais port départ</div>
                <div className="text-2xl font-bold text-green-900">${originPort?.fraisPortuaires ?? '--'}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="text-xs font-semibold text-amber-700">Frais port destination</div>
                <div className="text-2xl font-bold text-amber-900">${destinationPort?.fraisPortuaires ?? '--'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-maritime-navy mb-6">Estimation</h3>

            {!shipping ? (
              <div className="text-gray-600">
                Sélectionne deux ports et un poids pour afficher l’estimation.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-600">Base shipping</div>
                    <div className="text-2xl font-bold text-gray-900">${shipping.baseShippingCost}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-600">Frais ports</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${Number(shipping.originPortFees) + Number(shipping.destPortFees)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-4 border border-accent-600 text-white">
                    <div className="text-xs font-semibold opacity-90">Total estimé</div>
                    <div className="text-3xl font-extrabold">${shipping.totalCost}</div>
                  </div>
                </div>

                {recommendation && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="text-sm font-bold text-blue-900">{recommendation.level}</div>
                    <div className="text-sm text-blue-800 mt-1">{recommendation.text}</div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  Hypothèses: taux unitaire ({rateLoading ? '...' : shipping.meta.unitRate} USD/tonne/1000NM), facteur conteneur ({shipping.meta.containerFactor}), facteur incoterm ({shipping.meta.incotermFactor}).
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Calculator as CalcIcon, Download, AlertCircle } from 'lucide-react'
import { tarifService, portService, calculationService, pdfService } from '../services/api'
import { countriesService } from '../services/countriesApi'
import { worldPortsService } from '../services/worldPortsApi'
import { agriculturalProductsService } from '../services/agriculturalProductsApi'
import { useMaritimeCountries } from '../hooks/useMaritimeCountries'
import CostDashboard from '../components/CostDashboard'
import { WORLD_CURRENCIES } from '../data/worldCurrencies'
import { updateExchangeRates } from '../utils/currencyConverter'

function Calculator() {
  const {
    countries: maritimeCountries,
    loading: maritimeCountriesLoading,
    error: maritimeCountriesError,
  } = useMaritimeCountries()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [countries, setCountries] = useState([])
  const [countriesError, setCountriesError] = useState(null)
  const [countriesData, setCountriesData] = useState([]) // Pour drapeaux et devises - affichage uniquement
  const [ports, setPorts] = useState([])
  const [portMessage, setPortMessage] = useState(null)
  const [portsLoading, setPortsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    categorie: '',
    codeHs: '',
    paysDestination: '',
    portId: '',
    valeurFob: '',
    coutTransport: '',
    assurance: '',
    currency: 'MAD',
    // Legal identifiers
    nomEntreprise: '',
    registreCommerce: '',
    ice: '',
    // Incoterm
    incoterm: 'CIF',
    // Profitability
    prixVentePrevisionnel: '',
    // Logistics
    poidsNet: '',
    poidsBrut: '',
    typeUnite: '',
  })
  
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCategories()
    loadCountries()
  }, [])

  useEffect(() => {
    if (formData.categorie) {
      loadProductsByCategory(formData.categorie)
    }
  }, [formData.categorie])

  const loadCategories = async () => {
    try {
      // Charger les catégories depuis le service agricole (Fruits, Légumes UNIQUEMENT)
      const agriculturalCategories = agriculturalProductsService.getCategories()
      setCategories(agriculturalCategories)
    } catch (err) {
      console.error('Error loading categories:', err)
      // Fallback vers backend si erreur
      try {
        const response = await tarifService.getCategories()
        setCategories(response.data)
      } catch (backendErr) {
        console.error('Error loading backend categories:', backendErr)
      }
    }
  }

  // Helper function to normalize country names for matching
  const normalizeCountryName = (name) => {
    const nameMap = {
      'United States': 'États-Unis',
      'USA': 'États-Unis',
      'South Africa': 'Afrique du Sud',
      'United Kingdom': 'Royaume-Uni',
      'UK': 'Royaume-Uni',
      'UAE': 'Émirats arabes unis',
      'United Arab Emirates': 'Émirats arabes unis',
      'China': 'Chine',
      'India': 'Inde',
      'Japan': 'Japon',
      'South Korea': 'Corée du Sud',
      'Brazil': 'Brésil',
      'Egypt': 'Égypte',
      'Morocco': 'Maroc',
      'Ivory Coast': 'Côte d\'Ivoire',
      'Cote d\'Ivoire': 'Côte d\'Ivoire'
    }
    return nameMap[name] || name
  }

  const loadCountries = async () => {
    try {
      setCountriesError(null)
      // Charger les pays avec devises depuis REST Countries API
      const countriesWithCurrencies = await countriesService.getAll()
      
      // Stocker les données complètes pour référence
      setCountriesData(countriesWithCurrencies)
      
      // Update exchange rates for real-time currency conversion
      updateExchangeRates(countriesWithCurrencies)

      let maritimeCountriesRest = []
      try {
        maritimeCountriesRest = await countriesService.getMaritimeCountries()
      } catch {
        maritimeCountriesRest = []
      }
      // maritimeCountriesRest is used to build the final maritime-only list for the dropdown
      
      // Important: do NOT intersect with backend tariff countries here.
      // Some deployments return only "France" from the backend, which would reduce the list to a single country.
      const maritimeCountryNames = (maritimeCountriesRest || []).map((c) => c.name).filter(Boolean)

      if (!maritimeCountryNames.length) {
        setCountriesError(
          "Impossible de charger la liste complète des pays (REST Countries indisponible). Liste de secours utilisée."
        )
      }

      setCountries(maritimeCountryNames)
      
    } catch (err) {
      setCountriesError(
        "Erreur lors du chargement des pays (REST Countries indisponible). Liste de secours utilisée."
      )
      try {
        const fallback = await countriesService.getMaritimeCountries()
        setCountries((fallback || []).map((c) => c.name).filter(Boolean))
      } catch {
        setCountries([])
      }
    }
  }

  const loadProductsByCategory = async (category) => {
    try {
      // Charger les produits agricoles depuis le service (Bananes, Tomates, etc.)
      const agriculturalProducts = agriculturalProductsService.getProductsByCategory(category)
      
      // Formater pour compatibilité avec le backend
      const formattedProducts = agriculturalProducts.map(product => ({
        id: product.id,
        codeHs: product.codeHs,
        nomProduit: product.nom,
        categorie: product.categorie,
        description: product.description
      }))
      
      setProducts(formattedProducts)
    } catch (err) {
      console.error('Error loading agricultural products:', err)
      // Fallback vers backend si erreur
      try {
        const response = await tarifService.getProductsByCategory(category)
        const uniqueProducts = response.data.reduce((acc, product) => {
          if (!acc.find(p => p.codeHs === product.codeHs)) {
            acc.push(product)
          }
          return acc
        }, [])
        setProducts(uniqueProducts)
      } catch (backendErr) {
        console.error('Error loading backend products:', backendErr)
      }
    }
  }

  const loadPortsByCountry = async (country) => {
    if (!country) {
      setPorts([])
      setPortMessage(null)
      return
    }
    
    setPortsLoading(true)
    setPortMessage(null)
    
    try {
      // Normalize country name for consistent matching
      const normalizedCountry = normalizeCountryName(country)
      
      // Récupérer les données du pays pour vérifier s'il est enclavé
      const countryData = countriesData.find(c => c.name === country || c.name === normalizedCountry)
      
      // Charger les ports depuis le service mondial avec couverture 100% (use normalized name)
      const portsResult = await worldPortsService.getPortsByCountry(normalizedCountry, countryData)
      
      if (portsResult.hasPorts && portsResult.ports.length > 0) {
        // Utiliser les ports réels de la base UNCTAD avec frais calculés
        const portsWithFees = portsResult.ports.map((port, index) => {
          // Extraire les frais depuis la structure UNCTAD
          const totalFees = port.totalFees || port.fees?.THC || 500
          
          return {
            id: port.id || `${country.toLowerCase()}-${index + 1}`,
            nom: port.name,
            nomPort: port.name,
            ville: port.city,
            pays: country,
            countryCode: port.countryCode,
            typePort: 'Maritime',
            capacity: port.capacity,
            fraisPortuaires: totalFees, // Frais UNCTAD réels
            currency: port.currency || 'USD',
            region: port.region,
            fees: port.fees, // Structure complète des frais (THC, pilotage, etc.)
            coordinates: port.coordinates,
            isGeneric: false // Tous les ports UNCTAD sont réels
          }
        })

        setPorts(portsWithFees)
        setPortMessage(null)
      } else {
        setPorts([])
        setPortMessage(portsResult.message || `Aucun port disponible pour ${country}`)
      }
    } catch (err) {
      console.error('❌ [Calculator] Error loading ports from API:', err)
      console.error('❌ [Calculator] Error stack:', err.stack)
      setPorts([])
      setPortMessage('Erreur lors du chargement des ports')
    } finally {
      setPortsLoading(false)
    }
  }

  const handleInputChange = async (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (name === 'categorie') {
      setFormData(prev => ({ ...prev, codeHs: '' }))
      setProducts([])
    }
    
    if (name === 'paysDestination') {
      setFormData(prev => ({ ...prev, portId: '' }))
      setPorts([])
      setPortMessage(null)
      
      // Charger automatiquement la devise du pays sélectionné
      if (value) {
        try {
          const countryData = countriesData.find(c => c.name === value)
          if (countryData && countryData.currency) {
            setFormData(prev => ({
              ...prev,
              currency: countryData.currency.code
            }))
          }
        } catch (err) {
        }
        
        // Charger les ports pour ce pays
        loadPortsByCountry(value)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const calculationData = {
        codeHs: formData.codeHs,
        paysDestination: formData.paysDestination,
        valeurFob: parseFloat(formData.valeurFob),
        coutTransport: parseFloat(formData.coutTransport) || 0,
        assurance: parseFloat(formData.assurance),
        currency: formData.currency,
        portId: formData.portId ? parseInt(formData.portId) : null,
        nomEntreprise: formData.nomEntreprise || null,
        registreCommerce: formData.registreCommerce || null,
        ice: formData.ice || null,
        incoterm: formData.incoterm || 'CIF',
        prixVentePrevisionnel: formData.prixVentePrevisionnel ? parseFloat(formData.prixVentePrevisionnel) : null,
        poidsNet: formData.poidsNet ? parseFloat(formData.poidsNet) : null,
        poidsBrut: formData.poidsBrut ? parseFloat(formData.poidsBrut) : null,
        typeUnite: formData.typeUnite || null
      }
      
      const response = await calculationService.calculateLandedCost(calculationData)

      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du calcul')
      console.error('Calculation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const calculationData = {
        codeHs: formData.codeHs,
        paysDestination: formData.paysDestination,
        valeurFob: parseFloat(formData.valeurFob) || 0,
        coutTransport: parseFloat(formData.coutTransport) || 0,
        assurance: parseFloat(formData.assurance) || 0,
        currency: formData.currency || 'USD',
        portId: formData.portId ? parseInt(formData.portId) : null,
        nomEntreprise: formData.nomEntreprise || null,
        registreCommerce: formData.registreCommerce || null,
        ice: formData.ice || null,
        incoterm: formData.incoterm || null,
        prixVentePrevisionnel: parseFloat(formData.prixVentePrevisionnel) || null,
        poidsNet: parseFloat(formData.poidsNet) || null,
        poidsBrut: parseFloat(formData.poidsBrut) || null,
        typeUnite: formData.typeUnite || null,
      }
      
      const pdfBlob = await pdfService.generateLandedCostPdf(calculationData)
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `landed_cost_${formData.codeHs.replace('.', '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Erreur lors de la génération du PDF')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-maritime-navy mb-4">
          Export Duties Calculator
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-accent-500 to-accent-600 mx-auto mb-6"></div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Calculate complete import costs including customs duties, VAT, parafiscal taxes and port fees
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sticky top-24">
            <h3 className="text-2xl font-bold text-maritime-navy mb-6 flex items-center gap-2">
              <CalcIcon className="w-6 h-6 text-accent-500" />
              Product Information
            </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Catégorie
              </label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
              >
                <option value="" className="bg-dark-hover text-white">Sélectionnez une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-dark-hover text-white">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Pays de destination
              </label>
              {maritimeCountriesError && (
                <div className="mb-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  {maritimeCountriesError}
                </div>
              )}
              {countriesError && (
                <div className="mb-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  {countriesError}
                </div>
              )}
              <select
                name="paysDestination"
                value={formData.paysDestination}
                onChange={handleInputChange}
                required
                disabled={maritimeCountriesLoading}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
              >
                <option value="">
                  {maritimeCountriesLoading ? '-- Chargement pays --' : '-- Sélectionner pays --'}
                </option>
                {(maritimeCountries || []).map((c) => (
                  <option key={c.iso2 || c.code} value={c.nameFr || c.name}>
                    {c.flagEmoji ? `${c.flagEmoji} ` : ''}{c.nameFr || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Port (destination)
              </label>

              {portsLoading ? (
                <div className="text-sm text-gray-500">Chargement des ports...</div>
              ) : (
                <select
                  name="portId"
                  value={formData.portId}
                  onChange={handleInputChange}
                  disabled={!formData.paysDestination || ports.length === 0}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Sélectionner port --</option>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nomPort || p.nom || p.name}
                      {p.ville ? ` - ${p.ville}` : ''}
                      {p.fraisPortuaires ? ` | ${p.fraisPortuaires} USD` : ''}
                    </option>
                  ))}
                </select>
              )}

              {portMessage && (
                <div className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  {portMessage}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Produit
              </label>
              <select
                name="codeHs"
                value={formData.codeHs}
                onChange={handleInputChange}
                required
                disabled={!formData.categorie}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-dark-hover text-white">Sélectionnez un produit</option>
                {products.map(product => (
                  <option key={product.id} value={product.codeHs} className="bg-dark-hover text-white">
                    {product.nomProduit} ({product.codeHs})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Valeur CIF (FOB)
              </label>
              <input
                type="number"
                name="valeurFob"
                value={formData.valeurFob}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0.01"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Coût de transport
              </label>
              <input
                type="number"
                name="coutTransport"
                value={formData.coutTransport}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Assurance
              </label>
              <input
                type="number"
                name="assurance"
                value={formData.assurance}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Devise
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
              >
                {WORLD_CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Legal Identifiers */}
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-bold text-maritime-navy mb-3">Informations Légales (optionnel)</h4>
              
              <div className="space-y-3">
                <input
                  type="text"
                  name="nomEntreprise"
                  value={formData.nomEntreprise}
                  onChange={handleInputChange}
                  placeholder="Nom Entreprise"
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                />
                
                <input
                  type="text"
                  name="registreCommerce"
                  value={formData.registreCommerce}
                  onChange={handleInputChange}
                  placeholder="Registre Commerce (RC)"
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                />
                
                <input
                  type="text"
                  name="ice"
                  value={formData.ice}
                  onChange={handleInputChange}
                  placeholder="ICE"
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Incoterm */}
            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Incoterm
              </label>
              <select
                name="incoterm"
                value={formData.incoterm}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
              >
                <option value="FOB">FOB (Free On Board)</option>
                <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                <option value="EXW">EXW (Ex Works)</option>
                <option value="DDP">DDP (Delivered Duty Paid)</option>
              </select>
            </div>

            {/* Profitability */}
            <div>
              <label className="block text-sm font-semibold text-maritime-navy mb-2">
                Prix de vente prévisionnel (optionnel)
              </label>
              <input
                type="number"
                name="prixVentePrevisionnel"
                value={formData.prixVentePrevisionnel}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="Pour analyse de rentabilité"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
              />
            </div>

            {/* Logistics Details */}
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-bold text-maritime-navy mb-3">Détails Logistiques (optionnel)</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="poidsNet"
                  value={formData.poidsNet}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Poids Net (kg)"
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                />
                
                <input
                  type="number"
                  name="poidsBrut"
                  value={formData.poidsBrut}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Poids Brut (kg)"
                  className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200"
                />
              </div>
              
              <input
                type="text"
                name="typeUnite"
                value={formData.typeUnite}
                onChange={handleInputChange}
                placeholder="Type Unité (ex: conteneur 40')"
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 hover:border-gray-400 transition-all duration-200 mt-3"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white py-4 px-6 rounded-lg font-bold text-base shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Calculating...' : 'Calculate Landed Cost'}
            </button>
          </form>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-3">
          {result && (
            <div className="space-y-6">
              <CostDashboard result={result} />
              
              <button
                onClick={handleDownloadPdf}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-4 px-6 rounded-lg font-bold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download PDF Report
              </button>
            </div>
          )}
          
          {!result && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CalcIcon className="h-12 w-12 text-accent-600" />
              </div>
              <h3 className="text-2xl font-bold text-maritime-navy mb-3">
                Ready to Calculate?
              </h3>
              <p className="text-gray-600 text-lg">
                Fill in the form to see your complete import cost breakdown
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calculator

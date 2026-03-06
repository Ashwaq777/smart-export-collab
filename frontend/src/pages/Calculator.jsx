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
    <div className="maritime-calculator">
      {/* Header Section */}
      <div className="calculator-header">
        <div className="header-content">
          <div className="header-icon">
            <CalcIcon className="w-8 h-8" />
          </div>
          <div className="header-text">
            <h1 className="header-title">Export Duties Calculator</h1>
            <p className="header-subtitle">
              Calculate complete import costs including customs duties, VAT, parafiscal taxes and port fees
            </p>
          </div>
        </div>
        <div className="header-accent"></div>
      </div>

      <div className="calculator-container">
        {/* Left Column - Form */}
        <div className="form-column">
          <div className="form-card">
            <div className="card-header">
              <CalcIcon className="card-icon" />
              <h2 className="card-title">Product Information</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="calculator-form">
              {/* Basic Information Card */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Catégorie
                    </label>
                    <select
                      name="categorie"
                      value={formData.categorie}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Pays de destination
                    </label>
                    {maritimeCountriesError && (
                      <div className="form-error">
                        {maritimeCountriesError}
                      </div>
                    )}
                    {countriesError && (
                      <div className="form-error">
                        {countriesError}
                      </div>
                    )}
                    <select
                      name="paysDestination"
                      value={formData.paysDestination}
                      onChange={handleInputChange}
                      required
                      disabled={maritimeCountriesLoading}
                      className="form-select"
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

                  <div className="form-group">
                    <label className="form-label">
                      Port (destination)
                    </label>
                    {portsLoading ? (
                      <div className="loading-text">Chargement des ports...</div>
                    ) : (
                      <select
                        name="portId"
                        value={formData.portId}
                        onChange={handleInputChange}
                        disabled={!formData.paysDestination || ports.length === 0}
                        className="form-select"
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
                      <div className="form-warning">
                        {portMessage}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Produit
                    </label>
                    <select
                      name="codeHs"
                      value={formData.codeHs}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.categorie}
                      className="form-select"
                    >
                      <option value="">Sélectionnez un produit</option>
                      {products.map(product => (
                        <option key={product.id} value={product.codeHs}>
                          {product.nomProduit} ({product.codeHs})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Information Card */}
              <div className="form-section">
                <h3 className="section-title">Financial Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
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
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
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
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
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
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Devise
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {WORLD_CURRENCIES.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Legal Information Card */}
              <div className="form-section">
                <h3 className="section-title">Informations Légales (optionnel)</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Nom Entreprise
                    </label>
                    <input
                      type="text"
                      name="nomEntreprise"
                      value={formData.nomEntreprise}
                      onChange={handleInputChange}
                      placeholder="Nom Entreprise"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Registre Commerce (RC)
                    </label>
                    <input
                      type="text"
                      name="registreCommerce"
                      value={formData.registreCommerce}
                      onChange={handleInputChange}
                      placeholder="Registre Commerce (RC)"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      ICE
                    </label>
                    <input
                      type="text"
                      name="ice"
                      value={formData.ice}
                      onChange={handleInputChange}
                      placeholder="ICE"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Incoterm
                    </label>
                    <select
                      name="incoterm"
                      value={formData.incoterm}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="FOB">FOB (Free On Board)</option>
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                      <option value="DDP">DDP (Delivered Duty Paid)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="form-section">
                <h3 className="section-title">Additional Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
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
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Poids Net (kg)
                    </label>
                    <input
                      type="number"
                      name="poidsNet"
                      value={formData.poidsNet}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="Poids Net (kg)"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Poids Brut (kg)
                    </label>
                    <input
                      type="number"
                      name="poidsBrut"
                      value={formData.poidsBrut}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="Poids Brut (kg)"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Type Unité
                    </label>
                    <input
                      type="text"
                      name="typeUnite"
                      value={formData.typeUnite}
                      onChange={handleInputChange}
                      placeholder="Type Unité (ex: conteneur 40')"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="form-error-card">
                  <AlertCircle className="error-icon" />
                  <p className="error-text">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Calculating...' : 'Calculate Landed Cost'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="results-column">
          {result && (
            <div className="results-container">
              <div className="results-card">
                <CostDashboard result={result} />
              </div>
              
              <button
                onClick={handleDownloadPdf}
                className="download-button"
              >
                <Download className="button-icon" />
                Download PDF Report
              </button>
            </div>
          )}
          
          {!result && (
            <div className="placeholder-card">
              <div className="placeholder-icon">
                <CalcIcon className="w-12 h-12" />
              </div>
              <h3 className="placeholder-title">Ready to Calculate?</h3>
              <p className="placeholder-text">
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

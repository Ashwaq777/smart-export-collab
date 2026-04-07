import React, { useState, useEffect } from 'react'
import { Calculator as CalcIcon, Download, AlertCircle } from 'lucide-react'
import { tarifService, portService, calculationService, pdfService } from '../services/api'
import CostDashboard from '../components/CostDashboard'

function Calculator() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [countries, setCountries] = useState([])
  const [ports, setPorts] = useState([])
  
  const [formData, setFormData] = useState({
    categorie: '',
    codeHs: '',
    paysDestination: '',
    portId: '',
    valeurFob: '',
    coutTransport: '',
    assurance: '',
    currency: 'MAD'
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

  useEffect(() => {
    if (formData.paysDestination) {
      loadPortsByCountry(formData.paysDestination)
    }
  }, [formData.paysDestination])

  const loadCategories = async () => {
    try {
      const response = await tarifService.getCategories()
      setCategories(response.data)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadCountries = async () => {
    try {
      const response = await tarifService.getCountries()
      setCountries(response.data)
    } catch (err) {
      console.error('Error loading countries:', err)
    }
  }

  const loadProductsByCategory = async (category) => {
    try {
      const response = await tarifService.getProductsByCategory(category)
      // Filtrer pour ne garder qu'un seul produit par code HS
      const uniqueProducts = response.data.reduce((acc, product) => {
        if (!acc.find(p => p.codeHs === product.codeHs)) {
          acc.push(product)
        }
        return acc
      }, [])
      setProducts(uniqueProducts)
    } catch (err) {
      console.error('Error loading products:', err)
    }
  }

  const loadPortsByCountry = async (country) => {
    try {
      const response = await portService.getByCountry(country)
      setPorts(response.data)
    } catch (err) {
      console.error('Error loading ports:', err)
      setPorts([])
    }
  }

  const handleInputChange = (e) => {
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
        coutTransport: parseFloat(formData.coutTransport),
        assurance: parseFloat(formData.assurance),
        currency: formData.currency,
        portId: formData.portId ? parseInt(formData.portId) : null
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
        valeurFob: parseFloat(formData.valeurFob),
        coutTransport: parseFloat(formData.coutTransport),
        assurance: parseFloat(formData.assurance),
        currency: formData.currency,
        portId: formData.portId ? parseInt(formData.portId) : null
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
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <CalcIcon className="mr-3 h-8 w-8 text-primary-600" />
          Calculateur de Landed Cost
        </h1>
        <p className="mt-2 text-gray-600">
          Calculez les coûts d'importation complets incluant douane, TVA, taxes parafiscales et frais portuaires
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Informations du produit</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produit
              </label>
              <select
                name="codeHs"
                value={formData.codeHs}
                onChange={handleInputChange}
                required
                disabled={!formData.categorie}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Sélectionnez un produit</option>
                {products.map(product => (
                  <option key={product.id} value={product.codeHs}>
                    {product.nomProduit} ({product.codeHs})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="MAD">MAD - Dirham marocain</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar américain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays de destination
              </label>
              <select
                name="paysDestination"
                value={formData.paysDestination}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sélectionnez un pays</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port de destination (optionnel)
              </label>
              <select
                name="portId"
                value={formData.portId}
                onChange={handleInputChange}
                disabled={!formData.paysDestination}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Sélectionnez un port</option>
                {ports.map(port => (
                  <option key={port.id} value={port.id}>
                    {port.nomPort} ({port.typePort}) - {port.fraisPortuaires} {formData.currency}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Calcul en cours...' : 'Calculer le Landed Cost'}
            </button>
          </form>
        </div>

        <div>
          {result && (
            <>
              <CostDashboard result={result} />
              
              <button
                onClick={handleDownloadPdf}
                className="mt-4 w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Télécharger le PDF
              </button>
            </>
          )}
          
          {!result && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <CalcIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Remplissez le formulaire pour voir les résultats du calcul
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calculator

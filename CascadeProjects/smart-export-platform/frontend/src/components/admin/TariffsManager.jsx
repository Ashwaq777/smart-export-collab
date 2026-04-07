import React, { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { tarifService } from '../../services/api'

function TariffsManager() {
  const [tariffs, setTariffs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [countries, setCountries] = useState([])

  useEffect(() => {
    loadTariffs()
    loadCountries()
  }, [])

  const loadTariffs = async () => {
    setLoading(true)
    try {
      const response = await tarifService.getAll()
      setTariffs(response.data || [])
    } catch (error) {
      console.error('Error loading tariffs:', error)
      setTariffs([])
    } finally {
      setLoading(false)
    }
  }

  const loadCountries = async () => {
    try {
      const response = await tarifService.getCountries()
      setCountries(response.data || [])
    } catch (error) {
      console.error('Error loading countries:', error)
      setCountries([])
    }
  }

  const filteredTariffs = tariffs.filter(tariff => {
    const matchesSearch = 
      tariff.nomProduit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tariff.codeHs.includes(searchTerm) ||
      tariff.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCountry = !filterCountry || tariff.paysDestination === filterCountry
    
    return matchesSearch && matchesCountry
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par produit, code HS ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="relative sm:w-64">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
          >
            <option value="">Tous les pays</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Cette vue affiche tous les tarifs douaniers configurés. 
          Pour modifier les taux, utilisez l'onglet "Produits".
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code HS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux Douane
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux TVA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxe Parafiscale
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTariffs.map((tariff) => (
                <tr key={tariff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {tariff.codeHs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tariff.nomProduit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {tariff.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tariff.paysDestination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {tariff.tauxDouane}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {tariff.tauxTva}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {tariff.taxeParafiscale}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTariffs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun tarif trouvé
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TariffsManager

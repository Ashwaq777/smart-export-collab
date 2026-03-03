import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, DollarSign } from 'lucide-react'
import { portService } from '../../services/api'
import { worldPortsService } from '../../services/worldPortsApi'
import { REAL_PORTS_DATABASE } from '../../data/realPortsDatabase'
import { WORLD_CURRENCIES } from '../../data/worldCurrencies'
import exchangeRateService from '../../services/exchangeRateService'
import { getCountryISO2, getFlagEmojiFromIso2 } from '../../utils/countryFlags'

function PortsManager() {
  const [ports, setPorts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPort, setSelectedPort] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [exchangeRates, setExchangeRates] = useState({})
  const [editingPort, setEditingPort] = useState(null)
  const [formData, setFormData] = useState({
    nomPort: '',
    pays: '',
    typePort: 'Maritime',
    fraisPortuaires: ''
  })

  useEffect(() => {
    loadPorts()
    loadExchangeRates()
  }, [])

  const loadPorts = async () => {
    setLoading(true)
    try {
      // Charger les ports depuis la base UNCTAD réelle
      const allPorts = worldPortsService.getAllPorts()
      setPorts(allPorts)
    } catch (error) {
      console.error('Error loading ports:', error)
      setPorts([])
    } finally {
      setLoading(false)
    }
  }

  const loadExchangeRates = async () => {
    try {
      const rates = await exchangeRateService.getExchangeRates()
      setExchangeRates(rates)
    } catch (error) {
      console.error('Error loading exchange rates:', error)
    }
  }

  const convertCurrency = (usdAmount, targetCurrency) => {
    if (targetCurrency === 'USD') return usdAmount
    const rate = exchangeRates[targetCurrency]
    if (!rate) return usdAmount
    return (usdAmount * rate).toFixed(2)
  }

  const getCurrencySymbol = (currencyCode) => {
    const currency = WORLD_CURRENCIES.find(c => c.code === currencyCode)
    return currency ? currency.symbol : currencyCode
  }

  const CountryFlag = ({ countryName, iso2Hint }) => {
    const iso2 = (iso2Hint || getCountryISO2(countryName) || '').toLowerCase()
    if (!iso2 || iso2.length !== 2) {
      return <span className="text-lg">🌐</span>
    }

    const emoji = getFlagEmojiFromIso2(iso2)
    return (
      <span className="inline-flex items-center">
        <span className="text-lg leading-none" aria-hidden="true">
          {emoji}
        </span>
        <img
          src={`https://flagcdn.com/24x18/${iso2}.png`}
          srcSet={`https://flagcdn.com/48x36/${iso2}.png 2x`}
          width="24"
          height="18"
          alt={countryName || iso2.toUpperCase()}
          className="-ml-6 rounded-sm border border-gray-200"
          onLoad={(e) => {
            const wrapper = e.currentTarget.parentElement
            const emojiEl = wrapper?.firstElementChild
            if (emojiEl) emojiEl.style.display = 'none'
            e.currentTarget.classList.remove('-ml-6')
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </span>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        fraisPortuaires: parseFloat(formData.fraisPortuaires)
      }

      if (editingPort) {
        await portService.update(editingPort.id, data)
      } else {
        await portService.create(data)
      }

      loadPorts()
      closeModal()
    } catch (error) {
      console.error('Error saving port:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce port ?')) {
      try {
        await portService.delete(id)
        loadPorts()
      } catch (error) {
        console.error('Error deleting port:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const openModal = (port = null) => {
    if (port) {
      setEditingPort(port)
      setFormData({
        nomPort: port.nomPort,
        pays: port.pays,
        typePort: port.typePort,
        fraisPortuaires: port.fraisPortuaires.toString()
      })
    } else {
      setEditingPort(null)
      setFormData({
        nomPort: '',
        pays: '',
        typePort: 'Maritime',
        fraisPortuaires: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPort(null)
  }

  const filteredPorts = ports.filter(port =>
    port.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    port.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    port.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const showPortDetails = (port) => {
    setSelectedPort(port)
    setShowDetailsModal(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un port..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Display Currency:
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="MAD">MAD (MAD)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="INR">INR (₹)</option>
              <option value="AED">AED (AED)</option>
              <option value="SAR">SAR (SR)</option>
              <option value="BRL">BRL (R$)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CHF">CHF (CHF)</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="ml-4 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Port
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Port Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  THC (per TEU)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Port Dues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPorts.map((port, index) => (
                <tr key={port.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {port.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {port.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CountryFlag countryName={port.country || port.pays} iso2Hint={port.countryCode} />
                      <span className="ml-1">{port.country || port.pays}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {port.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {getCurrencySymbol(selectedCurrency)}{convertCurrency(port.fees?.THC || 0, selectedCurrency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCurrencySymbol(selectedCurrency)}{convertCurrency(port.fees?.portDues || 0, selectedCurrency)}/GRT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {port.region}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => showPortDetails(port)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                      title="View Details"
                    >
                      <DollarSign className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPorts.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No ports found matching your search.
            </div>
          )}
        </div>
      )}

      {showDetailsModal && selectedPort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold mb-4 text-maritime-navy">
              {selectedPort.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-semibold">{selectedPort.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-semibold">{selectedPort.country} ({selectedPort.countryCode})</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Region</p>
                <p className="font-semibold">{selectedPort.region}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="font-semibold">{selectedPort.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity (TEU)</p>
                <p className="font-semibold">{selectedPort.capacity?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Coordinates</p>
                <p className="font-semibold text-xs">{selectedPort.coordinates?.lat}, {selectedPort.coordinates?.lon}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-bold text-lg mb-3">Fee Breakdown (UNCTAD Official Rates)</h4>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-700">Terminal Handling Charge (THC) per TEU:</span>
                  <span className="font-bold">${selectedPort.fees?.THC}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Port Dues (per GRT):</span>
                  <span className="font-bold">${selectedPort.fees?.portDues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Pilotage:</span>
                  <span className="font-bold">${selectedPort.fees?.pilotage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Mooring:</span>
                  <span className="font-bold">${selectedPort.fees?.mooring}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Documentation:</span>
                  <span className="font-bold">${selectedPort.fees?.documentation}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold text-maritime-navy">Estimated Total (1 TEU, 10000 GRT):</span>
                  <span className="font-bold text-accent-600">
                    ${(selectedPort.fees?.THC + (selectedPort.fees?.portDues * 10000) + selectedPort.fees?.pilotage + selectedPort.fees?.mooring + selectedPort.fees?.documentation).toFixed(0)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                Source: UNCTAD Review of Maritime Transport - Official Published Data
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingPort ? 'Modifier le port' : 'Nouveau port'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du port
                </label>
                <input
                  type="text"
                  value={formData.nomPort}
                  onChange={(e) => setFormData({ ...formData, nomPort: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.pays}
                  onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de port
                </label>
                <select
                  value={formData.typePort}
                  onChange={(e) => setFormData({ ...formData, typePort: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Maritime">Maritime</option>
                  <option value="Aérien">Aérien</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frais portuaires (EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fraisPortuaires}
                  onChange={(e) => setFormData({ ...formData, fraisPortuaires: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingPort ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortsManager

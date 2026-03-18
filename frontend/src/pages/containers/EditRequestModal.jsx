import { useState, useEffect } from 'react'
import containerService from '../../services/containerService'
import { worldPortsService } from '../../services/worldPortsApi'
import { countriesService } from '../../services/countriesApi'

const EditRequestModal = ({ request, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    loadingLocation: '',
    containerType: 'STANDARD_20',
    cargoType: 'DRY',
    requiredDate: '',
    size: 'STANDARD'
  })
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const [ports, setPorts] = useState([])
  const [portsLoading, setPortsLoading] = useState(false)
  const [countriesLoading, setCountriesLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')

  const containerTypes = ['STANDARD_20', 'STANDARD_40', 'HIGH_CUBE_40', 'REEFER_20', 'REEFER_40']
  const cargoTypes = ['DRY', 'REEFER', 'DANGEROUS', 'PERISHABLE']

  useEffect(() => {
    if (request) {
      setFormData({
        loadingLocation: request.loadingLocation || '',
        containerType: request.containerType || 'STANDARD_20',
        cargoType: request.cargoType || 'DRY',
        requiredDate: request.requiredDate || '',
        size: request.size || 'STANDARD'
      })
    }
    loadCountries()
  }, [request])

  const loadCountries = async () => {
    setCountriesLoading(true)
    try {
      const maritimeCountries = await countriesService.getMaritimeCountries()
      setCountries(maritimeCountries || [])
    } catch (error) {
      console.error('Error loading countries:', error)
      setCountries([])
    } finally {
      setCountriesLoading(false)
    }
  }

  const loadPortsByCountry = async (country) => {
    if (!country) {
      setPorts([])
      return
    }
    
    setPortsLoading(true)
    try {
      const portsResult = await worldPortsService.getPortsByCountry(country)
      
      if (portsResult.hasPorts && portsResult.ports.length > 0) {
        const portsWithFees = portsResult.ports.map((port, index) => ({
          id: port.id || `${country.toLowerCase()}-${index + 1}`,
          nom: port.name,
          nomPort: port.name,
          ville: port.city,
          pays: country,
          coordinates: port.coordinates
        }))
        setPorts(portsWithFees)
      } else {
        setPorts([])
      }
    } catch (error) {
      console.error('Error loading ports:', error)
      setPorts([])
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
  }

  const handleCountryChange = async (e) => {
    const country = e.target.value
    setSelectedCountry(country)
    setFormData(prev => ({ ...prev, loadingLocation: '' }))
    setPorts([])
    if (country) {
      loadPortsByCountry(country)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await containerService.updateRequest(request.id, formData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Erreur lors de la mise à jour de la demande')
    } finally {
      setLoading(false)
    }
  }

  if (!request) return null

  return (
    <div style={{ 
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Modifier la Demande</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pays
            </label>
            {countriesLoading ? (
              <div className="text-sm text-gray-500">Chargement des pays...</div>
            ) : (
              <select
                name="country"
                value={selectedCountry}
                onChange={handleCountryChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Sélectionner pays --</option>
                {countries.map((c) => (
                  <option key={c.iso2 || c.code} value={c.nameFr || c.name}>
                    {c.flagEmoji ? `${c.flagEmoji} ` : ''}{c.nameFr || c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Port Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Port de Chargement
            </label>
            {portsLoading ? (
              <div className="text-sm text-gray-500">Chargement des ports...</div>
            ) : (
              <select
                name="loadingLocation"
                value={formData.loadingLocation}
                onChange={handleInputChange}
                required
                disabled={!selectedCountry || ports.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Sélectionner port --</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.nomPort || p.nom}>
                    {p.nomPort || p.nom}
                    {p.ville ? ` - ${p.ville}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Container Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de Conteneur
            </label>
            <select
              name="containerType"
              value={formData.containerType}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {containerTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Cargo Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de Cargo
            </label>
            <select
              name="cargoType"
              value={formData.cargoType}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cargoTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Required Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Requise
            </label>
            <input
              type="date"
              name="requiredDate"
              value={formData.requiredDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taille
            </label>
            <select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STANDARD">Standard</option>
              <option value="HIGH_CUBE">High Cube</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRequestModal

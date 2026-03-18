import { useState, useEffect } from 'react'
import containerService from '../../services/containerService'
import { worldPortsService } from '../../services/worldPortsApi'
import { countriesService } from '../../services/countriesApi'

const CreateOfferModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    location: '',
    containerType: 'STANDARD_20',
    cargoType: 'DRY',
    availableDate: '',
    size: 'STANDARD',
    technicalDetails: ''
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
    if (isOpen) {
      loadCountries()
    }
  }, [isOpen])

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
    setFormData(prev => ({ ...prev, location: '' }))
    setPorts([])
    if (country) {
      loadPortsByCountry(country)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await containerService.createOffer(formData)
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        location: '',
        containerType: 'STANDARD_20',
        cargoType: 'DRY',
        availableDate: '',
        size: 'STANDARD',
        technicalDetails: ''
      })
      setSelectedCountry('')
      setPorts([])
    } catch (error) {
      console.error('Error creating offer:', error)
      alert('Erreur lors de la création de l\'offre')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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
        <h2 className="text-xl font-bold mb-4">Nouvelle Offre de Conteneur</h2>
        
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
              Localisation
            </label>
            {portsLoading ? (
              <div className="text-sm text-gray-500">Chargement des ports...</div>
            ) : (
              <select
                name="location"
                value={formData.location}
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
              Type de Cargaison
            </label>
            <select
              name="cargoType"
              value={formData.cargoType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cargoTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Available Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Disponibilité
            </label>
            <input
              type="date"
              name="availableDate"
              value={formData.availableDate}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STANDARD">Standard</option>
              <option value="HIGH_CUBE">High Cube</option>
              <option value="REEFER">Reefer</option>
            </select>
          </div>

          {/* Technical Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Détails Techniques (optionnel)
            </label>
            <textarea
              name="technicalDetails"
              value={formData.technicalDetails}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informations techniques supplémentaires..."
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer l\'offre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateOfferModal

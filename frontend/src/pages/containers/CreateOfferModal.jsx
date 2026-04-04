import { useState, useEffect } from 'react'
import containerService from '../../services/containerService'
import { worldPortsService } from '../../services/worldPortsApi'
import { countriesService } from '../../services/countriesApi'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

const CreateOfferModal = ({ isOpen, onClose, onSuccess }) => {
  const { t: translate } = useLanguage()
  const [formData, setFormData] = useState({
    location: '',
    containerType: 'STANDARD_20',
    cargoType: 'DRY',
    availableDate: '',
    size: 'STANDARD',
    technicalDetails: ''
  })
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
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
    setCountriesLoading(true);
    try {
      const response = await fetch(
        'https://restcountries.com/v3.1/all?fields=name,translations,cca2,region',
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await response.json();
      const maritimeISO = new Set([
        'MA','DZ','TN','EG','LY','MR','DJ','SO','ER','SN','GM','SL','LR',
        'CI','GH','TG','BJ','NG','CM','GA','CG','AO','NA','ZA','MZ','TZ',
        'KE','MG','MU','SC','KM','FR','ES','PT','GB','IE','NL','BE','DE',
        'DK','SE','NO','FI','PL','EE','LV','LT','IT','GR','HR','MT','CY',
        'RO','BG','UA','TR','IL','LB','SA','AE','KW','QA','BH','OM','YE',
        'IR','IQ','RU','IN','PK','BD','LK','MM','TH','MY','SG','ID','PH',
        'VN','CN','JP','KR','US','CA','MX','BR','AR','CL','CO','PE','AU',
        'NZ','PA','CU','JM','HT','BO','EC','VE','UY','PY','GY','SR',
        'CV','ST','MV','BN','TL','PG','FJ','WS','TO','SB'
      ]);
      const countries = data
        .filter(c => maritimeISO.has(c.cca2))
        .map(c => ({
          name: c?.translations?.fra?.common || c?.name?.common || '',
          iso2: c?.cca2 || ''
        }))
        .filter(c => c.name && c.iso2)
        .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      setCountries(countries);
    } catch(e) {
      console.error('Error loading countries:', e);
      setCountries([
        {name:'Maroc',iso2:'MA'},{name:'France',iso2:'FR'},
        {name:'Espagne',iso2:'ES'},{name:'Italie',iso2:'IT'},
        {name:'Chine',iso2:'CN'},{name:'Japon',iso2:'JP'},
        {name:'États-Unis',iso2:'US'},{name:'Singapour',iso2:'SG'},
        {name:'Inde',iso2:'IN'},{name:'Brésil',iso2:'BR'}
      ]);
    } finally {
      setCountriesLoading(false);
    }
  };

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
    };
    return nameMap[name] || name;
  };

  const loadPortsByCountry = async (country) => {
    if (!country) {
      setPorts([])
      return
    }
    
    setPortsLoading(true)
    
    try {
      // Normalize country name for consistent matching
      const normalizedCountry = normalizeCountryName(country)
      
      // Récupérer les données du pays pour vérifier s'il est enclavé
      const countryData = countries.find(c => c.name === country || c.name === normalizedCountry)
      
      // Charger les ports depuis le service mondial avec couverture 100% (use normalized name)
      const portsResult = await worldPortsService.getPortsByCountry(normalizedCountry, countryData)
      
      if (portsResult.hasPorts && portsResult.ports.length > 0) {
        // Utiliser les ports réels de la base UNCTAD avec frais calculés
        const portsWithFees = portsResult.ports.map((port, index) => {
          return {
            id: port.id || `${country.toLowerCase()}-${index + 1}`,
            nom: port.name,
            nomPort: port.name,
            ville: port.city,
            pays: country,
            coordinates: { lat: port.latitude, lng: port.longitude }
          }
        })
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
  };

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
    if (country) {
      loadPortsByCountry(country)
    } else {
      setPorts([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Add coordinates from selected port
      const selectedPort = ports.find(p => (p.nomPort || p.nom) === formData.location)
      const offerData = {
        ...formData,
        latitude: selectedPort?.coordinates?.lat || null,
        longitude: selectedPort?.coordinates?.lng || selectedPort?.coordinates?.lon || null
      }
      
      const response = await containerService.createOffer(offerData)
      const newOffer = response.data?.data || response.data
      const offerId = newOffer?.id

      if (offerId && selectedFiles.length > 0) {
        try {
          await containerService.uploadOfferImages(offerId, selectedFiles)
        } catch(e) {
          console.warn('Image upload failed:', e.message)
        }
      }
      
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
      setSelectedFiles([])
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
        <h2 className="text-xl font-bold mb-4">{translate('modal.newOffer')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translate('modal.country')}
            </label>
            {countriesLoading ? (
              <div className="text-sm text-gray-500">{translate('modal.loadingCountries')}</div>
            ) : (
              <select
                name="country"
                value={selectedCountry}
                onChange={handleCountryChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{translate('modal.selectCountry')}</option>
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
              <div className="text-sm text-gray-500">{translate('modal.loadingPorts')}</div>
            ) : (
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                disabled={!selectedCountry || ports.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{translate('modal.selectPort')}</option>
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
              {translate('modal.containerType')}
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
              {translate('modal.cargoType')}
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
              {translate('modal.availableDate')}
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
              {translate('modal.size')}
            </label>
            <select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STANDARD">{translate('modal.standard')}</option>
              <option value="HIGH_CUBE">{translate('modal.highCube')}</option>
              <option value="REEFER">{translate('modal.reefer')}</option>
            </select>
          </div>

          {/* Technical Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translate('modal.technicalDetails')} (optionnel)
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

          {/* Image Upload */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              📸 {translate('modal.photos')} (optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => setSelectedFiles(Array.from(e.target.files))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px dashed #d1d5db',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            />
            {selectedFiles.length > 0 && (
              <p style={{
                fontSize: '12px',
                color: '#16a34a',
                marginTop: '4px', margin: 0
              }}>
                {selectedFiles.length} photo(s) sélectionnée(s)
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {translate('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? translate('modal.creating') : translate('modal.createOffer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateOfferModal

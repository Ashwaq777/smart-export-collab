import { useState, useEffect } from 'react'
import containerService from '../../services/containerService'
import { worldPortsService } from '../../services/worldPortsApi'
import { countriesService } from '../../services/countriesApi'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

const CreateRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const { t: translate } = useLanguage()
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
    setFormData(prev => ({ ...prev, loadingLocation: '' }))
    if (country) {
      loadPortsByCountry(country)
    } else {
      setPorts([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation des champs
    if (!formData.loadingLocation || !formData.requiredDate) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    // Validation du format de la date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(formData.requiredDate)) {
      alert('Format de date invalide. Veuillez utiliser le sélecteur de date.')
      return
    }
    
    setLoading(true)

    try {
      // Create request first
      const response = await containerService.createRequest(formData)
      const requestId = response.data?.data?.id || response.data?.id;

      if (requestId) {
        try {
          const matchResponse = await containerService.triggerMatchmaking(requestId);
          const matches = matchResponse.data?.data || matchResponse.data || [];
          const count = Array.isArray(matches) ? matches.length : 0;
          alert(`Demande créée ! ${count} correspondance(s) trouvée(s).`);
        } catch (matchError) {
          // Matchmaking failed but request was created — that's OK
          console.warn('Matchmaking skipped:', matchError.message);
          alert('Demande créée avec succès ! Les correspondances seront calculées automatiquement.');
        }
      } else {
        alert('Demande créée avec succès !');
      }

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        loadingLocation: '',
        containerType: 'STANDARD_20',
        cargoType: 'DRY',
        requiredDate: '',
        size: 'STANDARD'
      })
      setSelectedCountry('')
      setPorts([])
    } catch (error) {
      console.error('Error creating request:', error)
      alert('Erreur lors de la création de la demande: ' + (error.response?.data?.message || error.message))
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
        <h2 className="text-xl font-bold mb-4">{translate('modal.newRequest')}</h2>
        
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
              {translate('modal.loadingPort')}
            </label>
            {portsLoading ? (
              <div className="text-sm text-gray-500">{translate('modal.loadingPorts')}</div>
            ) : (
              <select
                name="loadingLocation"
                value={formData.loadingLocation}
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

          {/* Required Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translate('modal.requiredDate')}
            </label>
            <input
              type="date"
              name="requiredDate"
              value={formData.requiredDate}
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
              {loading ? translate('modal.creating') : translate('modal.createRequest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRequestModal

import { useState, useEffect } from 'react'
import containerService from '../../services/containerService'
import { worldPortsService } from '../../services/worldPortsApi'
import { countriesService } from '../../services/countriesApi'

const EditOfferModal = ({ isOpen, onClose, onSuccess, offer }) => {
  const [formData, setFormData] = useState({
    location: '',
    containerType: 'STANDARD_20',
    cargoType: 'DRY',
    availableDate: '',
    size: 'STANDARD',
    technicalDetails: ''
  })
  const [loading, setLoading] = useState(false)
  const [ports, setPorts] = useState([])
  const [portsLoading, setPortsLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const [countriesLoading, setCountriesLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')

  const containerTypes = ['STANDARD_20', 'STANDARD_40', 'HIGH_CUBE_40', 'REEFER_20', 'REEFER_40']
  const cargoTypes = ['DRY', 'REEFER', 'DANGEROUS', 'PERISHABLE']

  useEffect(() => {
    if (isOpen && offer) {
      // Pre-fill form with offer data
      setFormData({
        location: offer.location || '',
        containerType: offer.containerType || 'STANDARD_20',
        cargoType: offer.cargoType || 'DRY',
        availableDate: offer.availableDate ? offer.availableDate.split('T')[0] : '',
        size: offer.size || 'STANDARD',
        technicalDetails: offer.technicalDetails || ''
      })
      loadCountries()
    }
  }, [isOpen, offer])

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
        coordinates: selectedPort?.coordinates || null
      }

      await containerService.updateOffer(offer.id, offerData)
      onSuccess && onSuccess()
    } catch (error) {
      console.error('Error updating offer:', error)
      alert('Erreur lors de la mise à jour de l\'offre')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Modifier l'offre</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Type de conteneur
            </label>
            <select
              name="containerType"
              value={formData.containerType}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              {containerTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Type de cargaison
            </label>
            <select
              name="cargoType"
              value={formData.cargoType}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              {cargoTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Pays
            </label>
            <select
              name="country"
              value={selectedCountry}
              onChange={handleCountryChange}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">-- Sélectionner pays --</option>
              {countries.map(country => (
                <option key={country.iso2} value={country.name}>{country.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Localisation
            </label>
            {portsLoading ? (
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement des ports...</div>
            ) : (
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                disabled={!selectedCountry || ports.length === 0}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
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

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Date de disponibilité
            </label>
            <input
              type="date"
              name="availableDate"
              value={formData.availableDate}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Détails techniques
            </label>
            <textarea
              name="technicalDetails"
              value={formData.technicalDetails}
              onChange={handleInputChange}
              rows="3"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#6b7280',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#9ca3af' : '#0B1F3A',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditOfferModal

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useMaritimeCountries } from '../../hooks/useMaritimeCountries';
import { worldPortsService } from '../../services/worldPortsApi';
import containerService from '../../services/containerService';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Red icon for vessel
const vesselIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Blue icon for port
const portIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function VesselTrackingPage() {
  const [imo, setImo] = useState('');
  const [place, setPlace] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [portCoords, setPortCoords] = useState(null);

  // Country/Port selector states (from Calculator)
  const {
    countries: maritimeCountries,
    loading: maritimeCountriesLoading,
    error: maritimeCountriesError,
  } = useMaritimeCountries();
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPort, setSelectedPort] = useState('');
  const [ports, setPorts] = useState([]);
  const [portsLoading, setPortsLoading] = useState(false);
  const [portMessage, setPortMessage] = useState(null);

  // Load ports when country is selected
  const loadPortsByCountry = async (country) => {
    if (!country) {
      setPorts([]);
      setPortMessage(null);
      return;
    }
    
    setPortsLoading(true);
    setPortMessage(null);
    
    try {
      const countryData = maritimeCountries.find(c => c.name === country);
      const portsResult = await worldPortsService.getPortsByCountry(country, countryData);
      
      if (portsResult.hasPorts && portsResult.ports.length > 0) {
        setPorts(portsResult.ports);
        setPortMessage(null);
      } else {
        setPorts([]);
        setPortMessage(portsResult.message || 'Aucun port disponible pour ce pays');
      }
    } catch (err) {
      console.error('Error loading ports:', err);
      setPorts([]);
      setPortMessage('Erreur lors du chargement des ports');
    } finally {
      setPortsLoading(false);
    }
  };

  // Handle country change
  const handleCountryChange = (countryName) => {
    setSelectedCountry(countryName);
    setPlace(''); // Reset place when country changes
    setPorts([]);
    setPortMessage(null);
    
    if (countryName) {
      loadPortsByCountry(countryName);
    }
  };

  // Handle port change
  const handlePortChange = (portName) => {
    setSelectedPort(portName);
    setPlace(portName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setPortCoords(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Veuillez vous connecter');
      setLoading(false);
      return;
    }

    const portName = selectedPort || place;

    try {
      const response = await fetch(
        `/api/v1/vessels/${imo}/distance?port=${encodeURIComponent(portName)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log('VESSEL RESPONSE:', data);
      const trackData = data?.data || data;
      setResult(trackData);

      // Get port coordinates
      const portSearch = selectedPort || place;
      const nominatim = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(portSearch)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'SmartExportGlobal/1.0' } }
      );
      const places = await nominatim.json();
      if (places.length > 0) {
        setPortCoords({
          lat: parseFloat(places[0].lat),
          lon: parseFloat(places[0].lon),
          name: places[0].display_name
        });
      }

      // Send email alert if requested (same as VesselTracker)
      if (email && trackData.isNearPort) {
        await fetch('/api/v1/vessels/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ imo, place, email })
        });
      }
    } catch (err) {
      setError('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const vesselPos = result?.vessel;
  const mapCenter = vesselPos?.latitude && vesselPos?.longitude
    ? [vesselPos.latitude, vesselPos.longitude]
    : [20, 0];
  const mapZoom = vesselPos ? 5 : 2;

  return (
    <div>
      {/* Bandeau bleu gradient avec titre */}
      <div style={{
  background: 'linear-gradient(135deg, #0B1F3A 0%, #1CA7C7 100%)',
  padding: '40px 32px',
  width: '100%',
  margin: 0
}}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <h1 style={{
        color: 'white',
        fontSize: '32px',
        fontWeight: '700',
        margin: 0,
        lineHeight: '1.2'
      }}>
        🚢 Suivi de Navire en Temps Réel
      </h1>
      <p style={{
        color: 'rgba(255,255,255,0.8)',
        margin: '8px 0 0 0',
        fontSize: '16px'
      }}>
        Powered by MarineAsia API — entrez un numéro IMO pour localiser un navire
      </p>
    </div>
  </div>
</div>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem' }}>
        
        {/* LEFT — Form (same as VesselTracker) */}
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb', height: 'fit-content'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>
            Recherche navire
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '13px', color: '#374151', 
                           display: 'block', marginBottom: '4px' }}>
              Numéro IMO *
            </label>
            <input
              type="text"
              placeholder="Ex: 9321483"
              value={imo}
              onChange={e => setImo(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '13px', color: '#374151',
                           display: 'block', marginBottom: '4px' }}>
              Pays *
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              disabled={maritimeCountriesLoading}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">-- Sélectionner pays --</option>
              {maritimeCountries.map((country) => (
                <option key={country.name} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            {maritimeCountriesError && (
              <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                {maritimeCountriesError}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '13px', color: '#374151',
                           display: 'block', marginBottom: '4px' }}>
              Port de destination *
            </label>
            <select
              value={selectedPort}
              onChange={(e) => handlePortChange(e.target.value)}
              disabled={!selectedCountry || portsLoading || ports.length === 0}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">-- Sélectionner port --</option>
              {ports.map((port) => (
                <option key={port.id} value={port.name}>
                  {port.name} ({port.city})
                </option>
              ))}
            </select>
            {portsLoading && (
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                ⏳ Chargement des ports...
              </div>
            )}
            {portMessage && (
              <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                {portMessage}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '13px', color: '#374151',
                           display: 'block', marginBottom: '4px' }}>
              Port personnalisé (fallback)
            </label>
            <input
              type="text"
              placeholder="Ou entrer un port manuellement"
              value={place}
              onChange={e => setPlace(e.target.value)}
              disabled={ports.length > 0}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box',
                backgroundColor: ports.length > 0 ? '#f9fafb' : '#ffffff'
              }}
            />
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              Utilisé uniquement si aucun port n'est disponible dans la liste
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '13px', color: '#374151',
                           display: 'block', marginBottom: '4px' }}>
              Email pour alerte (optionnel)
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box'
              }}
            />
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              Email envoyé si le navire est à moins de 5km du port
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !imo || (!place && !selectedCountry)}
            style={{
              width: '100%', padding: '10px',
              background: loading ? '#9ca3af' : '#1d4ed8',
              color: 'white', border: 'none',
              borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600', fontSize: '14px'
            }}
          >
            {loading ? '⏳ Recherche...' : '🚢 Lancer le tracking'}
          </button>

          {error && (
            <div style={{
              marginTop: '1rem', padding: '10px',
              background: '#fee2e2', color: '#991b1b',
              borderRadius: '8px', fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          {/* Results panel */}
          {result && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{
                padding: '12px', borderRadius: '8px',
                background: result.isNearPort ? '#d1fae5' : '#eff6ff',
                border: `1px solid ${result.isNearPort ? '#6ee7b7' : '#bfdbfe'}` 
              }}>
                <div style={{
                  fontSize: '14px', fontWeight: '600',
                  color: result.isNearPort ? '#065f46' : '#1e40af',
                  marginBottom: '8px'
                }}>
                  {result.isNearPort
                    ? '✅ Navire proche du port !'
                    : '🔵 Navire en route'}
                </div>
                {result.vessel && (
                  <div style={{ fontSize: '13px', color: '#374151' }}>
                    <div><b>Navire:</b> {result.vessel.vesselName || imo}</div>
                    <div><b>IMO:</b> {imo}</div>
                    <div><b>Distance:</b> {result.distanceKm 
                      ? `${Number(result.distanceKm).toFixed(1)} km` 
                      : 'N/A'}</div>
                    <div><b>Destination:</b> {place}</div>
                    {result.vessel.speed && (
                      <div><b>Vitesse:</b> {result.vessel.speed} kn</div>
                    )}
                    {result.emailSent && (
                      <div style={{ color: '#16a34a', marginTop: '4px' }}>
                        📧 Alerte email envoyée !
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Leaflet Map */}
        <div style={{
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          height: '500px'
        }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            key={JSON.stringify(mapCenter)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />

            {/* Vessel marker — RED */}
            {vesselPos?.latitude && vesselPos?.longitude && (
              <Marker
                position={[vesselPos.latitude, vesselPos.longitude]}
                icon={vesselIcon}
              >
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <strong style={{ color: '#dc2626' }}>
                      🚢 {vesselPos.vesselName || imo}
                    </strong>
                    <hr style={{ margin: '6px 0' }}/>
                    <div><b>IMO:</b> {imo}</div>
                    <div><b>Lat:</b> {vesselPos.latitude?.toFixed(4)}</div>
                    <div><b>Lon:</b> {vesselPos.longitude?.toFixed(4)}</div>
                    {vesselPos.speed && (
                      <div><b>Vitesse:</b> {vesselPos.speed} kn</div>
                    )}
                    {vesselPos.destination && (
                      <div><b>Destination:</b> {vesselPos.destination}</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Port marker — BLUE */}
            {portCoords && (
              <Marker
                position={[portCoords.lat, portCoords.lon]}
                icon={portIcon}
              >
                <Popup>
                  <div>
                    <strong style={{ color: '#1d4ed8' }}>
                      ⚓ Port de destination
                    </strong>
                    <hr style={{ margin: '6px 0' }}/>
                    <div><b>Port:</b> {place}</div>
                    {result?.distanceKm && (
                      <div><b>Distance navire:</b> {' '}
                        {Number(result.distanceKm).toFixed(1)} km
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Line between vessel and port */}
            {vesselPos?.latitude && vesselPos?.longitude
              && portCoords && (
              <Polyline
                positions={[
                  [vesselPos.latitude, vesselPos.longitude],
                  [portCoords.lat, portCoords.lon]
                ]}
                color="#6366f1"
                weight={2}
                dashArray="6"
              />
            )}
          </MapContainer>
        </div>
      </div>
      </div>
    </div>
  );
}

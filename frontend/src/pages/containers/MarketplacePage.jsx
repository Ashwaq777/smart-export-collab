import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import containerService from '../../services/containerService';
import CreateOfferModal from './CreateOfferModal';
import CreateRequestModal from './CreateRequestModal';
import EditRequestModal from './EditRequestModal';
import EditOfferModal from './EditOfferModal';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function MarketplacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isImportateur = user?.role === 'IMPORTATEUR';
  const isExportateur = user?.role === 'EXPORTATEUR';

  // Data states
  const [dashboard, setDashboard] = useState({});
  const [myOffers, setMyOffers] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [offers, setOffers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCargo, setFilterCargo] = useState('ALL');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matchingId, setMatchingId] = useState(null);
  const [matchedOfferIds, setMatchedOfferIds] = useState([]);
  const [matchScores, setMatchScores] = useState({});

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    let result = allOffers;
    if (search) {
      result = result.filter(o =>
        o.location?.toLowerCase()
          .includes(search.toLowerCase()) ||
        o.containerType?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }
    if (filterType !== 'ALL') {
      result = result.filter(
        o => o.containerType === filterType);
    }
    if (filterCargo !== 'ALL') {
      result = result.filter(
        o => o.cargoType === filterCargo);
    }
    setOffers(result);
    setFiltered(result);
  }, [search, filterType, filterCargo, allOffers]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [dashRes, allOffersRes, matchesRes] = await Promise.all([
        containerService.getDashboard(),
        containerService.getAllOffers(),
        containerService.getMyMatches(),
      ]);

      const dash = dashRes.data?.data || dashRes.data || {};
      setDashboard(dash);
      setMyOffers(dash.myOffers || []);
      setMyRequests(dash.myRequests || []);

      const all = allOffersRes.data?.data || allOffersRes.data || [];
      setAllOffers(Array.isArray(all) ? all.filter(o => o.status === 'AVAILABLE') : []);
      setReceivedRequests(dash.receivedRequests || []);
      setSentRequests(dash.sentRequests || []);
      setMyMatches(matchesRes.data?.data || matchesRes.data || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteOffer = async (id) => {
    console.log('Deleting offer ID:', id);
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await containerService.deleteOffer(id);
      loadAll();
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  // Edit handlers
  const handleEditOffer = (offer) => {
    setSelectedOffer(offer);
    setShowEditModal(true);
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Supprimer cette demande ?')) return;
    try {
      await containerService.deleteRequest(id);
      loadAll();
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  const handleMatch = async (requestId) => {
    setMatchingId(requestId);
    try {
      const res = await containerService.triggerMatchmaking(requestId);
      const matches = res.data?.data || res.data || [];
      const count = matches.length;
      
      if (count > 0) {
        // Combine existing matches with new ones
        const combinedMatches = [...myMatches, ...matches];
        const offerIds = combinedMatches.map(m => m.offerId);
        const scoreMap = {};
        
        combinedMatches.forEach(m => {
          scoreMap[m.offerId] = m.compatibilityScore;
        });
        setMatchedOfferIds(offerIds);
        setMatchScores(scoreMap);
        setActiveTab(0); // Switch to marketplace tab
        
        // Create detailed match info for the alert
        const matchDetails = combinedMatches.map(m => 
          `• Offre à ${m.offerLocation} - ${Math.round(m.compatibilityScore)}% compatible (${Math.round(m.distanceKm)}km)`
        ).join('\n');
        
        alert(`✅ ${count} correspondance(s) trouvée(s) !\n\n${matchDetails}\n\n📍 Les offres correspondantes sont maintenant mises en évidence en vert dans le marketplace ci-dessus avec le badge "🎯 Correspond à votre demande".\n\n💡 Ces correspondances incluent vos matches existants et nouveaux.`);
      } else {
        alert(`❌ Aucune correspondance trouvée pour cette demande.\n\nEssayez de :\n• Modifier les critères (type de conteneur, cargaison)\n• Choisir une date requise plus tardive\n• Créer une nouvelle demande`);
      }
    } catch(err) {
      console.error('Match error:', err);
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    } finally {
      setMatchingId(null);
    }
  };

  const handleConfirmMatch = async (matchId) => {
    try {
      await containerService.confirmMatch(matchId);
      alert('✅ Match confirmé ! La transaction a été créée.');
      loadAll(); // Reload to update match status
    } catch (e) {
      alert('Erreur: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleRespondDirectRequest = async (reqId, accepted) => {
    const response = accepted
      ? prompt('Message d\'acceptation (optionnel):')
      : prompt('Raison du refus (optionnel):');
    try {
      const token = localStorage.getItem('token');
      const url = `/api/v1/containers/direct-requests/${reqId}/respond?accepted=${accepted}`
        + (response ? `&response=${encodeURIComponent(response)}` : '');
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(accepted ? '✅ Demande acceptée !' : '❌ Demande refusée');
      loadAll();
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  const containerTypes = ['ALL','STANDARD_20',
    'STANDARD_40','HIGH_CUBE_40',
    'REEFER_20','REEFER_40'];
  const cargoTypes = ['ALL','DRY','REEFER',
    'DANGEROUS','PERISHABLE'];

  // Tabs definition per role
  const importateurTabs = ['Mes Offres', 'Demandes reçues', 'Mes Correspondances', 'Carte'];
  const exportateurTabs = ['Marketplace', 'Mes Demandes', 'Mes Requêtes', 'Mes Correspondances', 'Carte'];
  const tabs = isImportateur ? importateurTabs : exportateurTabs;

  const statCards = [
    { label: 'Mes Offres', value: myOffers.length, color: '#1d4ed8', bg: '#dbeafe', icon: '📦' },
    { label: 'Mes Demandes', value: myRequests.length, color: '#16a34a', bg: '#d1fae5', icon: '🔍' },
    { label: 'Correspondances', value: dashboard.totalMatches || 0, color: '#d97706', bg: '#fef3c7', icon: '🤝' },
    { label: 'Transactions', value: dashboard.completedTransactions || 0, color: '#7c3aed', bg: '#ede9fe', icon: '📋' },
  ];

  return (
    <div>
      {/* Bandeau bleu gradient avec titre */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1CA7C7] py-12 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Marketplace</h1>
            <p className="text-white/80 mt-1">Trouvez le conteneur idéal pour votre expédition</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ padding: '2rem', 
                    maxWidth: '1400px', 
                    margin: '0 auto' }}>

      <div style={{
        display: 'flex', gap: '1rem',
        flexWrap: 'wrap', marginBottom: '2rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          placeholder="🔍 Rechercher par port, ville..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px',
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px', fontSize: '14px'
          }}
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px', fontSize: '14px',
            background: 'white'
          }}
        >
          {containerTypes.map(t => (
            <option key={t} value={t}>
              {t === 'ALL' ? 'Tous les types' : t}
            </option>
          ))}
        </select>
        <select
          value={filterCargo}
          onChange={e => setFilterCargo(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px', fontSize: '14px',
            background: 'white'
          }}
        >
          {cargoTypes.map(t => (
            <option key={t} value={t}>
              {t === 'ALL' ? 'Toutes cargaisons' : t}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs for EXPORTATEUR - Moved to top */}
      {user && isExportateur && (
        <div style={{ marginTop: '2rem' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '1.5rem',
            background: '#f3f4f6', padding: '4px', borderRadius: '10px', width: 'fit-content'
          }}>
            {tabs.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                  fontWeight: activeTab === idx ? '600' : '400',
                  background: activeTab === idx ? 'white' : 'transparent',
                  color: activeTab === idx ? '#111827' : '#6b7280',
                  boxShadow: activeTab === idx ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ============ EXPORTATEUR TABS ============ */}
          {/* EXPORTATEUR Tab 0: Marketplace */}
          {isExportateur && activeTab === 0 && (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', 
                              padding: '4rem',
                              color: '#6b7280' }}>
                  Chargement...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '4rem',
                  background: 'white', borderRadius: '12px',
                  border: '1px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: '48px' }}>📦</div>
                  <h3>Aucun conteneur disponible</h3>
                  <p style={{ color: '#6b7280' }}>
                    Revenez plus tard ou modifiez vos filtres
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 
                    'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {filtered.map(offer => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      onClick={() => navigate(
                        `/containers/marketplace/${offer.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPORTATEUR Tab 1: Mes Demandes */}
          {isExportateur && activeTab === 1 && (
            <div>
              {myRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '48px' }}>🔍</div>
                  <h3>Aucune demande</h3>
                  <p style={{ color: '#6b7280' }}>Créez votre première demande</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {myRequests.map(req => (
                    <div key={req.id} style={{
                      background: 'white', padding: '1rem', borderRadius: '12px',
                      border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>{req.containerType}</h4>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {req.loadingLocation}
                      </p>
                      <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Date: {new Date(req.requiredDate).toLocaleDateString()}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => { setSelectedRequest(req); setShowEditModal(true); }}
                          style={{
                            flex: 1, padding: '0.5rem', background: '#3b82f6', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem'
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          style={{
                            flex: 1, padding: '0.5rem', background: '#ef4444', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem'
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPORTATEUR Tab 2: Mes Requêtes */}
          {isExportateur && activeTab === 2 && (
            <div>
              {sentRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '48px' }}>📤</div>
                  <h3>Aucune requête envoyée</h3>
                  <p style={{ color: '#6b7280' }}>Vos requêtes directes apparaîtront ici</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {sentRequests.map(req => (
                    <div key={req.id} style={{
                      background: 'white', padding: '1rem', borderRadius: '12px',
                      border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>
                        Requête pour {req.offerLocation}
                      </h4>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Statut: {req.status}
                      </p>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Date: {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPORTATEUR Tab 3: Mes Correspondances */}
          {isExportateur && activeTab === 3 && (
            <div>
              {myMatches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '48px' }}>🤝</div>
                  <h3>Aucune correspondance</h3>
                  <p style={{ color: '#6b7280' }}>Vos correspondances apparaîtront ici</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {myMatches.map(match => (
                    <div key={match.id} style={{
                      background: 'white', padding: '1rem', borderRadius: '12px',
                      border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>
                        Match avec {match.requestLocation}
                      </h4>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Score: {Math.round(match.compatibilityScore)}%
                      </p>
                      <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Distance: {Math.round(match.distanceKm)}km
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPORTATEUR Tab 4: Carte */}
          {isExportateur && activeTab === 4 && (
            <div style={{ height: '500px', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
              <MapContainer style={{ height: '100%', width: '100%' }} center={[31.7917, -7.0926]} zoom={5}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MarkerClusterGroup>
                  {myRequests.map(req => (
                    <Marker key={req.id} position={[req.coordinates?.lat || 31.7917, req.coordinates?.lng || -7.0926]} icon={greenIcon}>
                      <Popup>
                        <div>
                          <strong>{req.containerType}</strong><br />
                          {req.loadingLocation}<br />
                          {req.cargoType}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          )}
        </div>
      )}

      {/* Public offer grid - Only for IMPORTATEUR or when EXPORTATEUR is not in tabs mode */}
      {(!user || isImportateur) && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', 
                          padding: '4rem',
                          color: '#6b7280' }}>
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '4rem',
              background: 'white', borderRadius: '12px',
              border: '1px dashed #d1d5db'
            }}>
              <div style={{ fontSize: '48px' }}>📦</div>
              <h3>Aucun conteneur disponible</h3>
              <p style={{ color: '#6b7280' }}>
                Revenez plus tard ou modifiez vos filtres
              </p>
            </div>
          ) : !isImportateur && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 
                'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {filtered.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onClick={() => navigate(
                    `/containers/marketplace/${offer.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tabs for IMPORTATEUR only */}
      {user && isImportateur && (
        <div style={{ marginTop: '3rem' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '1.5rem',
            background: '#f3f4f6', padding: '4px', borderRadius: '10px', width: 'fit-content'
          }}>
            {tabs.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                  fontWeight: activeTab === idx ? '600' : '400',
                  background: activeTab === idx ? 'white' : 'transparent',
                  color: activeTab === idx ? '#111827' : '#6b7280',
                  boxShadow: activeTab === idx ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {isImportateur && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                style={{
                  background: 'linear-gradient(to right, #0B1F3A, #1CA7C7)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Créer une offre
              </button>
            </div>
          )}

          {/* ============ IMPORTATEUR TABS ============ */}
          {/* IMPORTATEUR Tab 0: Mes Offres */}
          {isImportateur && activeTab === 0 && (
            <div>
              {myOffers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '48px' }}>📦</div>
                  <h3>Aucune offre publiée</h3>
                  <p style={{ color: '#6b7280' }}>Publiez votre premier conteneur vide</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {myOffers.map(offer => (
                    <div key={offer.id} style={{
                      background: 'white', 
                      borderRadius: '16px', 
                      border: matchedOfferIds.includes(offer.id) ? '2px solid #0D9488' : '1px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    }}>
                      {offer.imageUrls && offer.imageUrls.length > 0 ? (
                        <img
                          src={`http://localhost:8080${offer.imageUrls[0]}`}
                          alt={offer.containerType}
                          style={{ width:'100%', height:'160px', objectFit:'cover', borderRadius:'8px', marginBottom:'8px' }}
                          onError={(e) => { e.target.style.display='none' }}
                        />
                      ) : (
                        <div style={{ width:'100%', height:'160px', background:'#f3f4f6', borderRadius:'8px', marginBottom:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af' }}>
                          Pas d'image
                        </div>
                      )}
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                              {offer.containerType}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              {offer.cargoType}
                            </div>
                          </div>
                          {matchedOfferIds.includes(offer.id) && (
                            <div style={{
                              background: '#0D9488', color: 'white', fontSize: '10px',
                              padding: '2px 6px', borderRadius: '4px', fontWeight: '600'
                            }}>
                              🎯 {Math.round(matchScores[offer.id] || 0)}%
                            </div>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                          📍 {offer.location}
                        </div>
                        
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                          Disponible: {offer.availableDate ? new Date(offer.availableDate).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                        
                        <div style={{ 
                          height: '1px', 
                          background: '#F1F5F9', 
                          marginBottom: '12px' 
                        }} />
                        
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEditOffer(offer)}
                            style={{
                              padding: '8px', 
                              background: '#F3F4F6', 
                              color: '#374151',
                              border: '1px solid #E5E7EB', 
                              borderRadius: '10px', 
                              cursor: 'pointer', 
                              fontSize: '12px',
                              fontWeight: '500',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#E5E7EB'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#F3F4F6'
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => navigate(`/containers/marketplace/${offer.id}`)}
                            style={{
                              flex: 1, 
                              padding: '8px', 
                              background: '#0B1F3A', 
                              color: 'white',
                              border: 'none', 
                              borderRadius: '10px', 
                              cursor: 'pointer', 
                              fontSize: '12px',
                              fontWeight: '500',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#1CA7C7'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#0B1F3A'
                            }}
                          >
                            Voir les détails
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            style={{
                              padding: '8px', 
                              background: 'white', 
                              color: '#DC2626',
                              border: '1px solid #FEE2E2', 
                              borderRadius: '10px', 
                              cursor: 'pointer', 
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* IMPORTATEUR Tab 1: Demandes reçues */}
          {isImportateur && activeTab === 1 && (
            <div>
              {receivedRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '48px' }}>📥</div>
                  <h3>Aucune demande reçue</h3>
                  <p style={{ color: '#6b7280' }}>Les demandes directes apparaîtront ici</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {receivedRequests.map(req => (
                    <div key={req.id} style={{
                      background: 'white', padding: '1rem', borderRadius: '12px',
                      border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>{req.containerType}</h4>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        De: {req.requesterName}
                      </p>
                      <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Date: {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleRespondDirectRequest(req.id, true)}
                          style={{
                            flex: 1, padding: '0.5rem', background: '#10b981', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem'
                          }}
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleRespondDirectRequest(req.id, false)}
                          style={{
                            flex: 1, padding: '0.5rem', background: '#ef4444', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem'
                          }}
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* IMPORTATEUR Tab 2: Mes Correspondances */}
          {isImportateur && activeTab === 2 && (
            <div>
              {myMatches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '48px' }}>🤝</div>
                  <h3>Aucune correspondance</h3>
                  <p style={{ color: '#6b7280' }}>Vos correspondances apparaîtront ici</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {myMatches.map(match => (
                    <div key={match.id} style={{
                      background: 'white', padding: '1rem', borderRadius: '12px',
                      border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>
                        Match avec {match.offerLocation}
                      </h4>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Score: {Math.round(match.compatibilityScore)}%
                      </p>
                      <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Distance: {Math.round(match.distanceKm)}km
                      </p>
                      <button
                        onClick={() => handleConfirmMatch(match.id)}
                        style={{
                          width: '100%', padding: '0.5rem', background: '#0B1F3A', color: 'white',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem'
                        }}
                      >
                        Confirmer le match
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* IMPORTATEUR Tab 3: Carte */}
          {isImportateur && activeTab === 3 && (
            <div style={{ height: '500px', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
              <MapContainer style={{ height: '100%', width: '100%' }} center={[31.7917, -7.0926]} zoom={5}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MarkerClusterGroup>
                  {myOffers.map(offer => (
                    <Marker key={offer.id} position={[offer.coordinates?.lat || 31.7917, offer.coordinates?.lng || -7.0926]} icon={blueIcon}>
                      <Popup>
                        <div>
                          <strong>{offer.containerType}</strong><br />
                          {offer.location}<br />
                          {offer.cargoType}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Floating button for EXPORTATEUR */}
      {user?.role === 'EXPORTATEUR' && (
        <button
          type="button"
          onClick={() => setShowRequestModal(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'linear-gradient(to right, #0B1F3A, #1CA7C7)',
            color: 'white',
            padding: '14px 20px',
            borderRadius: '99px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(11, 31, 58, 0.4)'
          }}
        >
          + Nouvelle Demande
        </button>
      )}

      {/* Create Offer Modal */}
      {showOfferModal && (
        <CreateOfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          onSuccess={() => {
            setShowOfferModal(false);
            loadAll(); // Reload all data after successful creation
          }}
        />
      )}

      {/* Create Request Modal */}
      {showRequestModal && (
        <CreateRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            loadAll(); // Reload all data after successful creation
          }}
        />
      )}

      {/* Edit Request Modal */}
      {showEditModal && selectedRequest && (
        <EditRequestModal
          request={selectedRequest}
          onClose={() => { setShowEditModal(false); setSelectedRequest(null); }}
          onSuccess={() => { setShowEditModal(false); setSelectedRequest(null); loadAll(); }}
        />
      )}

      {/* Edit Offer Modal */}
      {showEditModal && selectedOffer && (
        <EditOfferModal
          isOpen={showEditModal}
          offer={selectedOffer}
          onClose={() => { setShowEditModal(false); setSelectedOffer(null); }}
          onSuccess={() => { setShowEditModal(false); setSelectedOffer(null); loadAll(); }}
        />
      )}
    </div>
  );
}

function OfferCard({ offer, onClick }) {
  const hasImages = offer.imageUrls?.length > 0;
  
  const statusColor = {
    AVAILABLE: '#16a34a',
    IN_NEGOTIATION: '#d97706',
    RESERVED: '#dc2626'
  }[offer.status] || '#6b7280';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 
          '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 
          '0 2px 8px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{
        height: '200px',
        background: hasImages ? 'transparent' : '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {hasImages ? (
          <img
            src={offer.imageUrls[0]}
            alt={offer.containerType}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover'
            }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = 
                '<div style="font-size:64px">📦</div>';
            }}
          />
        ) : (
          <div style={{ fontSize: '64px' }}>📦</div>
        )}
        <span style={{
          position: 'absolute',
          top: '12px', right: '12px',
          background: statusColor,
          color: 'white',
          fontSize: '11px', fontWeight: '600',
          padding: '4px 10px',
          borderRadius: '99px'
        }}>
          {offer.status === 'AVAILABLE' 
            ? '✅ Disponible' 
            : offer.status}
        </span>
      </div>

      <div style={{ padding: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <h3 style={{
            fontSize: '16px', fontWeight: '600',
            margin: 0, color: '#111827'
          }}>
            {offer.containerType?.replace('_', ' ')}
          </h3>
          <span style={{
            fontSize: '12px',
            background: '#dbeafe',
            color: '#1e40af',
            padding: '2px 8px',
            borderRadius: '99px'
          }}>
            {offer.cargoType}
          </span>
        </div>

        <p style={{
          fontSize: '13px', color: '#6b7280',
          margin: '0 0 8px',
          display: 'flex', alignItems: 'center',
          gap: '4px'
        }}>
          📍 {offer.location}
        </p>

        {offer.description && (
          <p style={{
            fontSize: '12px', color: '#6b7280',
            margin: '0 0 8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {offer.description}
          </p>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <span style={{ 
            fontSize: '12px', color: '#6b7280' 
          }}>
            📅 Dispo: {offer.availableDate}
          </span>
          <span style={{
            fontSize: '12px',
            color: '#1d4ed8', fontWeight: '500'
          }}>
            Voir détails →
          </span>
        </div>
      </div>
    </div>
  );
}

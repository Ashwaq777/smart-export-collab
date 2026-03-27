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

export default function ContainersPage() {
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
  const [loading, setLoading] = useState(true);

  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matchingId, setMatchingId] = useState(null);
  const [matchedOfferIds, setMatchedOfferIds] = useState([]);
  const [matchScores, setMatchScores] = useState({});

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [dashRes, allOffersRes] = await Promise.all([
        containerService.getDashboard(),
        containerService.getAllOffers(),
      ]);

      const dash = dashRes.data?.data || dashRes.data || {};
      setDashboard(dash);
      setMyOffers(dash.myOffers || []);
      setMyRequests(dash.myRequests || []);

      const all = allOffersRes.data?.data || allOffersRes.data || [];
      setAllOffers(Array.isArray(all) ? all.filter(o => o.status === 'AVAILABLE') : []);

      // Load direct requests
      try {
        const recvRes = await fetch(
          '/api/v1/containers/direct-requests/received',
          { headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }}
        );
        if (recvRes.ok) {
          const recvData = await recvRes.json();
          setReceivedRequests(recvData.data || []);
        }
      } catch(e) {
        console.warn('Direct requests not available yet');
        setReceivedRequests([]);
      }

      try {
        const sentRes = await fetch(
          '/api/v1/containers/direct-requests/my',
          { headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }}
        );
        if (sentRes.ok) {
          const sentData = await sentRes.json();
          setSentRequests(sentData.data || []);
        }
      } catch(e) {
        console.warn('Sent requests not available yet');
        setSentRequests([]);
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter offers for marketplace
  const filteredOffers = allOffers.filter(o => {
    const matchSearch = !search ||
      o.location?.toLowerCase().includes(search.toLowerCase()) ||
      o.containerType?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'ALL' || o.containerType === filterType;
    return matchSearch && matchType;
  });

  // Delete handlers
  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await containerService.deleteOffer(id);
      loadAll();
    } catch (e) { alert('Erreur: ' + e.message); }
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
    const matches = res.data?.data || [];
    const count = Array.isArray(matches) ? matches.length : 0;
    
    if (count > 0) {
      // Store matched offer IDs and scores for highlighting
      const offerIds = matches.map(m => m.offerId);
      const scoreMap = {};
      matches.forEach(m => {
        scoreMap[m.offerId] = m.compatibilityScore;
      });
      setMatchedOfferIds(offerIds);
      setMatchScores(scoreMap);
      setActiveTab(0); // Switch to marketplace tab
      
      // Create detailed match info for the alert
      const matchDetails = matches.map(m => 
        `• Offre à ${m.offerLocation} - ${Math.round(m.compatibilityScore)}% compatible (${Math.round(m.distanceKm)}km)`
      ).join('\n');
      
      alert(`✅ ${count} correspondance(s) trouvée(s) !\n\n${matchDetails}\n\n📍 Les offres correspondantes sont maintenant mises en évidence en vert dans le marketplace ci-dessus avec le badge "🎯 Correspond à votre demande".\n\nVous pouvez aussi voir toutes vos correspondances dans l'onglet "🤝 Mes Correspondances" du menu.`);
    } else {
      alert('❌ Aucun conteneur disponible ne correspond à votre demande pour le moment.\n\nEssayez de :\n• Modifier les critères (type de conteneur, cargaison)\n• Choisir une date requise plus tardive\n• Élargir la zone de recherche');
    }
    await loadAll();
  } catch(err) {
    console.error('Match error:', err);
    alert('Erreur: ' + (err.response?.data?.message || err.message));
  } finally {
    setMatchingId(null);
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

  // Tabs definition per role
  const importateurTabs = ['📦 Mes Offres', '📬 Demandes reçues', '🗺️ Carte'];
  const exportateurTabs = ['🏪 Marketplace', '🔍 Mes Demandes', '📬 Mes Requêtes', '🗺️ Carte'];
  const tabs = isImportateur ? importateurTabs : exportateurTabs;

  const statCards = [
    { label: 'Mes Offres', value: myOffers.length, color: '#1d4ed8', bg: '#dbeafe', icon: '📦' },
    { label: 'Mes Demandes', value: myRequests.length, color: '#16a34a', bg: '#d1fae5', icon: '🔍' },
    { label: 'Correspondances', value: dashboard.totalMatches || 0, color: '#d97706', bg: '#fef3c7', icon: '🤝' },
    { label: 'Transactions', value: dashboard.completedTransactions || 0, color: '#7c3aed', bg: '#ede9fe', icon: '📋' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '16px', color: '#6b7280' }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
            {isImportateur ? '📦 Gestion de mes Conteneurs' : '🏪 Marketplace Conteneurs'}
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>
            {isImportateur
              ? `${myOffers.length} offre(s) publiée(s)`
              : `${filteredOffers.length} conteneur(s) disponible(s) dans le monde`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: '12px', padding: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '48px', height: '48px', background: s.bg, borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search bar for exportateur */}
      {isExportateur && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="🔍 Rechercher par port, pays..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
          />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: 'white' }}
          >
            {['ALL', 'STANDARD_20', 'STANDARD_40', 'HIGH_CUBE_40', 'REEFER_20', 'REEFER_40'].map(t => (
              <option key={t} value={t}>{t === 'ALL' ? 'Tous types' : t}</option>
            ))}
          </select>
        </div>
      )}

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {myOffers.map(offer => (
                <div key={offer.id} style={{
                  background: 'white', borderRadius: '12px', overflow: 'hidden',
                  border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    height: '150px', background: '#f3f4f6', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    {offer.imageUrls?.length > 0 ? (
                      <img src={offer.imageUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '48px' }}>📦</span>
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {offer.containerType?.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                      📍 {offer.location}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                      📅 {offer.availableDate}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => navigate(`/containers/marketplace/${offer.id}`)}
                        style={{
                          flex: 1, padding: '6px', background: '#eff6ff', color: '#1d4ed8',
                          border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                        }}
                      >
                        👁️ Voir
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        style={{
                          padding: '6px 10px', background: '#fee2e2', color: '#991b1b',
                          border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                        }}
                      >
                        🗑️
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
              <div style={{ fontSize: '48px' }}>📬</div>
              <h3>Aucune demande reçue</h3>
              <p style={{ color: '#6b7280' }}>Les exportateurs peuvent envoyer des demandes sur vos offres</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {receivedRequests.map(req => (
                <div key={req.id} style={{
                  background: 'white', borderRadius: '12px', padding: '1.5rem',
                  border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                        📩 Demande de {req.seekerName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        Pour: {req.containerType} à {req.offerLocation}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px', padding: '4px 10px', borderRadius: '99px',
                      background: req.status === 'PENDING' ? '#fef3c7' : req.status === 'ACCEPTED' ? '#d1fae5' : '#fee2e2',
                      color: req.status === 'PENDING' ? '#92400e' : req.status === 'ACCEPTED' ? '#065f46' : '#991b1b'
                    }}>
                      {req.status === 'PENDING' ? '⏳ En attente' : req.status === 'ACCEPTED' ? '✅ Acceptée' : '❌ Refusée'}
                    </span>
                  </div>
                  <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', fontSize: '13px', marginBottom: '1rem' }}>
                    <b>Message:</b> {req.message}
                  </div>
                  {req.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleRespondDirectRequest(req.id, true)}
                        style={{
                          padding: '8px 16px', background: '#16a34a', color: 'white',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                        }}
                      >
                        ✅ Accepter
                      </button>
                      <button
                        onClick={() => handleRespondDirectRequest(req.id, false)}
                        style={{
                          padding: '8px 16px', background: '#dc2626', color: 'white',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                        }}
                      >
                        ❌ Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* IMPORTATEUR Tab 2: Carte */}
      {isImportateur && activeTab === 2 && (
        <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <MarkerClusterGroup>
              {myOffers.filter(o => o.latitude && o.longitude).map(o => (
                <Marker key={o.id} position={[o.latitude, o.longitude]} icon={blueIcon}>
                  <Popup>
                    <b>📦 {o.containerType}</b><br />
                    📍 {o.location}<br />
                    📅 {o.availableDate}
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      )}

      {/* ============ EXPORTATEUR TABS ============ */}

      {/* EXPORTATEUR Tab 0: Marketplace */}
      {isExportateur && activeTab === 0 && (
        <div>
          {filteredOffers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
              <div style={{ fontSize: '48px' }}>🏪</div>
              <h3>Aucun conteneur disponible</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {filteredOffers.map(offer => {
                const isMatched = matchedOfferIds.includes(offer.id);
                const matchScore = matchScores[offer.id];
                return (
                  <div
                    key={offer.id}
                    onClick={() => navigate(`/containers/marketplace/${offer.id}`)}
                    style={{
                      background: 'white', borderRadius: '16px', overflow: 'hidden',
                      border: isMatched ? '2px solid #16a34a' : '1px solid #e5e7eb', cursor: 'pointer',
                      boxShadow: isMatched ? '0 0 0 3px rgba(22,163,74,0.15)' : '0 2px 8px rgba(0,0,0,0.08)', 
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{
                      height: '180px', background: '#f3f4f6', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
                    }}>
                      {offer.imageUrls?.length > 0 ? (
                        <img src={offer.imageUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '56px' }}>📦</span>
                      )}
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: '#16a34a', color: 'white', fontSize: '11px',
                        padding: '3px 8px', borderRadius: '99px', fontWeight: '600'
                      }}>
                        ✅ Disponible
                      </span>
                      {isMatched && (
                        <div style={{
                          position: 'absolute',
                          top: '10px', left: '10px',
                          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '6px 12px',
                          borderRadius: '99px',
                          zIndex: 2,
                          boxShadow: '0 2px 8px rgba(22,163,74,0.4)',
                          border: '2px solid white',
                          maxWidth: '200px',
                          textAlign: 'center'
                        }}>
                          🎯 CORRESPONDANCE TROUVÉE
                        </div>
                      )}
                      {isMatched && matchScore && (
                        <div style={{
                          position: 'absolute',
                          bottom: '10px', right: '10px',
                          background: matchScore >= 80 ? 'linear-gradient(135deg, #16a34a, #22c55e)' 
                               : matchScore >= 60 ? 'linear-gradient(135deg, #d97706, #f59e0b)' 
                               : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                          color: 'white',
                          borderRadius: '10px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: '800',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          border: '2px solid white',
                          textAlign: 'center'
                        }}>
                          {Math.round(matchScore)}% COMPATIBLE
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>
                          {offer.containerType?.replace(/_/g, ' ')}
                        </span>
                        <span style={{
                          fontSize: '11px', background: '#dbeafe', color: '#1e40af',
                          padding: '2px 7px', borderRadius: '99px'
                        }}>
                          {offer.cargoType}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                        📍 {offer.location}
                      </div>
                      {offer.description && (
                        <div style={{
                          fontSize: '12px', color: '#9ca3af', marginBottom: '8px',
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                        }}>
                          {offer.description}
                        </div>
                      )}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        paddingTop: '8px', borderTop: '1px solid #f3f4f6', fontSize: '12px'
                      }}>
                        <span style={{ color: '#6b7280' }}>📅 {offer.availableDate}</span>
                        <span style={{ color: '#1d4ed8', fontWeight: '500' }}>Voir détails →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              <h3>Aucune demande créée</h3>
              <p style={{ color: '#6b7280' }}>Créez une demande pour déclencher le matchmaking automatique</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myRequests.map(r => (
                <div key={r.id} style={{
                  background: 'white', borderRadius: '12px', padding: '1.5rem',
                  border: '1px solid #e5e7eb', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {r.containerType?.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      📍 {r.loadingLocation} — 📅 {r.requiredDate}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleMatch(r.id)}
                      disabled={matchingId === r.id}
                      style={{
                        padding: '6px 12px', 
                        background: matchingId === r.id 
                          ? '#e5e7eb' : '#d1fae5',
                        color: matchingId === r.id 
                          ? '#6b7280' : '#065f46',
                        border: '1px solid #6ee7b7',
                        borderRadius: '8px',
                        cursor: matchingId === r.id 
                          ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {matchingId === r.id 
                        ? '⏳ Recherche en cours...' 
                        : '🎯 Trouver des correspondances'}
                    </button>
                    <button
                      onClick={() => { setSelectedRequest(r); setShowEditModal(true); }}
                      style={{
                        padding: '6px 12px', background: '#dbeafe', color: '#1e40af',
                        border: '1px solid #93c5fd', borderRadius: '8px', cursor: 'pointer', fontSize: '12px'
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(r.id)}
                      style={{
                        padding: '6px 12px', background: '#fee2e2', color: '#991b1b',
                        border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXPORTATEUR Tab 2: Mes Requêtes directes */}
      {isExportateur && activeTab === 2 && (
        <div>
          {sentRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
              <div style={{ fontSize: '48px' }}>📬</div>
              <h3>Aucune requête envoyée</h3>
              <p style={{ color: '#6b7280' }}>Visitez le marketplace et envoyez une demande directe à un provider</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sentRequests.map(req => (
                <div key={req.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600' }}>
                      📩 Demande pour {req.containerType} à {req.offerLocation}
                    </div>
                    <span style={{
                      fontSize: '12px', padding: '3px 10px', borderRadius: '99px',
                      background: req.status === 'PENDING' ? '#fef3c7' : req.status === 'ACCEPTED' ? '#d1fae5' : '#fee2e2',
                      color: req.status === 'PENDING' ? '#92400e' : req.status === 'ACCEPTED' ? '#065f46' : '#991b1b'
                    }}>
                      {req.status === 'PENDING' ? '⏳ En attente' : req.status === 'ACCEPTED' ? '✅ Acceptée' : '❌ Refusée'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{req.message}</div>
                  {req.providerResponse && (
                    <div style={{ marginTop: '8px', padding: '10px', background: '#f0fdf4', borderRadius: '8px', fontSize: '13px' }}>
                      <b>Réponse du provider:</b> {req.providerResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXPORTATEUR Tab 3: Carte */}
      {isExportateur && activeTab === 3 && (
        <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <MarkerClusterGroup>
              {allOffers.filter(o => o.latitude && o.longitude).map(o => (
                <Marker key={o.id} position={[o.latitude, o.longitude]} icon={blueIcon}>
                  <Popup>
                    <b>📦 {o.containerType}</b><br />
                    📍 {o.location}<br />
                    📅 {o.availableDate}<br />
                    <button
                      onClick={() => navigate(`/containers/marketplace/${o.id}`)}
                      style={{
                        marginTop: '6px', padding: '4px 10px', background: '#1d4ed8',
                        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                      }}
                    >
                      Voir l'offre →
                    </button>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
            {myRequests.filter(r => r.loadingLatitude && r.loadingLongitude).map(r => (
              <Marker key={r.id} position={[r.loadingLatitude, r.loadingLongitude]} icon={greenIcon}>
                <Popup>
                  <b>🔍 Ma Demande</b><br />
                  📍 {r.loadingLocation}<br />
                  📅 {r.requiredDate}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* FAB Button */}
      {isImportateur && (
        <button
          onClick={() => setShowOfferModal(true)}
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem', padding: '14px 20px',
            background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '99px',
            cursor: 'pointer', fontWeight: '600', fontSize: '14px', zIndex: 100,
            boxShadow: '0 4px 12px rgba(29,78,216,0.4)'
          }}
        >
          ➕ Nouvelle Offre
        </button>
      )}
      {isExportateur && (
        <button
          onClick={() => setShowRequestModal(true)}
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem', padding: '14px 20px',
            background: '#16a34a', color: 'white', border: 'none', borderRadius: '99px',
            cursor: 'pointer', fontWeight: '600', fontSize: '14px', zIndex: 100,
            boxShadow: '0 4px 12px rgba(22,163,74,0.4)'
          }}
        >
          ➕ Nouvelle Demande
        </button>
      )}

      {/* Modals */}
      <CreateOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSuccess={() => { setShowOfferModal(false); loadAll(); }}
      />
      <CreateRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => { setShowRequestModal(false); loadAll(); }}
      />
      {showEditModal && selectedRequest && (
        <EditRequestModal
          request={selectedRequest}
          onClose={() => { setShowEditModal(false); setSelectedRequest(null); }}
          onSuccess={() => { setShowEditModal(false); setSelectedRequest(null); loadAll(); }}
        />
      )}
    </div>
  );
}

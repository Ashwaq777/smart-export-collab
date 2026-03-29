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
  const [myMatches, setMyMatches] = useState([]);
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

      const matches = matchesRes.data?.data || matchesRes.data || [];
      setMyMatches(Array.isArray(matches) ? matches : []);

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
    console.log('Deleting offer ID:', id);
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
    // First, trigger matchmaking (for new matches)
    const res = await containerService.triggerMatchmaking(requestId);
    const newMatches = res.data?.data || [];
    
    // Then, get ALL existing matches for this user
    const allMatchesRes = await containerService.getMyMatches();
    const allMatches = allMatchesRes.data?.data || [];
    
    // Filter matches for this specific request
    const requestMatches = allMatches.filter(m => m.requestId === requestId);
    
    // Combine new matches with existing ones (avoid duplicates)
    const combinedMatches = [...requestMatches]; // Start with existing matches
    newMatches.forEach(newMatch => {
      if (!combinedMatches.some(m => m.offerId === newMatch.offerId)) {
        combinedMatches.push(newMatch);
      }
    });
    
    const count = combinedMatches.length;
    
    if (count > 0) {
      // Store matched offer IDs and scores for highlighting
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
    await loadAll();
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

  // Tabs definition per role
  const importateurTabs = ['📦 Mes Offres', '📬 Demandes reçues', '🤝 Mes Correspondances', '🗺️ Carte'];
  const exportateurTabs = ['🏪 Marketplace', '🔍 Mes Demandes', '📬 Mes Requêtes', '🤝 Mes Correspondances', '🗺️ Carte'];
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
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '20px 32px', 
        borderBottom: '1px solid #E2E8F0' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              color: '#0B1F3A', 
              margin: '0 0 4px 0' 
            }}>
              Marketplace de conteneurs
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: '#64748B', 
              margin: 0 
            }}>
              {isImportateur
                ? `${myOffers.length} offre(s) publiée(s)`
                : `${filteredOffers.length} conteneur(s) disponible(s) dans le monde`}
            </p>
          </div>
          
          {isExportateur && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Rechercher par type, port, destination..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ 
                  width: '400px',
                  padding: '10px 16px', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Tous', 'Standard 20', 'Standard 40', 'High Cube', 'Reefer'].map(filter => {
                  const isActive = filter === 'Tous' ? filterType === 'ALL' : 
                    filterType === filter.toUpperCase().replace(' ', '_');
                  return (
                    <button
                      key={filter}
                      onClick={() => setFilterType(filter === 'Tous' ? 'ALL' : 
                        filter.toUpperCase().replace(' ', '_'))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        background: isActive ? '#0B1F3A' : 'white',
                        color: isActive ? 'white' : '#64748B',
                        ...(isActive ? {} : { border: '1px solid #E2E8F0' })
                      }}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '24px' }}>

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

      {/* Search bar for exportateur - REMOVE OLD */}
      
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {myOffers.map(offer => (
                <div key={offer.id} style={{
                  background: 'white', 
                  borderRadius: '16px', 
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden'
                }}>
                  {/* Image */}
                  <div style={{
                    height: '180px', 
                    background: offer.imageUrls?.length > 0 ? 'transparent' : 'linear-gradient(135deg, #0B1F3A, #1CA7C7)',
                    display: 'flex',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden',
                    borderRadius: '16px 16px 0 0'
                  }}>
                    {offer.imageUrls?.length > 0 ? (
                      <img src={offer.imageUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    {/* Type badge */}
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: '#EFF6FF',
                        color: '#1D4ED8'
                      }}>
                        {offer.containerType?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#0B1F3A',
                      marginBottom: '8px'
                    }}>
                      {offer.containerType?.replace(/_/g, ' ')}
                    </div>
                    
                    {/* Location */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      fontSize: '14px', 
                      color: '#64748B',
                      marginBottom: '4px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {offer.location}
                    </div>
                    
                    {/* Date */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      fontSize: '14px', 
                      color: '#64748B',
                      marginBottom: '12px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {offer.availableDate}
                    </div>
                    
                    {/* Match indicator */}
                    {matchedOfferIds.includes(offer.id) && (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: '#DCFCE7',
                          color: '#15803D'
                        }}>
                          🎯 Correspond à votre demande
                        </span>
                        {matchScores[offer.id] && (
                          <div style={{ marginTop: '4px' }}>
                            <div style={{
                              height: '4px',
                              background: '#E5E7EB',
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${matchScores[offer.id]}%`,
                                background: '#16A34A'
                              }} />
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                              {Math.round(matchScores[offer.id])}% compatible
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Separator */}
                    <div style={{ 
                      height: '1px', 
                      background: '#E2E8F0', 
                      marginBottom: '12px' 
                    }} />
                    
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/containers/marketplace/${offer.id}`)}
                        style={{
                          flex: 1, 
                          padding: '8px', 
                          background: '#0B1F3A', 
                          color: 'white',
                          border: 'none', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Voir les détails
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        style={{
                          padding: '8px 12px', 
                          background: '#FEE2E2', 
                          color: '#DC2626',
                          border: 'none', 
                          borderRadius: '8px', 
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

      {/* IMPORTATEUR Tab 2: Mes Correspondances */}
      {isImportateur && activeTab === 2 && (
        <div>
          {myMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
              <div style={{ fontSize: '48px' }}>🤝</div>
              <h3>Aucune correspondance</h3>
              <p style={{ color: '#6b7280' }}>Les correspondances apparaissent ici quand des exportateurs trouvent vos offres</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myMatches.map(match => (
                <div key={match.id} style={{
                  background: 'white', borderRadius: '12px', padding: '1.5rem',
                  border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                        🤝 Match #{match.id}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        Offre: {match.offerContainerType} à {match.offerLocation}<br />
                        Demande: {match.requestContainerType} à {match.requestLocation}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px', padding: '4px 10px', borderRadius: '99px',
                      background: match.status === 'CONFIRMED' ? '#d1fae5' : '#fef3c7',
                      color: match.status === 'CONFIRMED' ? '#065f46' : '#92400e'
                    }}>
                      {match.status === 'CONFIRMED' ? '✅ Confirmé' : 
                       match.status === 'ACCEPTED_BY_PROVIDER' ? '✅ Accepté par vous' :
                       match.status === 'ACCEPTED_BY_SEEKER' ? '✅ Accepté par seeker' : '⏳ En attente'}
                    </span>
                  </div>
                  <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', fontSize: '13px', marginBottom: '1rem' }}>
                    <b>Compatibilité:</b> {Math.round(match.compatibilityScore || 0)}% | 
                    <b>Distance:</b> {Math.round(match.distanceKm || 0)}km
                  </div>
                  {match.status !== 'CONFIRMED' && (
                    <button
                      onClick={() => handleConfirmMatch(match.id)}
                      style={{
                        padding: '8px 16px', background: '#16a34a', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                      }}
                    >
                      ✅ Confirmer ce match
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* IMPORTATEUR Tab 3: Carte */}
      {isImportateur && activeTab === 3 && (
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
                          background: matchScore >= 70 ? 'linear-gradient(135deg, #16a34a, #22c55e)' 
                               : matchScore >= 40 ? 'linear-gradient(135deg, #d97706, #f59e0b)' 
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

      {/* EXPORTATEUR Tab 3: Mes Correspondances */}
      {isExportateur && activeTab === 3 && (
        <div>
          {myMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
              <div style={{ fontSize: '48px' }}>🤝</div>
              <h3>Aucune correspondance</h3>
              <p style={{ color: '#6b7280' }}>Les correspondances apparaissent ici quand vous trouvez des offres via le matchmaking</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myMatches.map(match => (
                <div key={match.id} style={{
                  background: 'white', borderRadius: '12px', padding: '1.5rem',
                  border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                        🤝 Match #{match.id}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        Offre: {match.offerContainerType} à {match.offerLocation}<br />
                        Demande: {match.requestContainerType} à {match.requestLocation}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px', padding: '4px 10px', borderRadius: '99px',
                      background: match.status === 'CONFIRMED' ? '#d1fae5' : '#fef3c7',
                      color: match.status === 'CONFIRMED' ? '#065f46' : '#92400e'
                    }}>
                      {match.status === 'CONFIRMED' ? '✅ Confirmé' : 
                       match.status === 'ACCEPTED_BY_SEEKER' ? '✅ Accepté par vous' :
                       match.status === 'ACCEPTED_BY_PROVIDER' ? '✅ Accepté par provider' : '⏳ En attente'}
                    </span>
                  </div>
                  <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', fontSize: '13px', marginBottom: '1rem' }}>
                    <b>Compatibilité:</b> {Math.round(match.compatibilityScore || 0)}% | 
                    <b>Distance:</b> {Math.round(match.distanceKm || 0)}km
                  </div>
                  {match.status !== 'CONFIRMED' && (
                    <button
                      onClick={() => handleConfirmMatch(match.id)}
                      style={{
                        padding: '8px 16px', background: '#16a34a', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                      }}
                    >
                      ✅ Confirmer ce match
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXPORTATEUR Tab 4: Carte */}
      {isExportateur && activeTab === 4 && (
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
    </div>
  );
}

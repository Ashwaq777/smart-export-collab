import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t: translate } = useLanguage();
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
      const [dashRes, allOffersRes, matchesRes, requestsRes, sentRes] = await Promise.all([
        containerService.getDashboard(),
        containerService.getAllOffers(),
        containerService.getMyMatches(),
        containerService.getMyRequests(), // Matching requests
        containerService.getSentRequests(), // Direct requests sent to importers
      ]);

      const dash = dashRes.data?.data || dashRes.data || {};
      setDashboard(dash);
      setMyOffers(dash.myOffers || []);
      setMyRequests(requestsRes.data?.data || requestsRes.data || []); // Matching requests (for "Mes Requêtes")
      setSentRequests(sentRes.data?.data || sentRes.data || []); // Direct requests (for "Mes Demandes")

      const all = allOffersRes.data?.data || allOffersRes.data || [];
      setAllOffers(Array.isArray(all) ? all.filter(o => o.status === 'AVAILABLE') : []);
      setReceivedRequests(dash.receivedRequests || []);
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
    if (!window.confirm(translate('marketplace.deleteOffer'))) return;
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
    if (!window.confirm(translate('marketplace.deleteRequest'))) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/containers/requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      await response.json();
      loadAll();
    } catch (e) { 
      alert('Erreur: ' + e.message); 
    }
  };

  const handleDeleteDirectRequest = async (id) => {
    if (!window.confirm(translate('marketplace.deleteDirectRequest'))) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/containers/direct-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      await response.json();
      loadAll();
    } catch (e) { 
      alert('Erreur: ' + e.message); 
    }
  };

  const handleMatch = async (requestId) => {
  setMatchingId(requestId);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:8080/api/v1/containers/requests/${requestId}/match`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    const newMatches = data.data || [];
    
    if (newMatches.length > 0) {
      setMyMatches(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const toAdd = newMatches.filter(m => !existingIds.has(m.id));
        return [...prev, ...toAdd];
      });
      alert(`${newMatches.length} ${translate('marketplace.matchesFound')}`);
    } else {
      // Même si 0 nouveaux matches, charger les matches existants
      const matchesRes = await fetch(
        'http://localhost:8080/api/v1/containers/matches/my',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const matchesData = await matchesRes.json();
      const existingMatches = matchesData.data || [];
      const requestMatches = existingMatches.filter(
        m => m.requestId === requestId || m.request?.id === requestId
      );
      
      if (requestMatches.length > 0) {
        setMyMatches(existingMatches);
        alert(`ℹ️ ${requestMatches.length} ${translate('marketplace.matchesAlreadyFound')}`);
      } else {
        alert(translate('marketplace.noMatchFound'));
      }
    }
    
    loadAll();
  } catch(e) {
    console.error('Match error:', e);
    alert('Erreur lors du matching: ' + e.message);
  } finally {
    setMatchingId(null);
  }
};

  const handleConfirmMatch = async (matchId) => {
    try {
      await containerService.confirmMatch(matchId);
      alert('Match confirmé ! La transaction a été créée.');
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
      alert(accepted ? 'Demande acceptée !' : 'Demande refusée');
      loadAll();
    } catch (e) { alert('Erreur: ' + e.message); }
  };

  const containerTypes = ['ALL','STANDARD_20',
    'STANDARD_40','HIGH_CUBE_40',
    'REEFER_20','REEFER_40'];
  const cargoTypes = ['ALL','DRY','REEFER',
    'DANGEROUS','PERISHABLE'];

  // Tabs definition per role
  const importateurTabs = [translate('marketplace.myOffers'), translate('marketplace.myRequests'), translate('marketplace.myMatches'), translate('marketplace.map')];
  const exportateurTabs = [
  translate('marketplace.title'),
  translate('marketplace.myOffers'),
  translate('marketplace.myRequests'),
  translate('marketplace.myMatches'),
  translate('marketplace.map')
];
  const tabs = isImportateur ? importateurTabs : exportateurTabs;

  const statCards = [
    { label: translate('marketplace.myOffers'), value: myOffers.length, color: '#1d4ed8', bg: '#dbeafe', icon: '' },
    { label: translate('marketplace.myRequests'), value: myRequests.length, color: '#16a34a', bg: '#d1fae5', icon: '' },
    { label: 'Transactions', value: dashboard.completedTransactions || 0, color: '#7c3aed', bg: '#ede9fe', icon: '' },
  ];

  return (
    <div>
      {/* Bandeau bleu gradient avec titre */}
      <div style={{
  background: 'linear-gradient(135deg, #0B1F3A 0%, #1CA7C7 100%)',
  padding: '40px 32px',
  width: '100%',
  margin: 0
}}>
  <h1 style={{
    color: 'white',
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    lineHeight: '1.2'
  }}>
    {translate('marketplace.title')}
  </h1>
  <p style={{
    color: 'rgba(255,255,255,0.8)',
    margin: '8px 0 0 0',
    fontSize: '16px'
  }}>
    {translate('marketplace.subtitle')}
  </p>
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
          placeholder={translate('marketplace.search')}
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
              {t === 'ALL' ? translate('marketplace.allTypes') : t}
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
              {t === 'ALL' ? translate('marketplace.allCargo') : t}
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
                  {translate('marketplace.loading')}
                </div>
              ) : filtered.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '4rem',
                  background: 'white', borderRadius: '12px',
                  border: '1px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: '48px' }}>�</div>
                  <h3>{translate('marketplace.noContainerAvailable')}</h3>
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
              {sentRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '48px' }}>�</div>
                  <h3>{translate('marketplace.noDirectRequest')}</h3>
                  <p style={{ color: '#6b7280' }}>{translate('marketplace.noDirectRequestDesc')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sentRequests.map(r => (
                    <div key={r.id} style={{
                      background: 'white', 
                      borderRadius: '16px', 
                      padding: '20px',
                      border: '1px solid #E2E8F0', 
                      display: 'flex',
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '16px',
                          marginBottom: '8px',
                          color: '#0B1F3A'
                        }}>
                          Demande directe à {r.providerName || translate('marketplace.importer')}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {r.offerLocation || 'Localisation inconnue'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {r.requiredDate ? new Date(r.requiredDate).toLocaleDateString() : translate('marketplace.noDate')}
                          </div>
                          <div style={{ 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '10px',
                            fontWeight: '500',
                            background: r.status === 'ACCEPTED' ? '#DCFCE7' : 
                                       r.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                            color: r.status === 'ACCEPTED' ? '#166534' : 
                                   r.status === 'REJECTED' ? '#DC2626' : '#92400E'
                          }}>
                            {r.status === 'ACCEPTED' ? translate('marketplace.accepted') : 
                             r.status === 'REJECTED' ? translate('marketplace.rejected') : translate('marketplace.pending')}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => { /* TODO: View details */ }}
                          style={{
                            padding: '8px', 
                            background: 'white', 
                            color: '#1D4ED8',
                            border: '1px solid #DBEAFE', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {translate('marketplace.details')}
                        </button>
                        <button
                          onClick={() => handleDeleteDirectRequest(r.id)}
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
                          {translate('marketplace.delete')}
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
              {myRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '48px' }}>📋</div>
                  <h3>{translate('marketplace.noMatchRequest')}</h3>
                  <p style={{ color: '#6b7280' }}>{translate('marketplace.noMatchRequestDesc')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myRequests.map(r => (
                    <div key={r.id} style={{
                      background: 'white', 
                      borderRadius: '16px', 
                      padding: '20px',
                      border: '1px solid #E2E8F0', 
                      display: 'flex',
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '16px',
                          marginBottom: '8px',
                          color: '#0B1F3A'
                        }}>
                          {r.containerType?.replace(/_/g, ' ')}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {r.loadingLocation}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {r.requiredDate}
                          </div>
                          {r.cargoType && (
                            <div style={{ 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontSize: '10px',
                              fontWeight: '500',
                              background: '#F3F4F6',
                              color: '#374151'
                            }}>
                              {r.cargoType}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleMatch(r.id)}
                          disabled={matchingId === r.id}
                          style={{
                            padding: '10px 16px', 
                            background: matchingId === r.id ? '#9CA3AF' : '#0B1F3A', 
                            color: 'white',
                            border: 'none', 
                            borderRadius: '10px', 
                            cursor: matchingId === r.id ? 'not-allowed' : 'pointer', 
                            fontSize: '12px',
                            fontWeight: '500',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (matchingId !== r.id) {
                              e.target.style.background = '#1CA7C7'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (matchingId !== r.id) {
                              e.target.style.background = '#0B1F3A'
                            }
                          }}
                        >
                          {matchingId === r.id ? translate('marketplace.searching') : translate('marketplace.findMatches')}
                        </button>
                        <button
                          onClick={() => { setSelectedRequest(r); setShowEditModal(true); }}
                          style={{
                            padding: '8px', 
                            background: 'white', 
                            color: '#1D4ED8',
                            border: '1px solid #DBEAFE', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {translate('marketplace.edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(r.id)}
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
                          {translate('marketplace.delete')}
                        </button>
                      </div>
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
                  <h3>{translate('marketplace.noMatches')}</h3>
                  <p style={{ color: '#6b7280' }}>{translate('marketplace.noMatchesDesc')}</p>
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
                          <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                            🤝 Match #{match.id}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            {translate('marketplace.offer')}: {match.offerContainerType} à {match.offerLocation}<br />
                            {translate('marketplace.request')}: {match.requestContainerType} à {match.requestLocation}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          <div style={{
                            display: 'inline-block',
                            background: match.compatibilityScore >= 80 ? '#d1fae5' : 
                                       match.compatibilityScore >= 60 ? '#fef3c7' : '#fee2e2',
                            color: match.compatibilityScore >= 80 ? '#065f46' : 
                                   match.compatibilityScore >= 60 ? '#92400e' : '#991b1b',
                            padding: '4px 10px',
                            borderRadius: '99px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {`${Math.round(match.compatibilityScore || 0)}%`} {translate('marketplace.compatible')}
                          </div>
                          <span style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {Math.round(match.distanceKm || 0)} km
                          </span>
                          <span style={{
                            fontSize: '12px', padding: '4px 10px', borderRadius: '99px',
                            background: match.status === 'CONFIRMED' ? '#d1fae5' : '#fef3c7',
                            color: match.status === 'CONFIRMED' ? '#065f46' : '#92400e'
                          }}>
                            {match.status === 'CONFIRMED' ? 'Confirmé' : 
                             match.status === 'ACCEPTED_BY_SEEKER' ? 'Accepté par vous' :
                             match.status === 'ACCEPTED_BY_PROVIDER' ? 'Accepté par provider' : translate('marketplace.pending')}
                          </span>
                        </div>
                      </div>
                      {match.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleConfirmMatch(match.id)}
                          style={{
                            padding: '8px 16px', background: '#16a34a', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                          }}
                        >
                          {translate('marketplace.confirmMatch')}
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
              {translate('marketplace.loading')}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '4rem',
              background: 'white', borderRadius: '12px',
              border: '1px dashed #d1d5db'
            }}>
              <div style={{ fontSize: '48px' }}>�</div>
              <h3>Aucun conteneur disponible</h3>
              <p style={{ color: '#6b7280' }}>
                Revenez plus tard ou modifiez vos filtres
              </p>
            </div>
          ) : isImportateur && (
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
                  user={user}
                  isImportateur={isImportateur}
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
                {translate('marketplace.newOffer')}
              </button>
            </div>
          )}

          {/* ============ IMPORTATEUR TABS ============ */}
          {/* IMPORTATEUR Tab 0: Mes Offres */}
          {isImportateur && activeTab === 0 && (
            <div>
              {myOffers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                  <div style={{ fontSize: '48px' }}>�</div>
                  <h3>{translate('marketplace.noOfferPublished')}</h3>
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
                              {`${Math.round(matchScores[offer.id] || 0)}%`} {translate('marketplace.compatible')}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                          {offer.location}
                        </div>
                        
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                          {translate('marketplace.available')}: {offer.availableDate ? new Date(offer.availableDate).toLocaleDateString('fr-FR') : 'N/A'}
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
                            {translate('marketplace.edit')}
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
                          {translate('marketplace.viewDetails')}
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
                            {translate('marketplace.delete')}
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
                  <h3>{translate('marketplace.noRequestReceived')}</h3>
                  <p style={{ color: '#6b7280' }}>{translate('marketplace.noRequestReceivedDesc')}</p>
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
                  <h3>{translate('marketplace.noMatches')}</h3>
                  <p style={{ color: '#6b7280' }}>{translate('marketplace.noMatchesImporterDesc')}</p>
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
                          <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                            🤝 Match #{match.id}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            {translate('marketplace.offer')}: {match.offerContainerType} à {match.offerLocation}<br />
                            {translate('marketplace.request')}: {match.requestContainerType} à {match.requestLocation}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          <div style={{
                            display: 'inline-block',
                            background: match.compatibilityScore >= 80 ? '#d1fae5' : 
                                       match.compatibilityScore >= 60 ? '#fef3c7' : '#fee2e2',
                            color: match.compatibilityScore >= 80 ? '#065f46' : 
                                   match.compatibilityScore >= 60 ? '#92400e' : '#991b1b',
                            padding: '4px 10px',
                            borderRadius: '99px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {`${Math.round(match.compatibilityScore || 0)}%`} {translate('marketplace.compatible')}
                          </div>
                          <span style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {Math.round(match.distanceKm || 0)} km
                          </span>
                          <span style={{
                            fontSize: '12px', padding: '4px 10px', borderRadius: '99px',
                            background: match.status === 'CONFIRMED' ? '#d1fae5' : '#fef3c7',
                            color: match.status === 'CONFIRMED' ? '#065f46' : '#92400e'
                          }}>
                            {match.status === 'CONFIRMED' ? 'Confirmé' : 
                             match.status === 'ACCEPTED_BY_PROVIDER' ? 'Accepté par vous' :
                             match.status === 'ACCEPTED_BY_SEEKER' ? 'Accepté par seeker' : translate('marketplace.pending')}
                          </span>
                        </div>
                      </div>
                      {match.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleConfirmMatch(match.id)}
                          style={{
                            padding: '8px 16px', background: '#16a34a', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                          }}
                        >
                          {translate('marketplace.confirmMatch')}
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
          {translate('marketplace.newRequest')}
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

function OfferCard({ offer, onClick, user, isImportateur }) {
  const { t: translate } = useLanguage();
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
                '<div style="font-size:64px">�</div>';
            }}
          />
        ) : (
          <div style={{ fontSize: '64px' }}>�</div>
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
            ? translate('marketplace.available') 
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
          {offer.location}
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
            {translate('marketplace.viewDetails')} →
          </span>
        </div>

        {/* Bouton "Envoyer une demande" - uniquement pour les importateurs sur les offres des autres */}
        {isImportateur && offer.userId !== user?.id && (
          <div style={{ padding: '0.75rem 1rem 1rem' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Logique pour envoyer une demande
                console.log('Envoyer une demande pour l\'offre:', offer.id);
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#0B1F3A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1CA7C7';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#0B1F3A';
              }}
            >
              {translate('marketplace.sendRequest')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

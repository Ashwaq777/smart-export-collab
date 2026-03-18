import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useAuth } from '../../context/AuthContext'
import containerService from '../../services/containerService'
import CreateOfferModal from './CreateOfferModal'
import CreateRequestModal from './CreateRequestModal'
import EditRequestModal from './EditRequestModal'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ContainerDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({})
  const [myRequests, setMyRequests] = useState([])
  const [myOffers, setMyOffers] = useState([])
  const [allOffers, setAllOffers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showEditRequestModal, setShowEditRequestModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('offers')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [dashRes, offersRes, requestsRes, allOffersRes] = await Promise.all([
        containerService.getDashboard(),
        containerService.getMyOffers(),
        containerService.getMyRequests(),
        containerService.getAvailableOffers(),
      ]);
      
      const dash = dashRes.data?.data || dashRes.data;
      setDashboardData(dash);
      
      const offers = offersRes.data?.data || offersRes.data || [];
      setMyOffers(offers);
      
      const requests = requestsRes.data?.data || requestsRes.data || [];
      setMyRequests(requests);
      
      const allOffers = allOffersRes.data?.data || allOffersRes.data || [];
      setAllOffers(allOffers);
      
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = (myRequests || []).filter(r =>
    r.loadingLocation?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    r.containerType?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    r.status?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const filteredOffers = (myOffers || []).filter(o =>
    o.location?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    o.containerType?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    o.status?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleDeleteOffer = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await containerService.deleteOffer(id)
        loadDashboardData()
      } catch (error) {
        console.error('Error deleting offer:', error)
      }
    }
  }

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Supprimer cette demande ?')) return;
    try {
      await containerService.deleteRequest(id);
      loadDashboardData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleTriggerMatch = async (id) => {
    try {
      const res = await containerService.triggerMatchmaking(id);
      const matches = res.data?.data || res.data || [];
      const count = Array.isArray(matches) ? matches.length : 0;
      alert(`${count} correspondance(s) trouvée(s) !`);
      loadDashboardData();
    } catch (err) {
      alert('Erreur lors de la recherche de correspondances');
    }
  };

  const handleViewMatches = async (requestId) => {
    try {
      await containerService.triggerMatchmaking(requestId)
      window.alert('Correspondances recherchées avec succès !')
      loadDashboardData()
    } catch (error) {
      console.error('Error triggering matchmaking:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Offres',
      value: (myOffers || []).length,
      icon: '📦',
      color: 'bg-blue-500'
    },
    {
      label: 'Total Demandes',
      value: (myRequests || []).length,
      icon: '🎯',
      color: 'bg-green-500'
    },
    {
      label: 'Correspondances',
      value: 0, // dashboardData?.totalMatches || 0,
      icon: '🤝',
      color: 'bg-yellow-500'
    },
    {
      label: 'Transactions',
      value: 0, // dashboardData?.totalTransactions || 0,
      icon: '📋',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tableau de Bord Conteneurs</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carte des Disponibilités */}
<div style={{ 
  background: 'white', 
  borderRadius: '12px', 
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  marginBottom: '1.5rem'
}}>
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '1rem'
  }}>
    <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
      🗺️ Carte des Disponibilités Mondiales
    </h2>
    <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
      <span>
        <span style={{ 
          display: 'inline-block', width: '12px', height: '12px',
          background: '#3b82f6', borderRadius: '50%', marginRight: '4px'
        }}></span>
        Offres disponibles ({allOffers.filter(o => o.latitude && o.longitude).length})
      </span>
      <span>
        <span style={{ 
          display: 'inline-block', width: '12px', height: '12px',
          background: '#22c55e', borderRadius: '50%', marginRight: '4px'
        }}></span>
        Mes demandes ({myRequests.filter(r => r.loadingLatitude && r.loadingLongitude).length})
      </span>
    </div>
  </div>

  <div style={{ height: '450px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />

      {/* Blue markers — ALL available offers */}
      <MarkerClusterGroup>
        {allOffers
          .filter(o => o.latitude && o.longitude)
          .map(offer => (
            <Marker 
              key={`offer-${offer.id}`} 
              position={[offer.latitude, offer.longitude]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
              })}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <strong style={{ color: '#1d4ed8' }}>
                    📦 Offre disponible
                  </strong>
                  <hr style={{ margin: '6px 0' }}/>
                  <div><b>Type:</b> {offer.containerType}</div>
                  <div><b>Cargaison:</b> {offer.cargoType}</div>
                  <div><b>Port:</b> {offer.location}</div>
                  <div><b>Disponible:</b> {offer.availableDate}</div>
                  <div><b>Statut:</b> 
                    <span style={{ 
                      color: '#16a34a', 
                      fontWeight: '600',
                      marginLeft: '4px'
                    }}>
                      {offer.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        }
      </MarkerClusterGroup>

      {/* Green markers — MY requests */}
      {myRequests
        .filter(r => r.loadingLatitude && r.loadingLongitude)
        .map(request => (
          <Marker
            key={`request-${request.id}`}
            position={[request.loadingLatitude, request.loadingLongitude]}
            icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <strong style={{ color: '#15803d' }}>
                  🔍 Ma Demande
                </strong>
                <hr style={{ margin: '6px 0' }}/>
                <div><b>Type:</b> {request.containerType}</div>
                <div><b>Port:</b> {request.loadingLocation}</div>
                <div><b>Date requise:</b> {request.requiredDate}</div>
                <div><b>Statut:</b> {request.status}</div>
              </div>
            </Popup>
          </Marker>
        ))
      }
    </MapContainer>
  </div>
</div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Rechercher par localisation, type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 
                     rounded-lg focus:outline-none focus:ring-2 
                     focus:ring-blue-500"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('offers')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'offers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes Offres
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes Demandes
            </button>
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'offers' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {offer.containerType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {offer.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {offer.availableDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          offer.status === 'AVAILABLE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date requise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.containerType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.loadingLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.requiredDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'SEARCHING' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
  <div style={{ display: 'flex', gap: '8px' }}>
    <button
      onClick={() => {
        setSelectedRequest(request);
        setShowEditRequestModal(true);
      }}
      className="px-3 py-1 text-sm bg-blue-100 
                 text-blue-700 rounded hover:bg-blue-200"
    >
      ✏️ Modifier
    </button>
    <button
      onClick={() => handleDeleteRequest(request.id)}
      className="px-3 py-1 text-sm bg-red-100 
                 text-red-700 rounded hover:bg-red-200"
    >
      🗑️ Supprimer
    </button>
    <button
      onClick={() => handleTriggerMatch(request.id)}
      className="px-3 py-1 text-sm bg-green-100 
                 text-green-700 rounded hover:bg-green-200"
    >
      🔍 Chercher
    </button>
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center space-x-2"
        >
          <span>{user?.role === 'IMPORTATEUR' ? '➕ Nouvelle Offre' : '➕ Nouvelle Demande'}</span>
        </button>
      </div>

      {/* Modals */}
      {user?.role === 'IMPORTATEUR' && (
        <CreateOfferModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadDashboardData}
        />
      )}
      
      {user?.role === 'EXPORTATEUR' && (
        <CreateRequestModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadDashboardData}
        />
      )}

      {showEditRequestModal && selectedRequest && (
        <EditRequestModal
          request={selectedRequest}
          onClose={() => {
            setShowEditRequestModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            setShowEditRequestModal(false);
            setSelectedRequest(null);
            loadDashboardData();
          }}
        />
      )}
    </div>
  )
}

export default ContainerDashboard

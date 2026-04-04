import { useState, useEffect } from 'react'
import { Package, MapPin, User, Trash2, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function AdminContainerManager() {
  const { t: translate } = useLanguage()
  const [containers, setContainers] = useState([])
  const [stats, setStats] = useState({
    totalActive: 0,
    totalInactive: 0,
    typeDistribution: {},
    countryDistribution: {}
  })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  const token = localStorage.getItem('token')

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/containers/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setStats(data || { totalActive: 0, totalInactive: 0, typeDistribution: {}, countryDistribution: {} });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadContainers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8080/api/admin/containers?page=${page}&size=${size}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setContainers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error loading containers:', error);
      setContainers([]);
    } finally {
      setLoading(false);
    }
  };

  const deactivateContainer = async (id) => {
    if (!window.confirm(translate('admin.marketplace.confirmDeactivate'))) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/containers/${id}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      loadContainers();
      loadStats();
    } catch (error) {
      console.error('Error deactivating container:', error);
      alert('Erreur lors de la désactivation');
    }
  };

  const deleteContainer = async (id) => {
    if (!window.confirm('Supprimer définitivement ce conteneur ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/containers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      loadContainers();
      loadStats();
    } catch (error) {
      console.error('Error deleting container:', error);
      alert('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadContainers()
  }, [page])

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  }

  const thSt = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#0B1F3A'
  }

  const tdSt = {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#374151',
    borderBottom: '1px solid #F3F4F6'
  }

  return (
    <div>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={24} color="#16A34A" />
            </div>
          </div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#0B1F3A',
            marginBottom: '0.25rem'
          }}>
            {stats.totalActive}
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: '#64748B',
            fontWeight: '500'
          }}>
            {translate('admin.marketplace.activeOffers')}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EyeOff size={24} color="#DC2626" />
            </div>
          </div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#0B1F3A',
            marginBottom: '0.25rem'
          }}>
            {stats.totalInactive}
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: '#64748B',
            fontWeight: '500'
          }}>
            {translate('admin.marketplace.inactiveOffers')}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#0B1F3A',
            marginBottom: '1rem'
          }}>
            {translate('admin.marketplace.byType')}
          </div>
          {Object.entries(stats.typeDistribution || {}).map(([type, count]) => (
            <div key={type} style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <span style={{ color: '#64748B' }}>{type}</span>
              <span style={{ fontWeight: '600', color: '#0B1F3A' }}>{count}</span>
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#0B1F3A',
            marginBottom: '1rem'
          }}>
            {translate('admin.marketplace.byCountry')}
          </div>
          {Object.entries(stats.countryDistribution || {}).slice(0, 3).map(([country, count]) => (
            <div key={country} style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <span style={{ color: '#64748B' }}>{country}</span>
              <span style={{ fontWeight: '600', color: '#0B1F3A' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <h2 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#0B1F3A',
          margin: '0 0 1rem 0'
        }}>
          {translate('admin.marketplace.containerList')}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
            Chargement...
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {[translate('admin.marketplace.columns.id'), translate('admin.marketplace.columns.type'), translate('admin.marketplace.columns.country'), translate('admin.marketplace.columns.owner'), translate('admin.marketplace.columns.email'), translate('admin.marketplace.columns.status'), translate('admin.marketplace.columns.actions')].map(header => (
                      <th key={header} style={thSt}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {containers.map((container, index) => (
                    <tr key={container.id} style={{
                      background: index % 2 === 0 ? 'white' : '#F8FAFC',
                      borderBottom: '1px solid #E2E8F0'
                    }}>
                      <td style={tdSt}>#{container.id}</td>
                      <td style={tdSt}>{container.containerType}</td>
                      <td style={tdSt}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={14} color="#64748B" />
                          {container.location}
                        </div>
                      </td>
                      <td style={tdSt}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={14} color="#64748B" />
                          {container.ownerName}
                        </div>
                      </td>
                      <td style={tdSt}>{container.ownerEmail}</td>
                      <td style={tdSt}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.6875rem',
                          fontWeight: '600',
                          background: container.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2',
                          color: container.status === 'ACTIVE' ? '#15803D' : '#DC2626'
                        }}>
                          {container.status}
                        </span>
                      </td>
                      <td style={tdSt}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => deactivateContainer(container.id)}
                            disabled={container.status !== 'ACTIVE'}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: container.status === 'ACTIVE' ? '#F59E0B' : '#E5E7EB',
                              color: container.status === 'ACTIVE' ? 'white' : '#9CA3AF',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: container.status === 'ACTIVE' ? 'pointer' : 'not-allowed',
                              fontSize: '0.75rem'
                            }}
                          >
                            {translate('admin.marketplace.actions.deactivate')}
                          </button>
                          <button
                            onClick={() => deleteContainer(container.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#DC2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem'
              }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    background: page === 0 ? '#E5E7EB' : '#0B1F3A',
                    color: page === 0 ? '#9CA3AF' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Précédent
                </button>
                <span style={{
                  padding: '0.5rem 1rem',
                  color: '#64748B',
                  fontSize: '0.875rem'
                }}>
                  Page {page + 1} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: page === totalPages - 1 ? '#E5E7EB' : '#0B1F3A',
                    color: page === totalPages - 1 ? '#9CA3AF' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

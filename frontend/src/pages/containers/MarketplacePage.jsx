import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import containerService from '../../services/containerService';

export default function MarketplacePage() {
  const [offers, setOffers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCargo, setFilterCargo] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => { loadOffers(); }, []);

  useEffect(() => {
    let result = offers;
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
    setFiltered(result);
  }, [search, filterType, filterCargo, offers]);

  const loadOffers = async () => {
    try {
      const res = await containerService.getAllOffers();
      const data = res.data?.data || res.data || [];
      setOffers(Array.isArray(data) ? data : []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerTypes = ['ALL','STANDARD_20',
    'STANDARD_40','HIGH_CUBE_40',
    'REEFER_20','REEFER_40'];
  const cargoTypes = ['ALL','DRY','REEFER',
    'DANGEROUS','PERISHABLE'];

  return (
    <div style={{ padding: '2rem', 
                  maxWidth: '1400px', 
                  margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', 
                     fontWeight: '700',
                     margin: '0 0 8px' }}>
          🏪 Marketplace Conteneurs
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {filtered.length} conteneur(s) disponible(s) 
          dans le monde
        </p>
      </div>

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

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import containerService from '../../services/containerService';

export default function OfferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t: translate } = useLanguage();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => { loadOffer(); }, [id]);

  const loadOffer = async () => {
    try {
      const res = await containerService.getOfferById(id);
      setOffer(res.data?.data || res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '400px'
    }}>
      Chargement...
    </div>
  );

  if (!offer) return (
    <div style={{ padding: '2rem' }}>
      Offre introuvable
    </div>
  );

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1100px', 
      margin: '0 auto' 
    }}>
      <button
        onClick={() => navigate('/containers/marketplace')}
        style={{
          background: 'none', border: 'none',
          cursor: 'pointer', color: '#1d4ed8',
          fontSize: '14px', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center',
          gap: '6px'
        }}
      >
        Retour au marketplace
      </button>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '2rem'
      }}>
        <div>
          <div style={{
            background: '#f3f4f6',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1rem',
            height: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {offer.imageUrls?.length > 0 ? (
              <img
                src={offer.imageUrls[selectedImage]}
                alt={offer.containerType}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{ fontSize: '80px' }}>�</div>
            )}
          </div>

          {offer.imageUrls?.length > 1 && (
            <div style={{
              display: 'flex', gap: '8px',
              marginBottom: '1.5rem',
              overflowX: 'auto'
            }}>
              {offer.imageUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Photo ${idx + 1}`}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: '80px', height: '60px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: selectedImage === idx
                      ? '2px solid #1d4ed8'
                      : '2px solid transparent',
                    flexShrink: 0
                  }}
                />
              ))}
            </div>
          )}

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '22px', fontWeight: '700',
              margin: '0 0 1rem' 
            }}>
              {offer.containerType?.replace(/_/g, ' ')}
            </h2>

            {offer.description && (
              <p style={{ 
                color: '#374151', 
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                {offer.description}
              </p>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              {[
                ['Type', offer.containerType],
                ['Cargaison', offer.cargoType],
                ['Port', offer.portName || offer.location],
                ['Disponible', offer.availableDate],
                [translate('offerDetail.number'), offer.containerNumber || 'N/A'],
                [translate('offerDetail.condition'), offer.technicalCondition || 'N/A'],
                [translate('offerDetail.year'), offer.yearOfManufacture || 'N/A'],
                [translate('offerDetail.status'), offer.status],
              ].map(([label, value]) => (
                <div key={label} style={{
                  padding: '12px',
                  background: '#f8faff',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827'
                  }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            position: 'sticky',
            top: '2rem'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#16a34a',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Conteneur disponible
            </div>

            <div style={{
              padding: '12px',
              background: '#f0fdf4',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '13px',
              color: '#374151'
            }}>
              <div><b>Provider:</b> {offer.providerName}</div>
              <div><b>Port:</b> {offer.portName || offer.location}</div>
              <div>
                <b>Disponible le:</b> {offer.availableDate}
              </div>
            </div>

            {/* Bouton "Envoyer une demande" - uniquement pour les exportateurs */}
            {user?.role === 'EXPORTATEUR' && (
              <button
                onClick={() => navigate(
                  `/containers/marketplace/${id}/request`)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#1d4ed8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px',
                  marginBottom: '10px'
                }}
              >
                📩 Envoyer une demande
              </button>
            )}

            <button
              onClick={() => navigate(
                '/containers/marketplace')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Retour marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

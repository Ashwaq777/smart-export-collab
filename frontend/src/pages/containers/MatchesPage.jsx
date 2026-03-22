import { useState, useEffect } from 'react';
import containerService from '../../services/containerService';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res = await containerService.getMyMatches();
      console.log('MATCHES RAW:', res.data);
      const data = res.data?.data || res.data || [];
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('MATCHES ERROR:', err.response?.data || err.message);
      setError('Erreur chargement correspondances');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (matchId) => {
    try {
      await containerService.confirmMatch(matchId);
      await loadMatches();
      alert('Correspondance confirmée !');
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (matchId) => {
    if (!window.confirm('Rejeter cette correspondance ?')) return;
    try {
      await containerService.rejectMatch(matchId);
      await loadMatches();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#16a34a';
    if (score >= 40) return '#d97706';
    return '#dc2626';
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: '#fef3c7', color: '#92400e', label: '⏳ En attente' },
      ACCEPTED_BY_PROVIDER: { bg: '#dbeafe', color: '#1e40af', label: '✅ Accepté provider' },
      ACCEPTED_BY_SEEKER: { bg: '#d1fae5', color: '#065f46', label: '✅ Accepté seeker' },
      CONFIRMED: { bg: '#d1fae5', color: '#065f46', label: '✅ Confirmé' },
      REJECTED: { bg: '#fee2e2', color: '#991b1b', label: '❌ Rejeté' },
    };
    const s = styles[status] || { bg: '#f3f4f6', color: '#374151', label: status };
    return (
      <span style={{ 
        background: s.bg, color: s.color,
        padding: '3px 10px', borderRadius: '99px', fontSize: '12px'
      }}>
        {s.label}
      </span>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', 
                  alignItems: 'center', height: '300px' }}>
      <div>Chargement...</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', color: '#dc2626' }}>{error}</div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
          🤝 Mes Correspondances
        </h1>
        <p style={{ color: '#6b7280', marginTop: '4px' }}>
          {matches.length} correspondance(s) trouvée(s)
        </p>
      </div>

      {matches.length === 0 ? (
        <div style={{ 
          textAlign: 'center', padding: '4rem',
          background: 'white', borderRadius: '12px',
          border: '1px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ color: '#374151' }}>Aucune correspondance</h3>
          <p style={{ color: '#6b7280' }}>
            Créez une demande et lancez le matchmaking pour trouver des correspondances
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1rem'
        }}>
          {matches.map(match => (
            <div key={match.id} style={{
              background: 'white', borderRadius: '12px',
              padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              {/* Score */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Match #{match.id}
                </span>
                <span style={{
                  background: getScoreColor(match.compatibilityScore) + '20',
                  color: getScoreColor(match.compatibilityScore),
                  padding: '4px 12px', borderRadius: '99px',
                  fontWeight: '700', fontSize: '14px'
                }}>
                  {Math.round(match.compatibilityScore || 0)}/100
                </span>
              </div>

              {/* Details */}
              <div style={{ marginBottom: '1rem', fontSize: '14px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <b>Type:</b> {match.containerType || 'N/A'}
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <b>📍 Offre:</b> {match.offerLocation || 'N/A'}
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <b>📍 Demande:</b> {match.requestLocation || 'N/A'}
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <b>📏 Distance:</b> {Math.round(match.distanceKm || 0)} km
                </div>
              </div>

              {/* Status */}
              <div style={{ marginBottom: '1rem' }}>
                {getStatusBadge(match.status)}
              </div>

              {/* Actions */}
              {match.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleConfirm(match.id)}
                    style={{
                      flex: 1, padding: '8px',
                      background: '#16a34a', color: 'white',
                      border: 'none', borderRadius: '8px',
                      cursor: 'pointer', fontWeight: '500'
                    }}
                  >
                    ✅ Confirmer
                  </button>
                  <button
                    onClick={() => handleReject(match.id)}
                    style={{
                      flex: 1, padding: '8px',
                      background: '#dc2626', color: 'white',
                      border: 'none', borderRadius: '8px',
                      cursor: 'pointer', fontWeight: '500'
                    }}
                  >
                    ❌ Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

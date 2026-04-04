import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SendDirectRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t: translate } = useLanguage();

  const [formData, setFormData] = useState({
    message: '',
    seekerCompany: '',
    requiredDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.message.trim()) {
      setError('Le message est obligatoire');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/v1/containers/direct-requests/offers/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            message: formData.message,
            seekerCompany: formData.seekerCompany,
            requiredDate: formData.requiredDate || null
          })
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSent(true);
      } else {
        setError(data.message || 'Erreur envoi');
      }
    } catch(e) {
      setError('Erreur: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div style={{
      maxWidth: '500px',
      margin: '4rem auto',
      padding: '2rem',
      textAlign: 'center',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '64px' }}>✅</div>
      <h2 style={{ color: '#16a34a' }}>
        Demande envoyée !
      </h2>
      <p style={{ color: '#6b7280' }}>
        Le provider a été notifié par email.
        Vous recevrez une réponse bientôt.
      </p>
      <button
        onClick={() => navigate(
          '/containers/marketplace')}
        style={{
          marginTop: '1rem',
          padding: '12px 24px',
          background: '#1d4ed8',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        {translate('requestForm.back')} au Marketplace
      </button>
    </div>
  );

  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '0 1rem'
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#1d4ed8',
          fontSize: '14px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        ← {translate('requestForm.back')}
      </button>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          margin: '0 0 0.5rem'
        }}>
          📩 {translate('requestForm.title')}
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '0 0 1.5rem'
        }}>
          {translate('requestForm.subtitle')}
        </p>

        {error && (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '13px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Message */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            {translate('requestForm.message')} * 
          </label>
          <textarea
            value={formData.message}
            onChange={e => setFormData(p => ({
              ...p, message: e.target.value
            }))}
            placeholder={translate('requestForm.messagePlaceholder')}
            rows={4}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '13px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Company */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            {translate('requestForm.company')}
          </label>
          <input
            type="text"
            value={formData.seekerCompany}
            onChange={e => setFormData(p => ({
              ...p, seekerCompany: e.target.value
            }))}
            placeholder={translate('requestForm.companyPlaceholder')}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '13px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            {translate('requestForm.date')}
          </label>
          <input
            type="date"
            value={formData.requiredDate}
            onChange={e => setFormData(p => ({
              ...p, requiredDate: e.target.value
            }))}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '13px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading 
              ? '#e5e7eb' : '#1d4ed8',
            color: loading ? '#6b7280' : 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: loading 
              ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '15px'
          }}
        >
          {loading 
            ? '⏳ Envoi en cours...' 
            : `📩 ${translate('requestForm.submit')}`}
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SupportPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedTicket, setSelectedTicket] =
    useState(null);
  const [responseText, setResponseText] = 
    useState('');
  const [responseStatus, setResponseStatus] =
    useState('IN_PROGRESS');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'RECLAMATION',
    priority: 'MEDIUM',
    relatedOfferId: ''
  });

  useEffect(() => { loadData(); }, []);

  const token = () => localStorage.getItem('token');

  const loadData = async () => {
    try {
      setLoading(true);
      const url = isAdmin
        ? '/api/v1/support/admin/all'
        : '/api/v1/support/my';
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token()}` 
        }
      });
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);

      if (isAdmin) {
        const statsRes = await fetch(
          '/api/v1/support/admin/stats',
          { headers: {
            'Authorization': `Bearer ${token()}` 
          }}
        );
        const statsData = await statsRes.json();
        setStats(statsData || {});
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.subject || !formData.description) {
      alert('Sujet et description obligatoires');
      return;
    }
    try {
      const res = await fetch('/api/v1/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}` 
        },
        body: JSON.stringify({
          ...formData,
          relatedOfferId: formData.relatedOfferId
            ? Number(formData.relatedOfferId)
            : null
        })
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({
          subject: '',
          description: '',
          category: 'RECLAMATION',
          priority: 'MEDIUM',
          relatedOfferId: ''
        });
        loadData();
        alert('✅ Ticket créé ! Vous recevrez '
          + 'une confirmation par email.');
      } else {
        const err = await res.json();
        alert('Erreur: ' + (err.message || res.status));
      }
    } catch(e) {
      alert('Erreur: ' + e.message);
    }
  };

  const handleRespond = async (ticketId) => {
    if (!responseText.trim()) {
      alert('La réponse est obligatoire');
      return;
    }
    try {
      const res = await fetch(
        `/api/v1/support/admin/${ticketId}/respond` 
        + `?response=${encodeURIComponent(responseText)}` 
        + `&status=${responseStatus}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token()}` 
          }
        }
      );
      if (res.ok) {
        setSelectedTicket(null);
        setResponseText('');
        loadData();
        alert('✅ Réponse envoyée au client par email');
      }
    } catch(e) {
      alert('Erreur: ' + e.message);
    }
  };

  const statusColors = {
    OPEN: { bg: '#fee2e2', text: '#991b1b',
      label: '🔴 Ouvert' },
    IN_PROGRESS: { bg: '#fef3c7', text: '#92400e',
      label: '🟡 En cours' },
    RESOLVED: { bg: '#d1fae5', text: '#065f46',
      label: '🟢 Résolu' },
    CLOSED: { bg: '#f3f4f6', text: '#6b7280',
      label: '⚫ Fermé' },
  };

  const priorityColors = {
    LOW: '#16a34a',
    MEDIUM: '#1d4ed8',
    HIGH: '#d97706',
    URGENT: '#dc2626'
  };

  const categoryLabels = {
    RECLAMATION: '⚠️ Réclamation',
    PROBLEME_TECHNIQUE: '🔧 Problème technique',
    QUESTION_GENERALE: '❓ Question générale',
    FRAUDE: '🚨 Fraude',
    AUTRE: '📝 Autre'
  };

  return (
    <div style={{
      padding: '1.5rem',
      maxWidth: '1100px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px', fontWeight: '700',
            margin: 0
          }}>
            {isAdmin
              ? '🎫 Gestion Support'
              : '🎫 Support & Réclamations'}
          </h1>
          <p style={{
            color: '#6b7280', margin: '4px 0 0',
            fontSize: '14px'
          }}>
            {isAdmin
              ? `${tickets.length} ticket(s) total` 
              : 'Signalez un problème ou réclamation'}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              background: '#1d4ed8', color: 'white',
              border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontWeight: '600',
              fontSize: '14px'
            }}
          >
            {showForm ? '✕ Annuler' : '➕ Nouveau ticket'}
          </button>
        )}
      </div>

      {/* Admin stats */}
      {isAdmin && Object.keys(stats).length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: '1rem', marginBottom: '1.5rem'
        }}>
          {[
            { label: 'Total', key: 'total',
              color: '#1d4ed8', bg: '#dbeafe',
              icon: '🎫' },
            { label: 'Ouverts', key: 'open',
              color: '#dc2626', bg: '#fee2e2',
              icon: '🔴' },
            { label: 'En cours', key: 'inProgress',
              color: '#d97706', bg: '#fef3c7',
              icon: '🟡' },
            { label: 'Résolus', key: 'resolved',
              color: '#16a34a', bg: '#d1fae5',
              icon: '🟢' },
          ].map(s => (
            <div key={s.key} style={{
              background: 'white',
              borderRadius: '12px', padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '44px', height: '44px',
                background: s.bg,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: '700', color: s.color
                }}>
                  {stats[s.key] || 0}
                </div>
                <div style={{
                  fontSize: '12px', color: '#6b7280'
                }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      {showForm && !isAdmin && (
        <div style={{
          background: 'white', borderRadius: '16px',
          padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 1rem' }}>
            📝 Nouveau Ticket
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem', marginBottom: '1rem'
          }}>
            <div>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: '500', marginBottom: '4px'
              }}>
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData(p => ({
                  ...p, category: e.target.value
                }))}
                style={{
                  width: '100%', padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13px'
                }}
              >
                <option value="RECLAMATION">
                  ⚠️ Réclamation
                </option>
                <option value="PROBLEME_TECHNIQUE">
                  🔧 Problème technique
                </option>
                <option value="QUESTION_GENERALE">
                  ❓ Question générale
                </option>
                <option value="FRAUDE">
                  🚨 Fraude
                </option>
                <option value="AUTRE">
                  📝 Autre
                </option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: '500', marginBottom: '4px'
              }}>
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData(p => ({
                  ...p, priority: e.target.value
                }))}
                style={{
                  width: '100%', padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px', fontSize: '13px'
                }}
              >
                <option value="LOW">🟢 Faible</option>
                <option value="MEDIUM">🔵 Moyenne</option>
                <option value="HIGH">🟡 Haute</option>
                <option value="URGENT">🔴 Urgente</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '500', marginBottom: '4px'
            }}>
              Sujet *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={e => setFormData(p => ({
                ...p, subject: e.target.value
              }))}
              placeholder="Décrivez brièvement le problème"
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '500', marginBottom: '4px'
            }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(p => ({
                ...p, description: e.target.value
              }))}
              placeholder="Décrivez en détail votre problème..."
              rows={4}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '13px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '500', marginBottom: '4px'
            }}>
              ID Offre concernée (optionnel)
            </label>
            <input
              type="number"
              value={formData.relatedOfferId}
              onChange={e => setFormData(p => ({
                ...p, relatedOfferId: e.target.value
              }))}
              placeholder="Ex: 12"
              style={{
                width: '200px', padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px', fontSize: '13px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCreate}
              style={{
                padding: '10px 24px',
                background: '#1d4ed8', color: 'white',
                border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: '600',
                fontSize: '14px'
              }}
            >
              📤 Soumettre
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '10px 24px',
                background: 'white', color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Tickets list */}
      {loading ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          color: '#6b7280'
        }}>
          Chargement...
        </div>
      ) : tickets.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          background: 'white', borderRadius: '12px',
          border: '1px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px' }}>🎫</div>
          <h3>Aucun ticket</h3>
          <p style={{ color: '#6b7280' }}>
            {isAdmin
              ? 'Aucun ticket soumis pour le moment'
              : 'Cliquez sur "Nouveau ticket" pour commencer'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: '1rem'
        }}>
          {tickets.map(ticket => (
            <div key={ticket.id} style={{
              background: 'white',
              borderRadius: '12px', padding: '1.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              {/* Ticket header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
                flexWrap: 'wrap', gap: '8px'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px', marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      #{ticket.id}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: priorityColors[
                        ticket.priority] || '#6b7280',
                      fontWeight: '600'
                    }}>
                      ● {ticket.priority}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {categoryLabels[ticket.category]
                        || ticket.category}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600', margin: 0
                  }}>
                    {ticket.subject}
                  </h3>
                </div>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '99px',
                  background: statusColors[
                    ticket.status]?.bg || '#f3f4f6',
                  color: statusColors[
                    ticket.status]?.text || '#6b7280',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}>
                  {statusColors[ticket.status]?.label
                    || ticket.status}
                </span>
              </div>

              {/* User info — admin only */}
              {isAdmin && (
                <div style={{
                  background: '#f8faff',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '12px',
                  fontSize: '13px',
                  display: 'flex',
                  flexWrap: 'wrap', gap: '12px'
                }}>
                  <span>👤 <b>{ticket.userName}</b></span>
                  <span>📧 {ticket.userEmail}</span>
                  <span>🏷️ {ticket.userRole}</span>
                  {ticket.userPhone && (
                    <span>📱 {ticket.userPhone}</span>
                  )}
                  {ticket.userCompany && (
                    <span>🏢 {ticket.userCompany}</span>
                  )}
                  {ticket.userCountry && (
                    <span>🌍 {ticket.userCountry}</span>
                  )}
                  {ticket.relatedOfferId && (
                    <span>
                      📦 Offre #{ticket.relatedOfferId}
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <p style={{
                fontSize: '13px', color: '#374151',
                margin: '0 0 10px', lineHeight: '1.5'
              }}>
                {ticket.description}
              </p>

              {/* Admin response */}
              {ticket.adminResponse && (
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '8px', padding: '12px',
                  marginBottom: '10px',
                  borderLeft: '3px solid #16a34a',
                  fontSize: '13px'
                }}>
                  <b>📬 Réponse équipe support:</b>
                  <p style={{
                    margin: '4px 0 0', color: '#374151'
                  }}>
                    {ticket.adminResponse}
                  </p>
                </div>
              )}

              {/* Date */}
              <div style={{
                fontSize: '11px', color: '#9ca3af',
                marginBottom: isAdmin
                  && ticket.status !== 'CLOSED'
                  ? '10px' : 0
              }}>
                Créé le {new Date(ticket.createdAt)
                  .toLocaleDateString('fr-FR')}
              </div>

              {/* Admin respond */}
              {isAdmin && ticket.status !== 'CLOSED' && (
                <div>
                  {selectedTicket === ticket.id ? (
                    <div style={{
                      marginTop: '10px', padding: '12px',
                      background: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <textarea
                        value={responseText}
                        onChange={e =>
                          setResponseText(e.target.value)}
                        placeholder="Votre réponse..."
                        rows={3}
                        style={{
                          width: '100%', padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          marginBottom: '8px'
                        }}
                      />
                      <div style={{
                        display: 'flex',
                        gap: '8px', alignItems: 'center'
                      }}>
                        <select
                          value={responseStatus}
                          onChange={e =>
                            setResponseStatus(
                              e.target.value)}
                          style={{
                            padding: '6px 10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px'
                          }}
                        >
                          <option value="IN_PROGRESS">
                            En cours
                          </option>
                          <option value="RESOLVED">
                            Résolu
                          </option>
                          <option value="CLOSED">
                            Fermé
                          </option>
                        </select>
                        <button
                          onClick={() =>
                            handleRespond(ticket.id)}
                          style={{
                            padding: '6px 16px',
                            background: '#16a34a',
                            color: 'white', border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          📤 Envoyer
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTicket(null);
                            setResponseText('');
                          }}
                          style={{
                            padding: '6px 12px',
                            background: 'white',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket.id);
                        setResponseText('');
                      }}
                      style={{
                        marginTop: '8px',
                        padding: '6px 14px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      💬 Répondre
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

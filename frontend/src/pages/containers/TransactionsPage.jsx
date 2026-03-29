import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import containerService from '../../services/containerService';

export default function TransactionsPage() {
  const { user } = useAuth();
  const isProvider = user?.role === 'IMPORTATEUR';
  const isSeeker = user?.role === 'EXPORTATEUR';
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingEir, setUploadingEir] = useState(null);

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await containerService.getMyTransactions();
      const data = res.data?.data || res.data || [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('TRANSACTIONS ERROR:', err.response?.data || err.message);
      setError('Erreur chargement transactions');
    } finally {
      setLoading(false);
    }
  };

  const workflowSteps = [
    { key: 'AT_PROVIDER', label: '🏭 Chez importateur' },
    { key: 'IN_TRANSIT', label: '🚛 En transport' },
    { key: 'DELIVERED_TO_EXPORTER', label: '📦 Livré' },
    { key: 'LOADING', label: '⚓ Chargement' },
    { key: 'COMPLETED', label: '✅ Terminé' },
  ];

  const getNextStatuses = (current) => {
    const idx = workflowSteps.findIndex(s => s.key === current);
    return workflowSteps.slice(idx + 1);
  };

  const handleUpdateWorkflow = async (txId, status) => {
    try {
      await containerService.updateWorkflow(txId, status);
      await loadTransactions();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEirUpload = async (txId, file) => {
    if (!file || !txId) {
      alert('Erreur: ID transaction manquant');
      return;
    }
    try {
      setUploadingEir(txId);
      await containerService.uploadEir(txId, file);
      alert('✅ EIR uploadé avec succès !');
      loadTransactions();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingEir(null);
    }
  };

  const handleDownloadEir = async (txId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/v1/containers/transactions/${txId}/eir/download`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        alert('EIR non disponible');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EIR_Transaction_${txId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Erreur téléchargement: ' + err.message);
    }
  };

  const getWorkflowTimeline = (status) => {
    const currentIndex = workflowSteps.findIndex(s => s.key === status);
    
    return (
      <div style={{ marginTop: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          position: 'relative'
        }}>
          {workflowSteps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;
            
            return (
              <div key={step.key} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1,
                position: 'relative'
              }}>
                {/* Circle */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isCompleted ? '#0D9488' : isCurrent ? '#0B1F3A' : '#E2E8F0',
                  border: isCurrent ? '3px solid #0B1F3A' : isCompleted ? '2px solid #0D9488' : '2px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: isCompleted || isCurrent ? 'white' : '#9CA3AF',
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  zIndex: 1,
                  transition: 'all 0.3s'
                }}>
                  {isCompleted ? '●' : isCurrent ? '●' : '○'}
                </div>
                
                {/* Line */}
                {index < workflowSteps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    width: '100%',
                    height: '2px',
                    background: isCompleted ? '#0D9488' : '#E2E8F0',
                    zIndex: 0
                  }} />
                )}
                
                {/* Label */}
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '11px',
                  color: isCurrent ? '#0B1F3A' : isCompleted ? '#374151' : '#9CA3AF',
                  fontWeight: isCurrent ? '600' : 'normal',
                  textAlign: 'center',
                  maxWidth: '90px',
                  lineHeight: '1.2'
                }}>
                  {step.label.split(' ')[0]}
                  <div style={{ fontSize: '9px', color: '#64748B', marginTop: '2px' }}>
                    {step.label.split(' ').slice(1).join(' ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Current status indicator */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748B',
          marginTop: '1rem',
          padding: '8px',
          background: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E2E8F0'
        }}>
          Étape actuelle : <strong>{workflowSteps[currentIndex]?.label || status}</strong>
        </div>
        
        {/* Action button for IMPORTATEUR */}
        {isProvider && currentIndex < workflowSteps.length - 1 && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleUpdateWorkflow(status, e.target.value);
                  e.target.value = '';
                }
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                background: 'white',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              <option value="">Avancer le statut →</option>
              {getNextStatuses(status).map(next => (
                <option key={next.key} value={next.key}>
                  {next.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
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
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0B1F3A 0%, #0E3A5D 50%, #1CA7C7 100%)',
        padding: '48px 32px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div>
            <h1 style={{
              fontSize: '32px', fontWeight: '800', color: 'white',
              margin: 0, letterSpacing: '-0.5px'
            }}>Mes Transactions</h1>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', margin: '4px 0 0' }}>
              {isProvider 
                ? "Suivez et gérez vos échanges de conteneurs"
                : "Consultez l'état de vos transactions en cours"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px' }}>

      {transactions.length === 0 ? (
        <div style={{
          background: 'white', padding: '3rem', borderRadius: '12px',
          border: '2px dashed #d1d5db', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
            Aucune transaction
          </h3>
          <p style={{ color: '#9ca3af' }}>
            Les transactions apparaissent après confirmation mutuelle d'un match
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {transactions.map(tx => (
            <div key={tx.id} style={{
              background: 'white', borderRadius: '12px',
              padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '13px', color: '#6b7280', 
                    marginBottom: '4px' 
                  }}>
                    Transaction #{tx.id}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>
                    {tx.containerType || 'Conteneur'}
                  </div>
                  <div style={{ 
                    fontSize: '13px', color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    {tx.offerLocation || 'N/A'} → {tx.requestLocation || 'N/A'}
                  </div>
                </div>

                {/* Lien vers l'offre */}
                {tx.offerId && (
                  <a
                    href={`/containers/marketplace/${tx.offerId}`}
                    style={{
                      fontSize: '12px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      background: '#eff6ff'
                    }}
                  >
                    🚢 Voir l'offre
                  </a>
                )}
              </div>

              {/* Workflow Timeline */}
              {getWorkflowTimeline(tx.workflowStatus)}

              {/* Actions Section */}
              <div style={{ 
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <h4 style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Actions & Documents
                </h4>

                {/* Provider Actions */}
                {isProvider && (
                  <div style={{ marginBottom: '1rem' }}>
                    {/* Workflow update buttons */}
                    {tx.workflowStatus !== 'COMPLETED' && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '0.5rem' }}>
                          Avancer le statut :
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {getNextStatuses(tx.workflowStatus).map(s => (
                            <button
                              key={s.key}
                              onClick={() => handleUpdateWorkflow(tx.id, s.key)}
                              style={{
                                padding: '6px 12px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EIR Upload */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {tx.eirDocumentPath ? (
                        <>
                          <span style={{ fontSize: '12px', color: '#16a34a' }}>
                            ✅ Document déposé
                          </span>
                          <button
                            onClick={() => handleDownloadEir(tx.id)}
                            style={{
                              padding: '5px 12px',
                              background: '#d1fae5',
                              color: '#065f46',
                              border: '1px solid #6ee7b7',
                              borderRadius: '6px',
                              cursor: 'pointer', fontSize: '12px'
                            }}
                          >
                            📥 Voir
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          Aucun document EIR
                        </span>
                      )}
                      <label style={{
                        padding: '5px 12px',
                        background: uploadingEir === tx.id ? '#e5e7eb' : '#eff6ff',
                        color: uploadingEir === tx.id ? '#6b7280' : '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '500'
                      }}>
                        {uploadingEir === tx.id ? '⏳ Upload...' : '📤 Déposer EIR'}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          style={{ display: 'none' }}
                          disabled={uploadingEir === tx.id}
                          onChange={e => {
                            if (e.target.files[0]) {
                              handleEirUpload(tx.id, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Seeker Actions */}
                {isSeeker && (
                  <div>
                    {tx.eirDocumentPath ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#16a34a' }}>
                          ✅ Document disponible
                        </span>
                        <button
                          onClick={() => handleDownloadEir(tx.id)}
                          style={{
                            padding: '5px 12px',
                            background: '#d1fae5',
                            color: '#065f46',
                            border: '1px solid #6ee7b7',
                            borderRadius: '6px',
                            cursor: 'pointer', fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          📥 Télécharger EIR
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#f59e0b' }}>
                        ⏳ En attente du document EIR du provider
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

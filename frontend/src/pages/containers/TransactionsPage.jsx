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
          marginBottom: '0.5rem'
        }}>
          {workflowSteps.map((step, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={step.key} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1,
                position: 'relative'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isActive ? '#3b82f6' : '#e5e7eb',
                  border: isCurrent ? '3px solid #1d4ed8' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: isActive ? 'white' : '#9ca3af',
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  zIndex: 1
                }}>
                  {isActive ? '✓' : index + 1}
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    width: '100%',
                    height: '2px',
                    background: index < currentIndex ? '#3b82f6' : '#e5e7eb',
                    zIndex: 0
                  }} />
                )}
                
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '11px',
                  color: isCurrent ? '#1d4ed8' : isActive ? '#374151' : '#9ca3af',
                  fontWeight: isCurrent ? '600' : 'normal',
                  textAlign: 'center',
                  maxWidth: '80px'
                }}>
                  {step.label.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
        
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          Étape actuelle : {workflowSteps[currentIndex]?.label || status}
        </div>
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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          📋 Mes Transactions
        </h1>
        <p style={{ color: '#6b7280' }}>
          {transactions.length} transaction(s) • {isProvider ? 'Provider' : 'Seeker'}
        </p>
      </div>

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
  );
}

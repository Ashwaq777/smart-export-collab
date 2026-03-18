import { useState, useEffect } from 'react';
import containerService from '../../services/containerService';

export default function TransactionsPage() {
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
      setError('Erreur lors du chargement des transactions');
      console.error(err);
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
  const formData = new FormData();
  formData.append('file', file);
  try {
    setUploadingEir(txId);
    const token = localStorage.getItem('token');
    const response = await fetch(
      `/api/v1/containers/transactions/${txId}/eir`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      }
    );
    const data = await response.json();
    if (response.ok) {
      alert('✅ EIR uploadé avec succès !');
      loadTransactions();
    } else {
      alert('Erreur: ' + (data.message || response.status));
    }
  } catch (err) {
    alert('Erreur réseau: ' + err.message);
  } finally {
    setUploadingEir(null);
  }
};

  const getWorkflowBadge = (status) => {
    const styles = {
      AT_PROVIDER: { bg: '#dbeafe', color: '#1e40af', label: '🏭 Chez importateur' },
      IN_TRANSIT: { bg: '#fef3c7', color: '#92400e', label: '🚛 En transport' },
      DELIVERED_TO_EXPORTER: { bg: '#fed7aa', color: '#9a3412', label: '📦 Livré' },
      LOADING: { bg: '#e9d5ff', color: '#6b21a8', label: '⚓ Chargement' },
      COMPLETED: { bg: '#d1fae5', color: '#065f46', label: '✅ Terminé' },
    };
    const s = styles[status] || { bg: '#f3f4f6', color: '#374151', label: status };
    return (
      <span style={{
        background: s.bg, color: s.color,
        padding: '4px 12px', borderRadius: '99px', fontSize: '13px',
        fontWeight: '500'
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
          📋 Mes Transactions
        </h1>
        <p style={{ color: '#6b7280', marginTop: '4px' }}>
          {transactions.length} transaction(s)
        </p>
      </div>

      {transactions.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem',
          background: 'white', borderRadius: '12px',
          border: '1px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#374151' }}>Aucune transaction</h3>
          <p style={{ color: '#6b7280' }}>
            Les transactions apparaissent après confirmation mutuelle d'un match
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {transactions.map(tx => (
            <div key={tx.id} style={{
              background: 'white', borderRadius: '12px',
              padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap', gap: '1rem'
              }}>
                {/* Left info */}
                <div>
                  <div style={{ 
                    fontSize: '13px', color: '#6b7280', 
                    marginBottom: '4px' 
                  }}>
                    Transaction #{tx.id}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>
                    {tx.containerType || 'N/A'}
                  </div>
                  <div style={{ 
                    fontSize: '13px', color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    {tx.offerLocation || 'N/A'} → {tx.requestLocation || 'N/A'}
                  </div>
                </div>

                {/* Status */}
                <div style={{ textAlign: 'right' }}>
                  {getWorkflowBadge(tx.workflowStatus)}
                </div>
              </div>

              {/* Workflow progress bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ 
                  display: 'flex', gap: '4px',
                  marginBottom: '8px'
                }}>
                  {workflowSteps.map((step, idx) => {
                    const currentIdx = workflowSteps
                      .findIndex(s => s.key === tx.workflowStatus);
                    const isDone = idx <= currentIdx;
                    return (
                      <div key={step.key} style={{
                        flex: 1, height: '6px', borderRadius: '99px',
                        background: isDone ? '#16a34a' : '#e5e7eb'
                      }} />
                    );
                  })}
                </div>
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '10px', color: '#9ca3af'
                }}>
                  {workflowSteps.map(s => (
                    <span key={s.key} style={{ textAlign: 'center', flex: 1 }}>
                      {s.label.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Update workflow button */}
              {tx.workflowStatus !== 'COMPLETED' && (
                <div style={{ marginTop: '1rem' }}>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleUpdateWorkflow(tx.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    style={{
                      padding: '8px 12px', borderRadius: '8px',
                      border: '1px solid #d1d5db', cursor: 'pointer',
                      fontSize: '13px', background: 'white'
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Mettre à jour le statut...
                    </option>
                    {getNextStatuses(tx.workflowStatus).map(s => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* EIR Document */}
              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ 
                    fontSize: '13px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    📎 Document EIR:
                  </span>

                  {tx.eirDocumentPath ? (
                    <span style={{
                      fontSize: '13px',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      ✅ Document uploadé
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#6b7280',
                        marginLeft: '4px'
                      }}>
                        {tx.eirDocumentPath.split('/').pop()}
                      </span>
                    </span>
                  ) : (
                    <span style={{ 
                      fontSize: '13px', 
                      color: '#f59e0b' 
                    }}>
                      ⚠️ Aucun document
                    </span>
                  )}

                  <label style={{
                    padding: '6px 12px',
                    background: uploadingEir === tx.id ? '#e5e7eb' : '#eff6ff',
                    color: uploadingEir === tx.id ? '#6b7280' : '#1d4ed8',
                    borderRadius: '8px',
                    cursor: uploadingEir === tx.id ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {uploadingEir === tx.id ? (
                      '⏳ Upload en cours...'
                    ) : (
                      <>📤 {tx.eirDocumentPath ? 'Remplacer EIR' : 'Upload EIR'}</>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      style={{ display: 'none' }}
                      disabled={uploadingEir === tx.id}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleEirUpload(tx.id, e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { FiDownload, FiFile, FiTrash2, FiUpload, FiPackage, FiMapPin } from 'react-icons/fi';
import containerService from '../../services/containerService';

export default function EirDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    loadDocuments();
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await containerService.getMyEirDocuments();
      setDocuments(res.data?.data || []);
    } catch (err) {
      console.error('Error loading EIR documents:', err);
      alert('Erreur lors du chargement des documents EIR');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (transactionId, filename) => {
    try {
      const response = await fetch(`/api/v1/eir/download/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Erreur lors du téléchargement du document');
    }
  };

  const handleUpload = async (transactionId, file) => {
    if (!file) return;
    
    setUploading(transactionId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/v1/eir/upload/${transactionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      alert('✅ Document EIR uploadé avec succès !');
      loadDocuments();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur lors de l\'upload du document');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Supprimer ce document EIR ?')) return;
    
    try {
      await containerService.deleteEirDocument(transactionId);
      alert('✅ Document EIR supprimé avec succès');
      loadDocuments();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Erreur lors de la suppression du document');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Chargement des documents EIR...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          📄 Mes Documents EIR
        </h1>
        <p style={{ color: '#6b7280' }}>
          Gérez vos documents EIR (Equipment Interchange Receipt) indépendamment des transactions.
        </p>
      </div>

      {documents.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          border: '2px dashed #d1d5db',
          textAlign: 'center'
        }}>
          <FiFile size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
            Aucun document EIR trouvé
          </h3>
          <p style={{ color: '#9ca3af' }}>
            Les documents EIR apparaissent ici une fois que les transactions sont confirmées et les documents uploadés.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {documents.map((doc) => (
            <div key={doc.transactionId} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <FiPackage style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                      Transaction #{doc.transactionId}
                    </span>
                    {doc.isProvider && (
                      <span style={{
                        marginLeft: '0.5rem',
                        background: '#dbeafe',
                        color: '#1e40af',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}>
                        Provider
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: '#6b7280' }}>
                    <FiMapPin style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem' }}>
                      {doc.offerLocation} → {doc.requestLocation}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
                    <FiFile style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                      {doc.filename}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleDownload(doc.transactionId, doc.filename)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FiDownload size={16} />
                    Télécharger
                  </button>

                  {doc.isProvider && (
                    <>
                      <label style={{
                        padding: '0.5rem 1rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FiUpload size={16} />
                        {uploading === doc.transactionId ? 'Upload...' : 'Remplacer'}
                        <input
                          type="file"
                          accept=".pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleUpload(doc.transactionId, e.target.files[0])}
                          disabled={uploading === doc.transactionId}
                        />
                      </label>

                      <button
                        onClick={() => handleDelete(doc.transactionId)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FiTrash2 size={16} />
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f3f4f6',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#6b7280'
      }}>
        <strong>💡 Note :</strong> Les documents EIR sont générés lors de la confirmation des transactions.
        Seuls les providers peuvent uploader et remplacer les documents EIR. Les seekers peuvent les télécharger.
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const { notifications, connected, 
          clearNotification, clearAll } = 
    useNotifications(user?.email);
  const [open, setOpen] = useState(false);
  const unread = notifications.length;

  const handleBellClick = () => {
    // Request permission on user click (gesture)
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setOpen(!open);
  };

  const getIcon = (type) => {
    const icons = {
      MATCH_FOUND: '🎯',
      MATCH_CONFIRMED: '✅',
      WORKFLOW_UPDATE: '📦',
    };
    return icons[type] || '🔔';
  };

  const getColor = (type) => {
    const colors = {
      MATCH_FOUND: '#1d4ed8',
      MATCH_CONFIRMED: '#16a34a',
      WORKFLOW_UPDATE: '#d97706',
    };
    return colors[type] || '#6b7280';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-notification-bell]')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener(
      'mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} data-notification-bell>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '6px',
          borderRadius: '8px',
          color: connected ? 'inherit' : '#9ca3af'
        }}
        title={connected ? 'Connecté' : 'Déconnecté'}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: '0px', right: '0px',
            background: '#dc2626',
            color: 'white',
            borderRadius: '99px',
            fontSize: '10px',
            fontWeight: '700',
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px'
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          right: 0, top: '40px',
          width: '320px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          zIndex: 9999,
          maxHeight: '400px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ 
              fontWeight: '600', fontSize: '14px' 
            }}>
              Notifications
              {connected && (
                <span style={{
                  marginLeft: '8px',
                  fontSize: '10px',
                  color: '#16a34a',
                  background: '#d1fae5',
                  padding: '2px 6px',
                  borderRadius: '99px'
                }}>
                  ● Live
                </span>
              )}
            </span>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Tout effacer
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '13px'
              }}>
                Aucune notification
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    background: idx === 0 
                      ? '#f8faff' : 'white'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>
                    {getIcon(notif.type)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: getColor(notif.type),
                      marginBottom: '2px'
                    }}>
                      {notif.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      lineHeight: '1.4'
                    }}>
                      {notif.message}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      marginTop: '4px'
                    }}>
                      {new Date(notif.timestamp)
                        .toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(idx);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      fontSize: '14px',
                      padding: '2px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

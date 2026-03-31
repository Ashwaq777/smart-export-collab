import React, { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const getToken = () => localStorage.getItem('token');

  const fetchUnreadCount = async () => {
    try {
      const r = await fetch('http://localhost:8080/api/v1/notifications/my/unread-count', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!r.ok) return;
      const data = await r.json();
      setUnreadCount(data.data || 0);
    } catch (e) {}
  };

  const fetchNotifications = async () => {
    try {
      const r = await fetch('http://localhost:8080/api/v1/notifications/my', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!r.ok) return;
      const data = await r.json();
      setNotifications(data.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleBellClick = async () => {
    if (unreadCount > 0) {
      try {
        await fetch('http://localhost:8080/api/v1/notifications/my/mark-read', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        setUnreadCount(0);
      } catch (e) {}
    }
    if (!open) fetchNotifications();
    setOpen(!open);
  };

  const getIcon = (type) => {
    const icons = { MATCH_FOUND: '🎯', MATCH_CONFIRMED: '✅', WORKFLOW_UPDATE: '📦' };
    return icons[type] || '🔔';
  };

  const getColor = (type) => {
    const colors = { MATCH_FOUND: '#1d4ed8', MATCH_CONFIRMED: '#16a34a', WORKFLOW_UPDATE: '#d97706' };
    return colors[type] || '#6b7280';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-notification-bell]')) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} data-notification-bell>
      <button onClick={handleBellClick} style={{
        position: 'relative', background: 'none', border: 'none',
        cursor: 'pointer', fontSize: '20px', padding: '6px', borderRadius: '8px'
      }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '0px', right: '0px',
            background: '#dc2626', color: 'white', borderRadius: '99px',
            fontSize: '10px', fontWeight: '700', minWidth: '16px', height: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '40px', width: '320px',
          background: 'white', borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb',
          zIndex: 9999, maxHeight: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Notifications</span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                Aucune notification
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  background: !notif.read ? '#f8faff' : 'white'
                }}>
                  <span style={{ fontSize: '18px' }}>{getIcon(notif.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: getColor(notif.type), marginBottom: '2px' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                      {new Date(notif.timestamp).toLocaleTimeString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

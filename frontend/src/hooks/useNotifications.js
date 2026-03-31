import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useNotifications(userEmail, onNewNotification) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [usePolling, setUsePolling] = useState(false);
  const clientRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const pollingStarted = useRef(false);

  // Polling fallback function
  const startPolling = () => {
    if (pollingIntervalRef.current) return;
    if (pollingStarted.current) return;
    pollingStarted.current = true;
    
    console.log('Starting polling fallback for notifications');
    setUsePolling(true);
    
    const pollNotifications = () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      fetch('/api/v1/notifications/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        const newNotifications = data.data || [];
        setNotifications(newNotifications.slice(0, 20));
        if (newNotifications.length > 0 && onNewNotification) {
          onNewNotification();
        }
      })
      .catch(() => {
        // Silently ignore polling errors
      });
    };
    
    // Initial poll
    pollNotifications();
    
    // Set up interval
    pollingIntervalRef.current = setInterval(pollNotifications, 30000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingStarted.current = false;
    setUsePolling(false);
  };

  useEffect(() => {
    if (!userEmail) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    let reconnectDelay = 1000; // Start with 1 second
    const maxReconnectAttempts = 3;
    let retryCount = 0;

    const client = new Client({
      webSocketFactory: () => 
        new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}` 
      },
      onConnect: () => {
        setConnected(true);
        setReconnectAttempts(0);
        stopPolling(); // Stop polling when WebSocket connects
        console.log('WebSocket connected');

        // Subscribe to user-specific notifications
        client.subscribe(
          `/user/${userEmail}/queue/notifications`,
          (message) => {
            const payload = JSON.parse(message.body);
            setNotifications(prev => [payload, ...prev].slice(0, 20));
            // Call callback to update unread count
            if (onNewNotification) {
              onNewNotification();
            }
            // Browser notification if permitted
            if (Notification.permission === 'granted') {
              new Notification(payload.title, {
                body: payload.message,
                icon: '/favicon.ico'
              });
            }
          }
        );
      },
      onDisconnect: () => {
        setConnected(false);
        console.log('WebSocket disconnected');
        
        retryCount++;
        if (retryCount >= maxReconnectAttempts) {
          console.log('Max reconnection attempts reached, stopping WebSocket');
          client.deactivate();
          startPolling();
          return;
        }
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setReconnectAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts >= maxReconnectAttempts) {
            console.log('Max reconnection attempts reached, switching to polling');
            client.deactivate();
            startPolling();
          }
          return newAttempts;
        });
      },
      reconnectDelay: 0, // Disable automatic reconnection, we handle it manually
      connectionTimeout: 10000,
    });

    // Override reconnect logic to limit attempts
    const originalBeforeConnect = client.beforeConnect;
    client.beforeConnect = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('Max reconnection attempts reached, stopping WebSocket');
        client.deactivate();
        startPolling();
        return false;
      }
      
      // Exponential backoff
      reconnectDelay = Math.min(reconnectDelay * 2, 8000); // Max 8 seconds
      
      // Increment attempts counter
      setReconnectAttempts(prev => prev + 1);
      
      if (originalBeforeConnect) {
        return originalBeforeConnect();
      }
      return true;
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      stopPolling();
      pollingStarted.current = false;
    };
  }, [userEmail, onNewNotification, reconnectAttempts]);

  const clearNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => setNotifications([]);

  return { notifications, connected, usePolling,
           clearNotification, clearAll };
}

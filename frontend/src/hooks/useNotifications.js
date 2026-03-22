import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useNotifications(userEmail) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!userEmail) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => 
        new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}` 
      },
      onConnect: () => {
        setConnected(true);
        console.log('WebSocket connected');

        // Subscribe to user-specific notifications
        client.subscribe(
          `/user/${userEmail}/queue/notifications`,
          (message) => {
            const payload = JSON.parse(message.body);
            setNotifications(prev => [payload, ...prev].slice(0, 20));
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
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [userEmail]);

  const clearNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => setNotifications([]);

  return { notifications, connected, 
           clearNotification, clearAll };
}

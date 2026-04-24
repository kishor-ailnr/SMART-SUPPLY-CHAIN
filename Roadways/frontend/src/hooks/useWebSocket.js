import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

export function useWebSocket() {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const { setVehicles, addAlert } = useStore();

  const connect = () => {
    console.log('Attempting WebSocket connection...');
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:6001';
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'INITIAL_STATE':
            setVehicles(message.data.vehicles);
            break;
          case 'VEHICLE_UPDATES':
            setVehicles(message.data);
            break;
          case 'NEW_EVENT':
            addAlert(message.data);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('WS Message parsing error:', err);
      }
    };

    socket.onopen = () => {
      console.log('WebSocket Connected to ROADWAYS 2.0');
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };

    socket.onclose = () => {
      console.log('WebSocket Disconnected. Retrying in 3s...');
      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    socket.onerror = (err) => {
      console.error('WebSocket Error:', err);
      socket.close();
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current && ws.current.readyState === 1) ws.current.close();
    };
  }, []);

  return ws.current;
}

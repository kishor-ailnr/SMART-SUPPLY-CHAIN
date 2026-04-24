import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export const useWebSocket = () => {
  const ws = useRef(null);
  const isMounted = useRef(false);
  const reconnectTimer = useRef(null);
  const { updateVessel, setVessels, setRiskZones, setTwinSimulation } = useStore();

  useEffect(() => {
    isMounted.current = true;

    const connect = () => {
      // Don't open a new connection if one is already open/connecting
      if (
        ws.current &&
        (ws.current.readyState === WebSocket.OPEN ||
          ws.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:6004/ws`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Connected to SEAWAYS Backend');
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          switch (message.type) {
            case 'VESSEL_UPDATE':
              setVessels(message.data);
              break;
            case 'TWIN_UPDATE':
              setTwinSimulation(message.data.vesselId, message.data);
              break;
            case 'ALERT':
              console.log('NEW ALERT:', message.data);
              break;
            default:
              break;
          }
        } catch (e) {
          console.error('Failed to parse WS message:', e);
        }
      };

      ws.current.onerror = (err) => {
        console.warn('WebSocket error — will retry in 3s', err);
      };

      ws.current.onclose = () => {
        // Only schedule reconnect if the component is still mounted
        if (isMounted.current) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted.current = false;
      clearTimeout(reconnectTimer.current);
      if (ws.current) {
        // Remove onclose so the cleanup doesn't trigger a reconnect loop
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ws;
};

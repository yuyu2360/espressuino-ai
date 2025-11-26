import { useState, useEffect, useCallback, useRef } from 'react';
import type { SensorData, Command } from '../types';
import { getMockWebSocketServer } from '../lib/mockWebSocket';

const USE_MOCK = import.meta.env.MODE !== 'production';

interface WebSocketState {
  isConnected: boolean;
  sensorData: SensorData | null;
  error: string | null;
}

export function useWebSocket(wsUrl?: string) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    sensorData: null,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const mockServerRef = useRef(getMockWebSocketServer());
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;

  const sendCommand = useCallback((command: Command) => {
    const payload = JSON.stringify(command);

    if (USE_MOCK) {
      mockServerRef.current.processCommand(command);
      console.log('[Mock] Sent command:', command);
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(payload);
      console.log('[WebSocket] Sent command:', command);
    } else {
      console.warn('[WebSocket] Not connected, command not sent:', command);
    }
  }, []);

  const connect = useCallback(() => {
    if (USE_MOCK) {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        error: null,
      }));

      mockIntervalRef.current = setInterval(() => {
        const data = mockServerRef.current.getSensorData();
        setState((prev) => ({
          ...prev,
          sensorData: data,
        }));
      }, 200);

      console.log('[Mock] WebSocket connection established');
      reconnectAttempts.current = 0;
      return;
    }

    const url = wsUrl || 'ws://192.168.4.1:8080';

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
        }));
        reconnectAttempts.current = 0;
        console.log('[WebSocket] Connected to', url);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SensorData;
          setState((prev) => ({
            ...prev,
            sensorData: data,
          }));
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        setState((prev) => ({
          ...prev,
          error: 'WebSocket error occurred',
        }));
      };

      ws.onclose = () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
        }));
        console.log('[WebSocket] Disconnected');
        scheduleReconnect();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to connect to WebSocket',
        isConnected: false,
      }));
      scheduleReconnect();
    }
  }, [wsUrl]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setState((prev) => ({
        ...prev,
        error: 'Max reconnection attempts reached',
      }));
      return;
    }

    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
    reconnectAttempts.current += 1;

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`[WebSocket] Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setState({
      isConnected: false,
      sensorData: null,
      error: null,
    });
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    sendCommand,
    disconnect,
  };
}

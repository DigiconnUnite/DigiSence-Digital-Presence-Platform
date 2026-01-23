import { useState, useEffect, useCallback, useRef } from 'react';

interface RealtimeDataOptions {
  pollingInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableSSE?: boolean;
  enableWebSocket?: boolean;
}

interface RealtimeDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isStale: boolean;
}

export function useRealtimeData<T>(
  endpoint: string,
  options: RealtimeDataOptions = {}
) {
  const {
    pollingInterval = 5000, // 5 seconds
    retryAttempts = 3,
    retryDelay = 1000,
    enableSSE = true,
    enableWebSocket = false,
  } = options;

  const [state, setState] = useState<RealtimeDataState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isStale: false,
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const lastFetchRef = useRef<number>(0);



  // Fetch data with retry logic
  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();

    // Check if we're already fetching
    if (now - lastFetchRef.current < 1000) {
      return;
    }

    lastFetchRef.current = now;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(endpoint, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'If-Modified-Since': new Date(0).toUTCString(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastUpdated: new Date(now),
        isStale: false,
      }));

      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      console.error('Realtime data fetch error:', error);

      retryCountRef.current++;

      if (retryCountRef.current < retryAttempts) {
        // Retry after delay
        setTimeout(() => fetchData(force), retryDelay * retryCountRef.current);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch data',
          isStale: true,
        }));
      }
    }
  }, [endpoint, retryAttempts, retryDelay]);

  // Setup polling
  const setupPolling = useCallback(() => {
    if (pollingInterval <= 0) return;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(() => {
      fetchData();
    }, pollingInterval);
  }, [pollingInterval, fetchData]);

  // Setup Server-Sent Events
  const setupSSE = useCallback(() => {
    if (!enableSSE) return;

    if (sseRef.current) {
      sseRef.current.close();
    }

    try {
      const sseEndpoint = `${endpoint}/sse`;
      sseRef.current = new EventSource(sseEndpoint);

      sseRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          setState(prev => ({
            ...prev,
            data,
            lastUpdated: new Date(),
            isStale: false,
          }));
        } catch (error) {
          console.error('SSE data parse error:', error);
        }
      };

      sseRef.current.onerror = (error) => {
        console.error('SSE error:', error);
        sseRef.current?.close();
      };
    } catch (error) {
      console.error('Failed to setup SSE:', error);
    }
  }, [endpoint, enableSSE, ]);

  // Setup WebSocket
  const setupWebSocket = useCallback(() => {
    if (!enableWebSocket) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const wsEndpoint = `${endpoint}/ws`;
      wsRef.current = new WebSocket(wsEndpoint);

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          setState(prev => ({
            ...prev,
            data,
            lastUpdated: new Date(),
            isStale: false,
          }));
        } catch (error) {
          console.error('WebSocket data parse error:', error);
        }
      };

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after delay
        setTimeout(setupWebSocket, 5000);
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  }, [endpoint, enableWebSocket]);

  // Initialize data fetching
  useEffect(() => {
    fetchData(true);
    setupPolling();
    setupSSE();
    setupWebSocket();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (sseRef.current) {
        sseRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchData, setupPolling, setupSSE, setupWebSocket]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);


  return {
    ...state,
    refresh,
  };
}

// Hook for multiple endpoints
export function useRealtimeMultipleData<T extends Record<string, any>>(
  endpoints: Record<keyof T, string>,
  options: RealtimeDataOptions = {}
) {
  const results = {} as Record<keyof T, ReturnType<typeof useRealtimeData<any>>>;

  Object.entries(endpoints).forEach(([key, endpoint]) => {
    results[key as keyof T] = useRealtimeData(endpoint, options);
  });

  return results;
}
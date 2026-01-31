import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

// Socket.IO event types
export interface BusinessCreatedEvent {
  business: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
  };
  action: 'create';
  timestamp: string;
  adminId: string;
}

export interface BusinessUpdatedEvent {
  business: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    isActive: boolean;
    updatedAt: string;
  };
  action: 'update';
  timestamp: string;
  adminId: string;
}

export interface BusinessStatusUpdatedEvent {
  business: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    admin?: {
      id: string;
      email: string;
      name?: string;
    };
    category?: {
      id: string;
      name: string;
    };
  };
  action: 'status-update';
  timestamp: string;
  adminId: string;
}

export interface BusinessDeletedEvent {
  businessId: string;
  action: 'delete';
  timestamp: string;
  adminId: string;
}

export interface BusinessBulkDeletedEvent {
  businessIds: string[];
  deletedCount: number;
  action: 'bulk-delete';
  timestamp: string;
  adminId: string;
}

export interface BusinessBulkStatusUpdateEvent {
  businessIds: string[];
  isActive: boolean;
  action: 'bulk-status-update';
  timestamp: string;
  adminId: string;
}

// Event payload union type
export type BusinessSocketEvent =
  | BusinessCreatedEvent
  | BusinessUpdatedEvent
  | BusinessStatusUpdatedEvent
  | BusinessDeletedEvent
  | BusinessBulkDeletedEvent
  | BusinessBulkStatusUpdateEvent;

// Professional Socket.IO event types
export interface ProfessionalCreatedEvent {
  professional: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
  };
  action: 'create';
  timestamp: string;
  adminId: string;
}

export interface ProfessionalUpdatedEvent {
  professional: {
    id: string;
    name: string;
    slug: string;
    professionalHeadline?: string;
    profilePicture?: string;
    location?: string;
    phone?: string;
    email?: string;
    isActive: boolean;
    updatedAt: string;
  };
  action: 'update';
  timestamp: string;
  adminId: string;
}

export interface ProfessionalStatusUpdatedEvent {
  professional: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  action: 'status-update';
  timestamp: string;
  adminId: string;
}

export interface ProfessionalDeletedEvent {
  professionalId: string;
  action: 'delete';
  timestamp: string;
  adminId: string;
}

export interface ProfessionalBulkDeletedEvent {
  professionalIds: string[];
  deletedCount: number;
  action: 'bulk-delete';
  timestamp: string;
  adminId: string;
}

export interface ProfessionalBulkStatusUpdateEvent {
  professionalIds: string[];
  isActive: boolean;
  action: 'bulk-status-update';
  timestamp: string;
  adminId: string;
}

// Event payload union type for professionals
export type ProfessionalSocketEvent =
  | ProfessionalCreatedEvent
  | ProfessionalUpdatedEvent
  | ProfessionalStatusUpdatedEvent
  | ProfessionalDeletedEvent
  | ProfessionalBulkDeletedEvent
  | ProfessionalBulkStatusUpdateEvent;

// Socket hook return type
interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  lastEvent: BusinessSocketEvent | null;
  subscribe: (eventName: string, callback: (data: BusinessSocketEvent) => void) => () => void;
  unsubscribe: (eventName: string) => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const lastEventRef = useRef<BusinessSocketEvent | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Only connect if we're on the client side
    if (typeof window === 'undefined') return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket.IO] Connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket.IO] Reconnected after', attemptNumber, 'attempts');
    });

    // Handle all business-related events
    const handleBusinessCreated = (data: BusinessCreatedEvent) => {
      console.log('[Socket.IO] Business created:', data.business.id);
      lastEventRef.current = data;
      queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleBusinessUpdated = (data: BusinessUpdatedEvent) => {
      console.log('[Socket.IO] Business updated:', data.business.id);
      lastEventRef.current = data;
      queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['businesses', 'detail', data.business.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleBusinessStatusUpdated = (data: BusinessStatusUpdatedEvent) => {
      console.log('[Socket.IO] Business status updated:', data.business.id, data.business.isActive);
      lastEventRef.current = data;
      queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['businesses', 'detail', data.business.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleBusinessDeleted = (data: BusinessDeletedEvent) => {
      console.log('[Socket.IO] Business deleted:', data.businessId);
      lastEventRef.current = data;
      queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleBusinessBulkDeleted = (data: BusinessBulkDeletedEvent) => {
      console.log('[Socket.IO] Bulk businesses deleted:', data.deletedCount);
      lastEventRef.current = data;
      queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleBusinessBulkStatusUpdate = (data: BusinessBulkStatusUpdateEvent) => {
      console.log('[Socket.IO] Bulk businesses status updated:', data.businessIds.length);
      lastEventRef.current = data;
      queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    // Subscribe to all business events
    socket.on('business-created', handleBusinessCreated);
    socket.on('business-updated', handleBusinessUpdated);
    socket.on('business-status-updated', handleBusinessStatusUpdated);
    socket.on('business-deleted', handleBusinessDeleted);
    socket.on('business-bulk-deleted', handleBusinessBulkDeleted);
    socket.on('business-status-updated', handleBusinessBulkStatusUpdate);

    // Handle all professional-related events
    const handleProfessionalCreated = (data: ProfessionalCreatedEvent) => {
      console.log('[Socket.IO] Professional created:', data.professional.id);
      queryClient.invalidateQueries({ queryKey: ['professionals', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleProfessionalUpdated = (data: ProfessionalUpdatedEvent) => {
      console.log('[Socket.IO] Professional updated:', data.professional.id);
      queryClient.invalidateQueries({ queryKey: ['professionals', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['professionals', 'detail', data.professional.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleProfessionalStatusUpdated = (data: ProfessionalStatusUpdatedEvent) => {
      console.log('[Socket.IO] Professional status updated:', data.professional.id, data.professional.isActive);
      queryClient.invalidateQueries({ queryKey: ['professionals', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['professionals', 'detail', data.professional.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleProfessionalDeleted = (data: ProfessionalDeletedEvent) => {
      console.log('[Socket.IO] Professional deleted:', data.professionalId);
      queryClient.invalidateQueries({ queryKey: ['professionals', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleProfessionalBulkDeleted = (data: ProfessionalBulkDeletedEvent) => {
      console.log('[Socket.IO] Bulk professionals deleted:', data.deletedCount);
      queryClient.invalidateQueries({ queryKey: ['professionals', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    const handleProfessionalBulkStatusUpdate = (data: ProfessionalBulkStatusUpdateEvent) => {
      console.log('[Socket.IO] Bulk professionals status updated:', data.professionalIds.length);
      queryClient.invalidateQueries({ queryKey: ['professionals', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    // Subscribe to all professional events
    socket.on('professional-created', handleProfessionalCreated);
    socket.on('professional-updated', handleProfessionalUpdated);
    socket.on('professional-status-updated', handleProfessionalStatusUpdated);
    socket.on('professional-deleted', handleProfessionalDeleted);
    socket.on('professional-bulk-deleted', handleProfessionalBulkDeleted);
    socket.on('professional-status-updated', handleProfessionalBulkStatusUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('business-created', handleBusinessCreated);
      socket.off('business-updated', handleBusinessUpdated);
      socket.off('business-status-updated', handleBusinessStatusUpdated);
      socket.off('business-deleted', handleBusinessDeleted);
      socket.off('business-bulk-deleted', handleBusinessBulkDeleted);
      socket.off('business-status-updated', handleBusinessBulkStatusUpdate);
      socket.off('professional-created', handleProfessionalCreated);
      socket.off('professional-updated', handleProfessionalUpdated);
      socket.off('professional-status-updated', handleProfessionalStatusUpdated);
      socket.off('professional-deleted', handleProfessionalDeleted);
      socket.off('professional-bulk-deleted', handleProfessionalBulkDeleted);
      socket.off('professional-status-updated', handleProfessionalBulkStatusUpdate);
      socket.disconnect();
    };
  }, [queryClient]);

  // Subscribe to specific events with callback
  const subscribe = useCallback((eventName: string, callback: (data: BusinessSocketEvent) => void) => {
    if (!socketRef.current) {
      console.warn('[Socket.IO] Socket not initialized');
      return () => {};
    }

    const handler = (data: BusinessSocketEvent) => {
      callback(data);
    };

    socketRef.current.on(eventName, handler);

    return () => {
      socketRef.current?.off(eventName, handler);
    };
  }, []);

  // Unsubscribe from specific events
  const unsubscribe = useCallback((eventName: string) => {
    if (!socketRef.current) return;
    socketRef.current.off(eventName);
  }, []);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    lastEvent: lastEventRef.current,
    subscribe,
    unsubscribe,
  };
}

// Hook to use Socket.IO on admin pages
export function useAdminSocket() {
  const { isConnected, subscribe, unsubscribe, lastEvent } = useSocket();

  return {
    isConnected,
    lastEvent,
    subscribe,
    unsubscribe,
  };
}

// Hook to get real-time business updates for a specific business
export function useBusinessUpdates(businessId: string | undefined) {
  const [lastUpdate, setLastUpdate] = useState<BusinessSocketEvent | null>(null);
  const { subscribe } = useSocket();

  useEffect(() => {
    if (!businessId) return;

    const unsubUpdate = subscribe('business-updated', (event) => {
      if ('business' in event && event.business.id === businessId) {
        setLastUpdate(event);
      }
    });

    const unsubStatus = subscribe('business-status-updated', (event) => {
      if ('business' in event && event.business.id === businessId) {
        setLastUpdate(event);
      }
    });

    return () => {
      unsubUpdate();
      unsubStatus();
    };
  }, [businessId, subscribe]);

  return lastUpdate;
}

// Hook to get real-time professional updates for a specific professional
export function useProfessionalUpdates(professionalId: string | undefined) {
  const [lastUpdate, setLastUpdate] = useState<ProfessionalSocketEvent | null>(null);
  const { subscribe } = useSocket();

  useEffect(() => {
    if (!professionalId) return;

    const unsubUpdate = subscribe('professional-updated', (event: any) => {
      if ('professional' in event && event.professional.id === professionalId) {
        setLastUpdate(event);
      }
    });

    const unsubStatus = subscribe('professional-status-updated', (event: any) => {
      if ('professional' in event && event.professional.id === professionalId) {
        setLastUpdate(event);
      }
    });

    return () => {
      unsubUpdate();
      unsubStatus();
    };
  }, [professionalId, subscribe]);

  return lastUpdate;
}

'use client';

import { ReactNode } from 'react';
import { useSocket } from '@/lib/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';

/**
 * Socket.IO Provider Component
 * 
 * This component establishes a real-time connection and handles
 * incoming events for the admin panel.
 * 
 * Usage: Wrap your admin layout with this component
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useSocket();
  const { toast } = useToast();

  // Optionally show connection status toast
  // This can be removed if not needed
  return (
    <>
      {/* Connection status indicator (optional) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: isConnected ? '#4ade80' : '#f87171',
            color: '#000',
            zIndex: 9999,
          }}
        >
          {isConnected ? '🟢 Live' : '🔴 Offline'}
        </div>
      )}
      {children}
    </>
  );
}

/**
 * Toast notification on business events
 * Uncomment to enable real-time toast notifications
 */
/*
export function SocketToastProvider({ children }: { children: ReactNode }) {
  const { lastEvent } = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!lastEvent) return;

    let title = '';
    let description = '';

    switch (lastEvent.action) {
      case 'create':
        title = 'New Business Created';
        description = `A new business "${(lastEvent as any).business.name}" was created`;
        break;
      case 'update':
        title = 'Business Updated';
        description = `Business "${(lastEvent as any).business.name}" was updated`;
        break;
      case 'status-update':
        const isActive = (lastEvent as any).business?.isActive;
        title = isActive ? 'Business Activated' : 'Business Suspended';
        description = `Business status changed`;
        break;
      case 'delete':
        title = 'Business Deleted';
        description = 'A business was removed';
        break;
      case 'bulk-delete':
        title = 'Bulk Delete';
        description = `${(lastEvent as any).deletedCount} businesses were deleted`;
        break;
      case 'bulk-status-update':
        const action = (lastEvent as any).isActive ? 'activated' : 'suspended';
        title = `Bulk ${action}`;
        description = `${(lastEvent as any).businessIds.length} businesses were ${action}`;
        break;
    }

    if (title) {
      toast({
        title,
        description,
        duration: 5000,
      });
    }
  }, [lastEvent, toast]);

  return <>{children}</>;
}
*/

export default SocketProvider;

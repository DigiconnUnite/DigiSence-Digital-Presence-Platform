'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimized for admin panel - faster data refresh
            staleTime: 10 * 1000, // 10 seconds - data is considered fresh for 10 seconds
            gcTime: 2 * 60 * 1000, // 2 minutes - cache persists for 2 minutes
            refetchOnWindowFocus: true, // Refetch when window regains focus
            retry: 1, // Retry failed requests once
            refetchInterval: false, // No automatic refetch interval (controlled manually)
          },
          mutations: {
            retry: 1, // Retry failed mutations once
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

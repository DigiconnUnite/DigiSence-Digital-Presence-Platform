'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute - data is considered fresh for 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes - cache persists for 5 minutes
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

import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,                        // Always refetch from server (IndexedDB shows instantly while fetching)
        gcTime: 24 * 60 * 60 * 1000,        // Keep in IndexedDB for 24h
        refetchOnWindowFocus: true,          // Refetch when tab is focused (catches admin changes)
        refetchOnReconnect: true,
        retry: 2,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

export const queryClient = getQueryClient();

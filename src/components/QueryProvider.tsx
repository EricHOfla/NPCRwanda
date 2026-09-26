'use client';

import React, { useMemo } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { getQueryClient } from '@/lib/queryClient';

const idbStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return null;
    try {
      const { get } = await import('idb-keyval');
      const val = await get(key);
      return val ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
    try {
      const { set } = await import('idb-keyval');
      await set(key, value);
    } catch {
      // Ignore storage errors gracefully
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
    try {
      const { del } = await import('idb-keyval');
      await del(key);
    } catch {
      // Ignore storage errors gracefully
    }
  },
};

const persister = createAsyncStoragePersister({
  storage: idbStorage,
  key: 'NPC_RWANDA_REACT_QUERY_CACHE',
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => getQueryClient(), []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist public queries (e.g. ['npc-public-bundle'])
            // Never persist private admin queries or failed queries
            return (
              query.state.status === 'success' &&
              query.queryKey[0] === 'npc-public-bundle'
            );
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

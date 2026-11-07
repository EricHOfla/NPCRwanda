'use client';
/**
 * useTableSort – Generic column sort state hook.
 */
import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

export interface SortState<K extends string> {
  field: K | null;
  direction: SortDirection;
}

export interface UseTableSortResult<T, K extends string> {
  sortState: SortState<K>;
  sortedItems: T[];
  toggleSort: (field: K) => void;
}

export function useTableSort<T, K extends string>(
  items: T[],
  getValue: (item: T, field: K) => string | number | boolean | null | undefined,
): UseTableSortResult<T, K> {
  const [sortState, setSortState] = useState<SortState<K>>({ field: null, direction: 'asc' });

  const sortedItems = useMemo(() => {
    if (!sortState.field) return items;
    const field = sortState.field;
    return [...items].sort((a, b) => {
      const aVal = getValue(a, field) ?? '';
      const bVal = getValue(b, field) ?? '';
      const result = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortState.direction === 'asc' ? result : -result;
    });
  }, [items, sortState, getValue]);

  const toggleSort = (field: K) => {
    setSortState((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    );
  };

  return { sortState, sortedItems, toggleSort };
}

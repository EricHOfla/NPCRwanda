'use client';
/**
 * usePagination – Generic pagination state hook.
 */
import { useState, useMemo } from 'react';

export interface PaginationResult<T> {
  page: number;
  totalPages: number;
  items: T[];
  setPage: (page: number) => void;
}

export function usePagination<T>(items: T[], pageSize = 10): PaginationResult<T> {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    totalPages,
    items: paginatedItems,
    setPage: (p: number) => setPage(Math.min(Math.max(1, p), totalPages)),
  };
}

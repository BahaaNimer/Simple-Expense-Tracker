'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Transaction } from '../../lib/api';
import { FILTER_ALL, amountRangeToMinMax, TYPE_OPTIONS } from '../../constants/transactions';
import { useSnackbar } from '../../contexts/SnackbarContext';

export type SortOrder = 'asc' | 'desc';

export type SortField = 'date' | 'reference' | 'counterparty' | 'amount' | 'status';

export function useTransactionsList() {
  const snackbar = useSnackbar();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(FILTER_ALL);
  const [referencePrefix, setReferencePrefix] = useState(FILTER_ALL);
  const [amountRange, setAmountRange] = useState(FILTER_ALL);
  const [categoryFilter, setCategoryFilter] = useState(FILTER_ALL);
  const [typeFilter, setTypeFilter] = useState(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: referencePrefixOptions = [] } = useQuery({
    queryKey: ['reference-prefixes'],
    queryFn: async () => {
      try {
        return await api.transactions.referencePrefixes();
      } catch {
        return [] as string[];
      }
    },
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 min – options change rarely
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    staleTime: 2 * 60 * 1000, // 2 min – shared across pages, avoid refetch on nav/focus
  });

  const params = useMemo(() => {
    const p: Record<string, string | number> = {
      page: page + 1,
      limit,
      sortBy,
      sortOrder,
    };
    if (search) p.search = search;
    if (referencePrefix && referencePrefix !== FILTER_ALL) p.referencePrefix = referencePrefix;
    const { minAmount, maxAmount } = amountRangeToMinMax(amountRange);
    if (minAmount != null) p.minAmount = minAmount;
    if (maxAmount != null) p.maxAmount = maxAmount;
    if (dateFilter === 'week') {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      p.startDate = start.toISOString().split('T')[0];
      p.endDate = end.toISOString().split('T')[0];
    } else if (dateFilter === 'month') {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      p.startDate = start.toISOString().split('T')[0];
      p.endDate = end.toISOString().split('T')[0];
    }
    if (categoryFilter && categoryFilter !== FILTER_ALL) p.categoryId = categoryFilter;
    if (typeFilter && typeFilter !== FILTER_ALL) p.type = typeFilter as 'income' | 'expense';
    if (statusFilter && statusFilter !== FILTER_ALL) p.status = statusFilter;
    return p;
  }, [page, limit, sortBy, sortOrder, search, dateFilter, referencePrefix, amountRange, categoryFilter, typeFilter, statusFilter]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.transactions.list(params),
    staleTime: 60 * 1000, // 1 min – list still refetches after invalidate (e.g. after delete)
  });

  const rows: Transaction[] = data?.data ?? [];
  const rowIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const numSelected = rowIds.filter((id) => selectedIds.has(id)).length;
  const allSelected = rowIds.length > 0 && numSelected === rowIds.length;
  const someSelected = numSelected > 0;

  const handleSort = useCallback((column: SortField) => {
    setSortBy((prev) => {
      if (prev === column) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortOrder('asc');
      return column;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) rowIds.forEach((id) => next.delete(id));
      else rowIds.forEach((id) => next.add(id));
      return next;
    });
  }, [allSelected, rowIds]);

  const handleToggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => api.transactions.delete(id))),
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      setSelectedIds(new Set());
      const n = ids?.length ?? 0;
      snackbar.showSuccess(n === 1 ? 'Transaction deleted successfully.' : `${n} transactions deleted successfully.`);
    },
    onError: (err: Error) => {
      snackbar.showError(err.message);
    },
  });

  const deleteSelected = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return Promise.resolve();
    return deleteMutation.mutateAsync(ids);
  }, [selectedIds, deleteMutation]);

  return {
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    referencePrefix,
    setReferencePrefix,
    referencePrefixOptions: Array.isArray(referencePrefixOptions)
      ? referencePrefixOptions.map((p) => ({ value: p, label: p }))
      : [],
    amountRange,
    setAmountRange,
    categoryFilter,
    setCategoryFilter,
    categoryOptions: categories.map((c) => ({ value: c.id, label: c.name })),
    typeFilter,
    setTypeFilter,
    typeOptions: [...TYPE_OPTIONS],
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    limit,
    setLimit,
    sortBy,
    sortOrder,
    handleSort,
    selectedIds,
    allSelected,
    someSelected,
    handleSelectAll,
    handleToggleRow,
    deleteSelected,
    isDeleting: deleteMutation.isPending,
    rows,
    data,
    isLoading,
    error,
    refetch,
  };
}

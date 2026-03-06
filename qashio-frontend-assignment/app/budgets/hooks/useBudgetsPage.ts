'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { api, type Budget, type BudgetPeriod, type CreateBudgetInput } from '../../lib/api';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { SNACKBAR, MESSAGES } from '../../constants/messages';

export type BudgetFormState = {
  amount: number;
  period: BudgetPeriod;
  categoryId: string;
  startDate: Date | null;
  endDate: Date | null;
};

function getDefaultEndDate(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

const emptyForm: BudgetFormState = {
  amount: 0,
  period: 'monthly',
  categoryId: '',
  startDate: null,
  endDate: getDefaultEndDate(),
};

export function useBudgetsPage() {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [form, setForm] = useState<BudgetFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingBudget && dialogOpen) {
      setForm({
        amount: Math.round((Number(editingBudget.amount) || 0) * 100) / 100,
        period: editingBudget.period ?? 'monthly',
        categoryId: editingBudget.categoryId ?? editingBudget.category?.id ?? '',
        startDate: editingBudget.startDate ? new Date(editingBudget.startDate) : null,
        endDate: editingBudget.endDate ? new Date(editingBudget.endDate) : null,
      });
    } else if (!dialogOpen) {
      setForm({ ...emptyForm, endDate: getDefaultEndDate() });
    }
  }, [editingBudget, dialogOpen]);

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => api.budgets.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    staleTime: 2 * 60 * 1000,
  });

  const usageQueries = useQueries({
    queries: budgets.map((b) => ({
      queryKey: ['budget-usage', b.id],
      queryFn: () => api.budgets.getUsage(b.id),
      enabled: !!b.id,
    })),
  });

  const usageMap = useMemo(() => {
    const m = new Map<string, { spent: number; remaining: number; percentageUsed: number }>();
    usageQueries.forEach((q, i) => {
      const b = budgets[i];
      if (b && q.data) {
        m.set(b.id, {
          spent: q.data.spent,
          remaining: q.data.remaining,
          percentageUsed: q.data.percentageUsed,
        });
      }
    });
    return m;
  }, [budgets, usageQueries]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateBudgetInput) => api.budgets.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setDialogOpen(false);
      setEditingBudget(null);
      setError(null);
      snackbar.showSuccess(SNACKBAR.budgetCreated);
    },
    onError: (err: Error) => {
      setError(err.message);
      snackbar.showError(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBudgetInput }) =>
      api.budgets.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      setDialogOpen(false);
      setEditingBudget(null);
      setError(null);
      snackbar.showSuccess(SNACKBAR.budgetUpdated);
    },
    onError: (err: Error) => {
      setError(err.message);
      snackbar.showError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.budgets.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setDeleteTarget(null);
      snackbar.showSuccess(SNACKBAR.budgetDeleted);
    },
    onError: (err: Error) => {
      setError(err.message);
      snackbar.showError(err.message);
    },
  });

  const handleOpenAdd = useCallback(() => {
    setEditingBudget(null);
    setError(null);
    setForm({ ...emptyForm, startDate: new Date(), endDate: getDefaultEndDate() });
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((budget: Budget) => {
    setEditingBudget(budget);
    setError(null);
    setDialogOpen(true);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingBudget(null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!form.categoryId || !form.startDate || !form.endDate) {
        setError(MESSAGES.categoryAndDatesRequired);
        return;
      }
      if (form.amount <= 0) {
        setError(MESSAGES.amountMustBePositive);
        return;
      }
      const payload: CreateBudgetInput = {
        amount: form.amount,
        period: form.period,
        categoryId: form.categoryId,
        startDate: form.startDate.toISOString().split('T')[0],
        endDate: form.endDate.toISOString().split('T')[0],
      };
      if (editingBudget) {
        updateMutation.mutate({ id: editingBudget.id, data: payload });
      } else {
        createMutation.mutate(payload);
      }
    },
    [form, editingBudget, updateMutation, createMutation],
  );

  const handleDeleteClick = useCallback((budget: Budget) => setDeleteTarget(budget), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  }, [deleteTarget, deleteMutation]);
  const handleCloseDeleteDialog = useCallback(() => setDeleteTarget(null), []);

  return {
    budgets,
    budgetsLoading,
    categories,
    usageMap,
    form,
    setForm,
    error,
    setError,
    dialogOpen,
    editingBudget,
    deleteTarget,
    createMutation,
    updateMutation,
    deleteMutation,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseFormDialog,
    handleSubmit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleCloseDeleteDialog,
  };
}

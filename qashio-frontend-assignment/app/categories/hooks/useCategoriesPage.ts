'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Category } from '../../lib/api';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { SNACKBAR, MESSAGES } from '../../constants/messages';

export function useCategoriesPage() {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string }) => api.categories.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDialogOpen(false);
      setEditingCategory(null);
      setName('');
      setError(null);
      snackbar.showSuccess(SNACKBAR.categoryCreated);
    },
    onError: (err: Error) => {
      setError(err.message);
      snackbar.showError(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name: n }: { id: string; name: string }) =>
      api.categories.update(id, { name: n }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDialogOpen(false);
      setEditingCategory(null);
      setName('');
      setError(null);
      snackbar.showSuccess(SNACKBAR.categoryUpdated);
    },
    onError: (err: Error) => {
      setError(err.message);
      snackbar.showError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
      snackbar.showSuccess(SNACKBAR.categoryDeleted);
    },
    onError: (err: Error) => {
      setError(err.message);
      snackbar.showError(err.message);
    },
  });

  const handleOpenAdd = useCallback(() => {
    setEditingCategory(null);
    setName('');
    setError(null);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setError(null);
    setDialogOpen(true);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingCategory(null);
    setName('');
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = name.trim();
      if (!trimmed) {
        setError(MESSAGES.nameRequired);
        return;
      }
      if (editingCategory) {
        updateMutation.mutate({ id: editingCategory.id, name: trimmed });
      } else {
        createMutation.mutate({ name: trimmed });
      }
    },
    [name, editingCategory, updateMutation, createMutation],
  );

  const handleDeleteClick = useCallback((cat: Category) => setDeleteTarget(cat), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  }, [deleteTarget, deleteMutation]);
  const handleCloseDeleteDialog = useCallback(() => setDeleteTarget(null), []);

  return {
    categories,
    isLoading,
    name,
    setName,
    error,
    setError,
    dialogOpen,
    editingCategory,
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

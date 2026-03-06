'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, type CreateTransactionInput } from '../../../lib/api';
import { REFERENCE_PATTERN, REFERENCE_FORMAT_LABEL } from '../../../constants/transactions';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { SNACKBAR } from '../../../constants/messages';
import { NEW_TRANSACTION_PAGE } from '../../../constants/new-transaction';
import { z } from 'zod';

const schema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['income', 'expense']),
  reference: z
    .string()
    .min(1, 'Reference is required')
    .regex(REFERENCE_PATTERN, `Reference must be in format ${REFERENCE_FORMAT_LABEL}`),
  counterparty: z.string().min(1, 'Counterparty is required'),
  categoryId: z.string().uuid('Select a category'),
  status: z.enum(['Active', 'Inactive', 'Completed', 'Pending', 'Failed']).optional(),
  narration: z.string().optional(),
});

export type NewTransactionFormState = Omit<Partial<CreateTransactionInput>, 'date'> & {
  date: Date | null;
};

const initialFormState: NewTransactionFormState = {
  amount: 0,
  date: new Date(),
  type: 'expense',
  reference: '',
  counterparty: '',
  categoryId: '',
  status: 'Active',
  narration: '',
};

export function useNewTransaction() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const [formData, setFormData] = useState<NewTransactionFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    staleTime: 2 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateTransactionInput) => api.transactions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      snackbar.showSuccess(SNACKBAR.transactionCreated);
      router.push('/transactions');
    },
    onError: (err: Error) => {
      setErrors({ form: err.message });
      snackbar.showError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!formData.date) {
      setErrors({ date: NEW_TRANSACTION_PAGE.dateRequired });
      return;
    }
    const payload = {
      amount: Number(formData.amount) || 0,
      date: formData.date.toISOString(),
      type: formData.type || 'expense',
      reference: formData.reference || '',
      counterparty: formData.counterparty || '',
      categoryId: formData.categoryId || '',
      status: formData.status,
      narration: formData.narration,
    };
    const result = schema.safeParse(payload);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        if (path) errMap[path] = err.message;
      });
      setErrors(errMap);
      return;
    }
    mutation.mutate(result.data as CreateTransactionInput);
  };

  return {
    formData,
    setFormData,
    errors,
    categories: categories ?? [],
    categoriesLoading,
    mutation,
    handleSubmit,
  };
}

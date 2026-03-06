'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Transaction, type CreateTransactionInput } from '../../lib/api';
import {
  REFERENCE_PATTERN,
  REFERENCE_FORMAT_LABEL,
  formatReferenceInput,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
} from '../../constants/transactions';
import { TRANSACTIONS_PAGE } from '../../constants/transactions-page';
import { NEW_TRANSACTION_PAGE } from '../../constants/new-transaction';
import { SNACKBAR } from '../../constants/messages';
import { BUTTON_LABELS } from '../../constants/common';
import { useSnackbar } from '../../contexts/SnackbarContext';
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

type FormState = Omit<Partial<CreateTransactionInput>, 'date'> & { date: Date | null };

export interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function EditTransactionDialog({
  transaction,
  open,
  onClose,
}: EditTransactionDialogProps) {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const [formData, setFormData] = useState<FormState>({
    amount: 0,
    date: null,
    type: 'expense',
    reference: '',
    counterparty: '',
    categoryId: '',
    status: 'Active',
    narration: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    enabled: open,
    staleTime: 2 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (payload: CreateTransactionInput) =>
      api.transactions.update(transaction!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transaction?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      snackbar.showSuccess(SNACKBAR.transactionUpdated);
      onClose();
    },
    onError: (err: Error) => {
      setErrors({ form: err.message });
      snackbar.showError(err.message);
    },
  });

  useEffect(() => {
    if (transaction && open) {
      setFormData({
        amount: Number(transaction.amount) || 0,
        date: transaction.date ? new Date(transaction.date) : null,
        type: transaction.type ?? 'expense',
        reference: transaction.reference ?? '',
        counterparty: transaction.counterparty ?? '',
        categoryId: transaction.categoryId ?? transaction.category?.id ?? '',
        status: transaction.status ?? 'Active',
        narration: transaction.narration ?? '',
      });
      setErrors({});
    }
  }, [transaction, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!transaction) return;
    if (!formData.date) {
      setErrors({ date: NEW_TRANSACTION_PAGE.dateRequired });
      return;
    }
    const payload = {
      amount: Number(formData.amount) || 0,
      date: formData.date.toISOString(),
      type: (formData.type || 'expense') as 'income' | 'expense',
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{TRANSACTIONS_PAGE.editDialog.title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {errors.form && (
            <Alert severity="error" onClose={() => setErrors((e) => ({ ...e, form: '' }))}>
              {errors.form}
            </Alert>
          )}

          <TextField
            fullWidth
            label={NEW_TRANSACTION_PAGE.amountLabel}
            type="number"
            value={formData.amount ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
            error={!!errors.amount}
            helperText={errors.amount}
            inputProps={{ step: 0.01, min: 0 }}
          />

          <FormControl fullWidth>
            <InputLabel>{NEW_TRANSACTION_PAGE.typeLabel}</InputLabel>
            <Select
              value={formData.type}
              label={NEW_TRANSACTION_PAGE.typeLabel}
              onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as 'income' | 'expense' }))}
            >
              {TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label={NEW_TRANSACTION_PAGE.dateLabel}
            value={formData.date}
            onChange={(d) => setFormData((p) => ({ ...p, date: d }))}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.date,
                helperText: errors.date,
              },
            }}
          />

          <TextField
            fullWidth
            label={NEW_TRANSACTION_PAGE.referenceLabel}
            placeholder={REFERENCE_FORMAT_LABEL}
            value={formData.reference}
            onChange={(e) =>
              setFormData((p) => ({ ...p, reference: formatReferenceInput(e.target.value) }))
            }
            inputProps={{ maxLength: 9 }}
            error={!!errors.reference}
            helperText={errors.reference ?? TRANSACTIONS_PAGE.editDialog.referenceHelper}
          />

          <TextField
            fullWidth
            label={NEW_TRANSACTION_PAGE.counterpartyLabel}
            value={formData.counterparty}
            onChange={(e) => setFormData((p) => ({ ...p, counterparty: e.target.value }))}
            error={!!errors.counterparty}
            helperText={errors.counterparty}
          />

          <FormControl fullWidth error={!!errors.categoryId}>
            <InputLabel>{NEW_TRANSACTION_PAGE.categoryLabel}</InputLabel>
            <Select
              value={formData.categoryId}
              label={NEW_TRANSACTION_PAGE.categoryLabel}
              onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
            >
              <MenuItem value="">{TRANSACTIONS_PAGE.editDialog.selectCategory}</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
            {errors.categoryId && (
              <FormHelperText error>{errors.categoryId}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>{NEW_TRANSACTION_PAGE.statusLabel}</InputLabel>
            <Select
              value={formData.status}
              label={NEW_TRANSACTION_PAGE.statusLabel}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label={NEW_TRANSACTION_PAGE.narrationLabel}
            multiline
            rows={2}
            value={formData.narration ?? ''}
            onChange={(e) => setFormData((p) => ({ ...p, narration: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            {BUTTON_LABELS.cancel}
          </Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? <CircularProgress size={24} /> : BUTTON_LABELS.save}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

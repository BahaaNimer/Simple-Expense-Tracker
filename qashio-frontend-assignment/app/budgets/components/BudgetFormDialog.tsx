'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { type Budget, type BudgetPeriod, type Category } from '../../lib/api';
import { PERIOD_OPTIONS } from '../../constants/budgets';
import { BUDGETS_PAGE } from '../../constants/budgets-page';
import { BUTTON_LABELS } from '../../constants/common';
import type { BudgetFormState } from '../hooks/useBudgetsPage';

interface BudgetFormDialogProps {
  open: boolean;
  editingBudget: Budget | null;
  form: BudgetFormState;
  setForm: React.Dispatch<React.SetStateAction<BudgetFormState>>;
  categories: Category[];
  error: string | null;
  setError: (err: string | null) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function BudgetFormDialog({
  open,
  editingBudget,
  form,
  setForm,
  categories,
  error,
  setError,
  isSubmitting,
  onSubmit,
  onClose,
}: BudgetFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>{editingBudget ? BUDGETS_PAGE.editBudgetTitle : BUDGETS_PAGE.addBudgetTitle}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="budget-category">{BUDGETS_PAGE.form.categoryLabel}</InputLabel>
            <Select
              labelId="budget-category"
              label={BUDGETS_PAGE.form.categoryLabel}
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type="number"
            label={BUDGETS_PAGE.form.amountLabel}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: 0, step: 0.01 }}
            value={form.amount || ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                amount: Math.round((Number(e.target.value) || 0) * 100) / 100,
              }))
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="budget-period">{BUDGETS_PAGE.form.periodLabel}</InputLabel>
            <Select
              labelId="budget-period"
              label={BUDGETS_PAGE.form.periodLabel}
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value as BudgetPeriod }))}
            >
              {PERIOD_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DatePicker
            label={BUDGETS_PAGE.form.startDateLabel}
            value={form.startDate}
            onChange={(d) => setForm((f) => ({ ...f, startDate: d }))}
            slotProps={{ textField: { fullWidth: true, margin: 'normal', required: true } }}
          />
          <DatePicker
            label={BUDGETS_PAGE.form.endDateLabel}
            value={form.endDate}
            onChange={(d) => setForm((f) => ({ ...f, endDate: d }))}
            slotProps={{ textField: { fullWidth: true, margin: 'normal', required: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{BUTTON_LABELS.cancel}</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {editingBudget
              ? isSubmitting
                ? BUTTON_LABELS.saving
                : BUTTON_LABELS.save
              : isSubmitting
                ? BUTTON_LABELS.adding
                : BUTTON_LABELS.add}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

'use client';

import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { type Category } from '../../../lib/api';
import { REFERENCE_FORMAT_LABEL, formatReferenceInput } from '../../../constants/transactions';
import { STATUS_OPTIONS, TYPE_OPTIONS } from '../../../constants/transactions';
import { NEW_TRANSACTION_PAGE } from '../../../constants/new-transaction';
import { CENTERED_FORM_MAX_WIDTH } from '../../../constants/ui';
import type { NewTransactionFormState } from '../hooks/useNewTransaction';

interface NewTransactionFormProps {
  formData: NewTransactionFormState;
  setFormData: React.Dispatch<React.SetStateAction<NewTransactionFormState>>;
  errors: Record<string, string>;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function NewTransactionForm({
  formData,
  setFormData,
  errors,
  categories,
  onSubmit,
  onCancel,
  isPending,
}: NewTransactionFormProps) {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: CENTERED_FORM_MAX_WIDTH, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {NEW_TRANSACTION_PAGE.title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
        <form onSubmit={onSubmit}>
          {errors.form && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.form}
            </Alert>
          )}

          <TextField
            fullWidth
            label={NEW_TRANSACTION_PAGE.amountLabel}
            type="number"
            value={formData.amount || ''}
            onChange={(e) =>
              setFormData((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))
            }
            error={!!errors.amount}
            helperText={errors.amount}
            sx={{ mb: 2 }}
            inputProps={{ step: 0.01, min: 0 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{NEW_TRANSACTION_PAGE.typeLabel}</InputLabel>
            <Select
              value={formData.type}
              label={NEW_TRANSACTION_PAGE.typeLabel}
              onChange={(e) =>
                setFormData((p) => ({ ...p, type: e.target.value as 'income' | 'expense' }))
              }
            >
              {TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
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
          </Box>

          <TextField
            fullWidth
            label={NEW_TRANSACTION_PAGE.referenceLabel}
            placeholder={REFERENCE_FORMAT_LABEL}
            value={formData.reference || ''}
            onChange={(e) =>
              setFormData((p) => ({ ...p, reference: formatReferenceInput(e.target.value) }))
            }
            inputProps={{ maxLength: 9 }}
            error={!!errors.reference}
            helperText={
              errors.reference ?? 'Format: 4 characters, hyphen, 4 characters (e.g. ABCD-1234)'
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={NEW_TRANSACTION_PAGE.counterpartyLabel}
            value={formData.counterparty || ''}
            onChange={(e) => setFormData((p) => ({ ...p, counterparty: e.target.value }))}
            error={!!errors.counterparty}
            helperText={errors.counterparty}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.categoryId}>
            <InputLabel>{NEW_TRANSACTION_PAGE.categoryLabel}</InputLabel>
            <Select
              value={formData.categoryId || ''}
              label={NEW_TRANSACTION_PAGE.categoryLabel}
              onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
            >
              <MenuItem value="">{NEW_TRANSACTION_PAGE.categoryPlaceholder}</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
            {errors.categoryId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.categoryId}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{NEW_TRANSACTION_PAGE.statusLabel}</InputLabel>
            <Select
              value={formData.status || 'Active'}
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
            value={formData.narration || ''}
            onChange={(e) => setFormData((p) => ({ ...p, narration: e.target.value }))}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? <CircularProgress size={24} /> : NEW_TRANSACTION_PAGE.createButton}
            </Button>
            <Button variant="outlined" onClick={onCancel}>
              {NEW_TRANSACTION_PAGE.cancelButton}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

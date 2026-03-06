'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { type Category } from '../../lib/api';
import { CATEGORIES_PAGE } from '../../constants/categories';

interface CategoryFormDialogProps {
  open: boolean;
  editingCategory: Category | null;
  name: string;
  setName: (value: string) => void;
  error: string | null;
  setError: (value: string | null) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CategoryFormDialog({
  open,
  editingCategory,
  name,
  setName,
  error,
  setError,
  isSubmitting,
  onSubmit,
  onClose,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>
          {editingCategory ? CATEGORIES_PAGE.editDialogTitle : CATEGORIES_PAGE.addDialogTitle}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            label={CATEGORIES_PAGE.nameLabel}
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{CATEGORIES_PAGE.form.cancel}</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {editingCategory
              ? isSubmitting
                ? CATEGORIES_PAGE.form.saving
                : CATEGORIES_PAGE.form.save
              : isSubmitting
                ? CATEGORIES_PAGE.form.adding
                : CATEGORIES_PAGE.form.add}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

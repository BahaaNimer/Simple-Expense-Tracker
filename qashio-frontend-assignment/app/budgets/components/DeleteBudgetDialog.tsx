'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { type Budget } from '../../lib/api';
import { BUDGETS_PAGE } from '../../constants/budgets-page';
import { DIALOG_DEFAULT_LABELS } from '../../constants/messages';

interface DeleteBudgetDialogProps {
  budget: Budget | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteBudgetDialog({
  budget,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteBudgetDialogProps) {
  return (
    <Dialog open={!!budget} onClose={onClose}>
      <DialogTitle>{BUDGETS_PAGE.deleteDialog.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {BUDGETS_PAGE.deleteDialog.confirm(budget?.category?.name)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          {DIALOG_DEFAULT_LABELS.cancel}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isDeleting}>
          {DIALOG_DEFAULT_LABELS.delete}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

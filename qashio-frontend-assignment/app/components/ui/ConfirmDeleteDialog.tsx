'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { DIALOG_DEFAULT_LABELS } from '../../constants/messages';

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  isDeleting?: boolean;
  confirmLabel?: string;
}

export function ConfirmDeleteDialog({
  open,
  title,
  message,
  onConfirm,
  onClose,
  isDeleting = false,
  confirmLabel = DIALOG_DEFAULT_LABELS.delete,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          {DIALOG_DEFAULT_LABELS.cancel}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isDeleting}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

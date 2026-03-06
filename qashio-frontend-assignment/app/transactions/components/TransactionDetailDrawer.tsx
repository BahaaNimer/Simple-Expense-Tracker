'use client';

import { useState } from 'react';
import { Box, Drawer, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery } from '@tanstack/react-query';
import { api, type Transaction } from '../../lib/api';
import { formatAmount, formatDate } from '../../lib/format';
import { DetailRow } from '../../components/ui/DetailRow';
import { EditTransactionDialog } from './EditTransactionDialog';
import { TRANSACTIONS_PAGE } from '../../constants/transactions-page';
import { ARIA_LABELS } from '../../constants/common';

type DetailFieldKey = (typeof TRANSACTIONS_PAGE.detailDrawer.fieldKeys)[number];

function getDetailValue(detail: Transaction, key: DetailFieldKey): string {
  switch (key) {
    case 'date':
      return formatDate(detail.date) || '-';
    case 'reference':
      return detail.reference;
    case 'counterparty':
      return detail.counterparty;
    case 'amount':
      return formatAmount(Number(detail.amount));
    case 'status':
      return detail.status;
    case 'type':
      return detail.type;
    case 'category':
      return detail.category?.name ?? '-';
    case 'narration':
      return detail.narration ?? '-';
    default:
      return '-';
  }
}

interface TransactionDetailDrawerProps {
  transactionId: string | null;
  open: boolean;
  onClose: () => void;
}

export function TransactionDetailDrawer({
  transactionId,
  open,
  onClose,
}: TransactionDetailDrawerProps) {
  const [editOpen, setEditOpen] = useState(false);

  const { data: detail, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => api.transactions.get(transactionId!),
    enabled: !!transactionId && open,
  });

  return (
    <>
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 400 } }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{TRANSACTIONS_PAGE.detailDrawer.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {detail && (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditOpen(true)}
              aria-label={ARIA_LABELS.editTransaction}
            >
              {TRANSACTIONS_PAGE.detailDrawer.editButton}
            </Button>
          )}
          <IconButton onClick={onClose} aria-label={ARIA_LABELS.close}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ px: 2, pb: 2 }}>
        {isLoading ? (
          <CircularProgress />
        ) : detail ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TRANSACTIONS_PAGE.detailDrawer.fieldKeys.map((key) => (
              <DetailRow
                key={key}
                label={TRANSACTIONS_PAGE.detailDrawer.labels[key]}
                value={getDetailValue(detail, key)}
              />
            ))}
          </Box>
        ) : null}
      </Box>
    </Drawer>

    <EditTransactionDialog
      transaction={detail ?? null}
      open={editOpen}
      onClose={() => setEditOpen(false)}
    />
    </>
  );
}

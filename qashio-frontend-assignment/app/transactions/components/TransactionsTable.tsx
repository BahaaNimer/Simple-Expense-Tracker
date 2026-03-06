'use client';

import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Skeleton,
  Alert,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { Transaction } from '../../lib/api';
import { formatAmount, formatDate } from '../../lib/format';
import { StatusChip } from '../../components/ui/StatusChip';
import { TRANSACTION_TABLE_COLUMNS, TRANSACTIONS_PAGE } from '../../constants/transactions-page';
import { BUTTON_LABELS } from '../../constants/common';
import type { SortField, SortOrder } from '../hooks/useTransactionsList';

const TABLE_STYLES = {
  container: {
    overflowX: 'auto' as const,
    border: 'none',
    boxShadow: 'none',
    '& .MuiTableHead-root .MuiTableCell-root': { border: 'none' },
    '& .MuiTableBody-root .MuiTableCell-root': {
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
    },
    '& .MuiTableBody-root .MuiTableRow-root:not(:first-of-type) .MuiTableCell-root': {
      borderTop: '1px solid',
      borderTopColor: 'divider',
    },
  },
};

const COLUMN_COUNT = TRANSACTION_TABLE_COLUMNS.length;

type DataColumnId = 'date' | 'reference' | 'counterparty' | 'amount' | 'status';

function getCellContent(columnId: string, row: Transaction): ReactNode {
  switch (columnId as DataColumnId) {
    case 'date':
      return formatDate(row.date);
    case 'reference':
      return row.reference;
    case 'counterparty':
      return row.counterparty;
    case 'amount':
      return formatAmount(Number(row.amount));
    case 'status':
      return <StatusChip status={row.status} />;
    default:
      return null;
  }
}

interface TransactionsTableProps {
  rows: Transaction[];
  isLoading: boolean;
  error: Error | null;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (column: SortField) => void;
  selectedIds: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: () => void;
  onToggleRow: (id: string) => void;
  onRowClick: (id: string) => void;
  pagination?: { total: number; page: number; limit: number };
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (limit: number) => void;
  onRetry?: () => void;
}

const SortIndicator = ({ active, order }: { active: boolean; order: SortOrder }) =>
  active ? (order === 'asc' ? ' ↑' : ' ↓') : '';

export function TransactionsTable({
  rows,
  isLoading,
  error,
  sortBy,
  sortOrder,
  onSort,
  selectedIds,
  allSelected,
  someSelected,
  onSelectAll,
  onToggleRow,
  onRowClick,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onRetry,
}: TransactionsTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={TABLE_STYLES.container}>
      <Table size="medium" sx={{ borderCollapse: 'collapse' }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.200' }}>
            {TRANSACTION_TABLE_COLUMNS.map((col) =>
              col.id === 'checkbox' ? (
                <TableCell key={col.id} padding="checkbox">
                  <Checkbox
                    indeterminate={someSelected && !allSelected}
                    checked={allSelected}
                    onChange={onSelectAll}
                    disabled={!rows.length}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ color: 'inherit' }}
                  />
                </TableCell>
              ) : (
                <TableCell
                  key={col.id}
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => 'sortField' in col && onSort(col.sortField as SortField)}
                >
                  {col.label}
                  {'sortField' in col && (
                    <SortIndicator active={sortBy === col.sortField} order={sortOrder} />
                  )}
                </TableCell>
              ),
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {TRANSACTION_TABLE_COLUMNS.map((col) => (
                  <TableCell key={col.id}>
                    <Skeleton variant={col.id === 'checkbox' ? 'rectangular' : 'text'} height={24} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} sx={{ py: 3 }}>
                <Alert
                  severity="error"
                  action={
                    onRetry ? (
                      <Button color="inherit" size="small" onClick={onRetry}>
                        {BUTTON_LABELS.retry}
                      </Button>
                    ) : null
                  }
                >
                  <Typography variant="body2" component="span">
                    {error.message || TRANSACTIONS_PAGE.errorMessage}
                  </Typography>
                </Alert>
              </TableCell>
            </TableRow>
          ) : !rows.length ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT}>
                <Typography color="text.secondary" py={4} textAlign="center">
                  {TRANSACTIONS_PAGE.emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onRowClick(row.id)}
              >
                {TRANSACTION_TABLE_COLUMNS.map((col) =>
                  col.id === 'checkbox' ? (
                    <TableCell
                      key={col.id}
                      padding="checkbox"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        size="small"
                        checked={selectedIds.has(row.id)}
                        onChange={() => onToggleRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  ) : (
                    <TableCell key={col.id}>{getCellContent(col.id, row)}</TableCell>
                  ),
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50]}
        />
      )}
    </TableContainer>
  );
}

'use client';

import { ReactNode } from 'react';
import { Box, TableCell, TableRow, Typography, LinearProgress, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { type Budget } from '../../lib/api';
import { formatAmount, formatDate } from '../../lib/format';
import { TABLE_ROW_BORDER_TOP_SX } from '../../constants/ui';
import { BUDGET_TABLE_COLUMNS } from '../../constants/budgets-page';
import { ARIA_LABELS } from '../../constants/common';

interface BudgetTableRowProps {
  budget: Budget;
  usage: { spent: number; remaining: number; percentageUsed: number } | undefined;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

function getCellContent(
  columnId: (typeof BUDGET_TABLE_COLUMNS)[number]['id'],
  budget: Budget,
  usage: BudgetTableRowProps['usage'],
  onEdit: (b: Budget) => void,
  onDelete: (b: Budget) => void,
): ReactNode {
  switch (columnId) {
    case 'category':
      return budget.category?.name ?? '—';
    case 'amount':
      return formatAmount(Number(budget.amount));
    case 'period':
      return budget.period;
    case 'startDate':
      return formatDate(budget.startDate);
    case 'endDate':
      return formatDate(budget.endDate);
    case 'spent':
      return usage != null ? formatAmount(usage.spent) : '—';
    case 'remaining':
      return usage != null ? formatAmount(usage.remaining) : '—';
    case 'usage':
      return usage != null ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(usage.percentageUsed, 100)}
            sx={{ flex: 1, height: 8, borderRadius: 1 }}
            color={usage.percentageUsed > 100 ? 'error' : 'primary'}
          />
          <Typography variant="caption">{Math.round(usage.percentageUsed)}%</Typography>
        </Box>
      ) : (
        '—'
      );
    case 'actions':
      return (
        <>
          <IconButton size="small" onClick={() => onEdit(budget)} aria-label={ARIA_LABELS.editBudget}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(budget)}
            aria-label={ARIA_LABELS.deleteBudget}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      );
    default:
      return null;
  }
}

export function BudgetTableRow({ budget, usage, onEdit, onDelete }: BudgetTableRowProps) {
  return (
    <TableRow sx={TABLE_ROW_BORDER_TOP_SX}>
      {BUDGET_TABLE_COLUMNS.map((col) => (
        <TableCell
          key={col.id}
          sx={{
            border: 'none',
            ...(col.id === 'period' && { textTransform: 'capitalize' }),
            ...('minWidth' in col && col.minWidth != null && { minWidth: col.minWidth }),
          }}
          align={col.align}
        >
          {getCellContent(col.id, budget, usage, onEdit, onDelete)}
        </TableCell>
      ))}
    </TableRow>
  );
}

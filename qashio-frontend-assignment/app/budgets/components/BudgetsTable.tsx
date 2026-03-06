'use client';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { type Budget } from '../../lib/api';
import { BudgetTableRow } from './BudgetTableRow';
import { TABLE_CONTAINER_SX, TABLE_HEAD_ROW_SX, TABLE_CELL_HEAD_SX, LOADING_SPINNER_SIZE } from '../../constants/ui';
import { BUDGET_TABLE_COLUMNS, BUDGETS_PAGE } from '../../constants/budgets-page';

interface BudgetsTableProps {
  budgets: Budget[];
  isLoading: boolean;
  usageMap: Map<string, { spent: number; remaining: number; percentageUsed: number }>;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

const COLUMN_COUNT = BUDGET_TABLE_COLUMNS.length;

export function BudgetsTable({
  budgets,
  isLoading,
  usageMap,
  onEdit,
  onDelete,
}: BudgetsTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={TABLE_CONTAINER_SX}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={TABLE_HEAD_ROW_SX}>
            {BUDGET_TABLE_COLUMNS.map((col) => (
              <TableCell
                key={col.id}
                sx={{
                  ...TABLE_CELL_HEAD_SX,
                  ...('width' in col && col.width != null && { width: col.width }),
                }}
                align={col.align}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} align="center" sx={{ py: 4 }}>
                <CircularProgress size={LOADING_SPINNER_SIZE} />
              </TableCell>
            </TableRow>
          ) : budgets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} sx={{ py: 4, color: 'text.secondary' }}>
                {BUDGETS_PAGE.emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            budgets.map((budget) => (
              <BudgetTableRow
                key={budget.id}
                budget={budget}
                usage={usageMap.get(budget.id)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

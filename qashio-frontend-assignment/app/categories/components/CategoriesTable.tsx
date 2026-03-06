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
import { type Category } from '../../lib/api';
import { CategoryTableRow } from './CategoryTableRow';
import { TABLE_CONTAINER_SX, TABLE_HEAD_ROW_SX, TABLE_CELL_HEAD_SX, LOADING_SPINNER_SIZE } from '../../constants/ui';
import { CATEGORIES_PAGE, CATEGORY_TABLE_COLUMNS } from '../../constants/categories';

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const COLUMN_COUNT = CATEGORY_TABLE_COLUMNS.length;

export function CategoriesTable({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={TABLE_CONTAINER_SX}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={TABLE_HEAD_ROW_SX}>
            {CATEGORY_TABLE_COLUMNS.map((col) => (
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
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} sx={{ py: 4, color: 'text.secondary' }}>
                {CATEGORIES_PAGE.emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            categories.map((cat) => (
              <CategoryTableRow
                key={cat.id}
                category={cat}
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

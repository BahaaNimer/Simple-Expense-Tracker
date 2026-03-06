'use client';

import { ReactNode } from 'react';
import { TableCell, TableRow, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { type Category } from '../../lib/api';
import { TABLE_ROW_BORDER_TOP_SX } from '../../constants/ui';
import { CATEGORIES_PAGE, CATEGORY_TABLE_COLUMNS } from '../../constants/categories';

interface CategoryTableRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function getCellContent(
  columnId: (typeof CATEGORY_TABLE_COLUMNS)[number]['id'],
  category: Category,
  onEdit: (c: Category) => void,
  onDelete: (c: Category) => void,
): ReactNode {
  const txCount = category.transactionCount ?? 0;
  const canDelete = txCount === 0;

  switch (columnId) {
    case 'name':
      return category.name;
    case 'transactions':
      return txCount;
    case 'actions':
      return (
        <>
          <IconButton
            size="small"
            onClick={() => onEdit(category)}
            aria-label={`Edit ${category.name}`}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <Tooltip
            title={
              canDelete
                ? `Delete ${category.name}`
                : CATEGORIES_PAGE.cannotDeleteTooltip(txCount)
            }
          >
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={() => canDelete && onDelete(category)}
                aria-label={
                  canDelete ? `Delete ${category.name}` : `Cannot delete: ${txCount} transactions`
                }
                disabled={!canDelete}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </>
      );
    default:
      return null;
  }
}

export function CategoryTableRow({ category, onEdit, onDelete }: CategoryTableRowProps) {
  return (
    <TableRow sx={TABLE_ROW_BORDER_TOP_SX}>
      {CATEGORY_TABLE_COLUMNS.map((col) => (
        <TableCell key={col.id} sx={{ border: 'none' }} align={col.align}>
          {getCellContent(col.id, category, onEdit, onDelete)}
        </TableCell>
      ))}
    </TableRow>
  );
}

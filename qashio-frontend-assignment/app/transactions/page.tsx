'use client';

import { useState, useCallback } from 'react';
import { Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTransactionsList } from './hooks/useTransactionsList';
import { TransactionsFilters } from './components/TransactionsFilters';
import { TransactionsTable } from './components/TransactionsTable';
import { TransactionDetailDrawer } from './components/TransactionDetailDrawer';
import { ConfirmDeleteDialog } from '../components/ui/ConfirmDeleteDialog';
import { PageContainer } from '../components/ui/PageContainer';
import { TRANSACTIONS_PAGE } from '../constants/transactions-page';

export default function TransactionsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const {
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    referencePrefix,
    setReferencePrefix,
    referencePrefixOptions,
    amountRange,
    setAmountRange,
    categoryFilter,
    setCategoryFilter,
    categoryOptions,
    typeFilter,
    setTypeFilter,
    typeOptions,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    limit,
    setLimit,
    sortBy,
    sortOrder,
    handleSort,
    selectedIds,
    allSelected,
    someSelected,
    handleSelectAll,
    handleToggleRow,
    deleteSelected,
    isDeleting,
    rows,
    data,
    isLoading,
    error,
    refetch,
  } = useTransactionsList();

  const handleRowClick = useCallback((id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedId(null);
  }, []);

  const handleRowsPerPageChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
  }, [setLimit, setPage]);

  const handleDeleteClick = useCallback(() => setDeleteConfirmOpen(true), []);
  const handleDeleteConfirmClose = useCallback(() => setDeleteConfirmOpen(false), []);

  const handleDeleteConfirm = useCallback(() => {
    const ids = Array.from(selectedIds);
    deleteSelected().then(() => {
      if (selectedId && ids.includes(selectedId)) {
        setSelectedId(null);
        setDetailOpen(false);
      }
      setDeleteConfirmOpen(false);
    }).catch(() => {
      setDeleteConfirmOpen(false);
    });
  }, [selectedIds, selectedId, deleteSelected]);

  const numSelected = Array.from(selectedIds).length;

  return (
    <PageContainer>
      <TransactionsFilters
        search={search}
        onSearchChange={setSearch}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        referencePrefix={referencePrefix}
        onReferencePrefixChange={setReferencePrefix}
        referencePrefixOptions={referencePrefixOptions}
        amountRange={amountRange}
        onAmountRangeChange={setAmountRange}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categoryOptions={categoryOptions}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        typeOptions={typeOptions}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {someSelected && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: { xs: 2, sm: 3 }, mb: 2 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {TRANSACTIONS_PAGE.deleteSelectedButton(numSelected)}
          </Button>
        </Box>
      )}

      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title={TRANSACTIONS_PAGE.deleteDialogTitle}
        message={TRANSACTIONS_PAGE.deleteConfirm(numSelected)}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteConfirmClose}
        isDeleting={isDeleting}
      />

      <TransactionsTable
        rows={rows}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        selectedIds={selectedIds}
        allSelected={allSelected}
        someSelected={someSelected}
        onSelectAll={handleSelectAll}
        onToggleRow={handleToggleRow}
        onRowClick={handleRowClick}
        pagination={
          data?.pagination
            ? {
                total: data.pagination.total,
                page,
                limit,
              }
            : undefined
        }
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <TransactionDetailDrawer
        transactionId={selectedId}
        open={detailOpen}
        onClose={handleCloseDetail}
      />
    </PageContainer>
  );
}

'use client';

import AddIcon from '@mui/icons-material/Add';
import { useBudgetsPage } from './hooks/useBudgetsPage';
import { BudgetsTable } from './components/BudgetsTable';
import { BudgetFormDialog } from './components/BudgetFormDialog';
import { DeleteBudgetDialog } from './components/DeleteBudgetDialog';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { BUDGETS_PAGE } from '../constants/budgets-page';

export default function BudgetsPage() {
  const {
    budgets,
    budgetsLoading,
    categories,
    usageMap,
    form,
    setForm,
    error,
    setError,
    dialogOpen,
    editingBudget,
    deleteTarget,
    createMutation,
    updateMutation,
    deleteMutation,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseFormDialog,
    handleSubmit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleCloseDeleteDialog,
  } = useBudgetsPage();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <PageContainer>
      <PageHeader
        title={BUDGETS_PAGE.title}
        action={{
          label: BUDGETS_PAGE.addButton,
          icon: <AddIcon />,
          onClick: handleOpenAdd,
        }}
      />

      <BudgetsTable
        budgets={budgets}
        isLoading={budgetsLoading}
        usageMap={usageMap}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteClick}
      />

      <BudgetFormDialog
        open={dialogOpen}
        editingBudget={editingBudget}
        form={form}
        setForm={setForm}
        categories={categories}
        error={error}
        setError={setError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={handleCloseFormDialog}
      />

      <DeleteBudgetDialog
        budget={deleteTarget}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={handleCloseDeleteDialog}
      />
    </PageContainer>
  );
}

'use client';

import AddIcon from '@mui/icons-material/Add';
import { useCategoriesPage } from './hooks/useCategoriesPage';
import { CategoriesTable } from './components/CategoriesTable';
import { CategoryFormDialog } from './components/CategoryFormDialog';
import { ConfirmDeleteDialog } from '../components/ui/ConfirmDeleteDialog';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { CATEGORIES_PAGE } from '../constants/categories';

export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    name,
    setName,
    error,
    setError,
    dialogOpen,
    editingCategory,
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
  } = useCategoriesPage();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <PageContainer>
      <PageHeader
        title={CATEGORIES_PAGE.title}
        action={{
          label: CATEGORIES_PAGE.addButton,
          icon: <AddIcon />,
          onClick: handleOpenAdd,
        }}
      />

      <CategoriesTable
        categories={categories}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteClick}
      />

      <CategoryFormDialog
        open={dialogOpen}
        editingCategory={editingCategory}
        name={name}
        setName={setName}
        error={error}
        setError={setError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={handleCloseFormDialog}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title={CATEGORIES_PAGE.deleteDialogTitle}
        message={
          deleteTarget
            ? CATEGORIES_PAGE.deleteConfirm(deleteTarget.name)
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onClose={handleCloseDeleteDialog}
        isDeleting={deleteMutation.isPending}
      />
    </PageContainer>
  );
}

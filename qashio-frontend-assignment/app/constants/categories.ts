export const CATEGORIES_PAGE = {
  title: 'Categories',
  addButton: 'Add Category',
  addDialogTitle: 'Add Category',
  editDialogTitle: 'Edit Category',
  deleteDialogTitle: 'Delete category',
  nameLabel: 'Name',
  emptyMessage: 'No categories yet. Add one to get started.',
  deleteConfirm: (name: string) =>
    `Are you sure you want to delete "${name}"? This cannot be undone.`,
  cannotDeleteTooltip: (count: number) =>
    `Category has ${count} transaction(s). Remove or reassign them before deleting.`,
  transactionsColumn: 'Transactions',
  actionsColumn: 'Actions',
  form: {
    cancel: 'Cancel',
    save: 'Save',
    add: 'Add',
    saving: 'Saving…',
    adding: 'Adding…',
  },
} as const;

export const CATEGORY_TABLE_COLUMNS = [
  { id: 'name', label: CATEGORIES_PAGE.nameLabel, align: 'left' as const },
  { id: 'transactions', label: CATEGORIES_PAGE.transactionsColumn, align: 'right' as const },
  { id: 'actions', label: CATEGORIES_PAGE.actionsColumn, align: 'right' as const, width: 100 },
] as const;

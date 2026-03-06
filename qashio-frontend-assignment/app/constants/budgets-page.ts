export const BUDGETS_PAGE = {
  title: 'Budgets',
  addButton: 'Add Budget',
  editBudgetTitle: 'Edit Budget',
  addBudgetTitle: 'Add Budget',
  emptyMessage: 'No budgets yet. Add one to track spending by category.',
  form: {
    categoryLabel: 'Category',
    amountLabel: 'Amount (AED)',
    periodLabel: 'Period',
    startDateLabel: 'Start date',
    endDateLabel: 'End date',
  },
  deleteDialog: {
    title: 'Delete budget',
    confirm: (categoryName?: string) =>
      `Are you sure you want to delete this budget${categoryName ? ` for ${categoryName}` : ''}? This cannot be undone.`,
  },
} as const;

export const BUDGET_TABLE_COLUMNS = [
  { id: 'category', label: 'Category', align: 'left' as const },
  { id: 'amount', label: 'Amount', align: 'right' as const },
  { id: 'period', label: 'Period', align: 'left' as const },
  { id: 'startDate', label: 'Start', align: 'left' as const },
  { id: 'endDate', label: 'End', align: 'left' as const },
  { id: 'spent', label: 'Spent', align: 'right' as const },
  { id: 'remaining', label: 'Remaining', align: 'right' as const },
  { id: 'usage', label: 'Usage', align: 'left' as const, minWidth: 120 },
  { id: 'actions', label: 'Actions', align: 'right' as const, width: 100 },
] as const;

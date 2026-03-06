export const TRANSACTIONS_PAGE = {
  deleteDialogTitle: 'Delete transactions',
  deleteConfirm: (count: number) =>
    `Are you sure you want to delete ${count} transaction${count !== 1 ? 's' : ''}? This cannot be undone.`,
  deleteSelectedButton: (count: number) => `Delete selected (${count})`,
  emptyMessage: 'No transactions found',
  errorMessage: 'Failed to load transactions. Make sure the API is running (see README).',
  detailDrawer: {
    title: 'Transaction Details',
    editButton: 'Edit',
    labels: {
      date: 'Date',
      reference: 'Reference',
      counterparty: 'Counterparty',
      amount: 'Amount',
      status: 'Status',
      type: 'Type',
      category: 'Category',
      narration: 'Narration',
    },
    /** Field keys in display order; labels from detailDrawer.labels */
    fieldKeys: [
      'date',
      'reference',
      'counterparty',
      'amount',
      'status',
      'type',
      'category',
      'narration',
    ] as const,
  },
  filters: {
    date: 'Date',
    reference: 'Reference',
    amount: 'Amount',
    category: 'Category',
    type: 'Type',
    status: 'Status',
  },
  /** Filter ids in display order; used to loop FilterSelect in TransactionsFilters */
  filterIds: [
    { id: 'date', minWidth: undefined },
    { id: 'reference', minWidth: undefined },
    { id: 'amount', minWidth: undefined },
    { id: 'category', minWidth: 160 },
    { id: 'type', minWidth: undefined },
    { id: 'status', minWidth: undefined },
  ] as const,
  editDialog: {
    title: 'Edit Transaction',
    referenceHelper: 'Format: XXXX-XXXX (e.g. ABCD-1234)',
    selectCategory: 'Select a category',
  },
} as const;

export const TRANSACTION_TABLE_COLUMNS = [
  { id: 'checkbox', label: '' },
  { id: 'date', label: 'Date', sortField: 'date' as const },
  { id: 'reference', label: 'Reference', sortField: 'reference' as const },
  { id: 'counterparty', label: 'Counterparty', sortField: 'counterparty' as const },
  { id: 'amount', label: 'Amount', sortField: 'amount' as const },
  { id: 'status', label: 'Status', sortField: 'status' as const },
] as const;

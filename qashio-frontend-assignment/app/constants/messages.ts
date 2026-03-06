export const MESSAGES = {
  cannotBeUndone: 'This cannot be undone.',
  nameRequired: 'Name is required',
  categoryAndDatesRequired: 'Category and dates are required',
  amountMustBePositive: 'Amount must be positive',
} as const;

export const SNACKBAR = {
  categoryCreated: 'Category created successfully.',
  categoryUpdated: 'Category updated successfully.',
  categoryDeleted: 'Category deleted successfully.',
  budgetCreated: 'Budget created successfully.',
  budgetUpdated: 'Budget updated successfully.',
  budgetDeleted: 'Budget deleted successfully.',
  transactionCreated: 'Transaction created successfully.',
  transactionUpdated: 'Transaction updated successfully.',
  signedIn: 'Signed in successfully.',
  signedUp: 'Account created. You are signed in.',
  signUpFailed: 'Sign up failed',
  signInFailed: 'Sign in failed',
} as const;

export const DIALOG_DEFAULT_LABELS = {
  cancel: 'Cancel',
  delete: 'Delete',
} as const;

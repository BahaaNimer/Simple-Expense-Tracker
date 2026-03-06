export const FILTER_ALL = 'all';

export const REFERENCE_PATTERN = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;
export const REFERENCE_FORMAT_LABEL = 'XXXX-XXXX (e.g. ABCD-1234)';

export function formatReferenceInput(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8);
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
}

export const STATUS_CONFIG: Record<
  string,
  { bgColor: string; textColor: string }
> = {
  Active: { bgColor: 'rgba(46, 125, 50, 0.12)', textColor: '#2e7d32' },
  Inactive: { bgColor: 'rgba(97, 97, 97, 0.12)', textColor: '#616161' },
  Completed: { bgColor: 'rgba(2, 119, 189, 0.12)', textColor: '#0277bd' },
  Pending: { bgColor: 'rgba(245, 124, 0, 0.12)', textColor: '#f57c00' },
  Failed: { bgColor: 'rgba(211, 47, 47, 0.12)', textColor: '#d32f2f' },
};

export const STATUS_OPTIONS = [
  'Active',
  'Inactive',
  'Completed',
  'Pending',
  'Failed',
] as const;

export const TYPE_OPTIONS = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
] as const;

export const AMOUNT_RANGE_OPTIONS = [
  { value: '0-100', label: '0 - 100' },
  { value: '101-500', label: '101 - 500' },
  { value: '501-1000', label: '501 - 1,000' },
  { value: '1000+', label: '1,000+' },
] as const;

export type AmountRangeValue = (typeof AMOUNT_RANGE_OPTIONS)[number]['value'];

export const DATE_FILTER_OPTIONS = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

export const STATUS_FILTER_OPTIONS = STATUS_OPTIONS.map((s) => ({ value: s, label: s }));

export function amountRangeToMinMax(
  value: string
): { minAmount?: number; maxAmount?: number } {
  if (value === FILTER_ALL || !value) return {};
  if (value === '0-100') return { minAmount: 0, maxAmount: 100 };
  if (value === '101-500') return { minAmount: 101, maxAmount: 500 };
  if (value === '501-1000') return { minAmount: 501, maxAmount: 1000 };
  if (value === '1000+') return { minAmount: 1000 };
  return {};
}

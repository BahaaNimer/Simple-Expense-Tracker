import { format as dateFnsFormat } from 'date-fns';

function roundTo2Decimals(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function formatAmount(amount: number): string {
  return (
    new Intl.NumberFormat('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundTo2Decimals(amount)) + ' AED'
  );
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(d, 'dd MMM yyyy');
}

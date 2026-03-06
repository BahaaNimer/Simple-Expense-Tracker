/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import { AuthProvider } from '../../contexts/AuthContext';
import BudgetsPage from '../page';
import { BUDGETS_PAGE } from '../../constants/budgets-page';

jest.mock('../../lib/api', () => {
  const actual =
    jest.requireActual<typeof import('../../lib/api')>('../../lib/api');
  return {
    ...actual,
    api: {
      ...actual.api,
      budgets: {
        list: () =>
          Promise.resolve([
            {
              id: 'b1',
              amount: 500,
              period: 'monthly',
              categoryId: 'c1',
              startDate: '2025-01-01',
              endDate: '2025-01-31',
              category: { id: 'c1', name: 'Utilities' },
            },
          ]),
        getUsage: () =>
          Promise.resolve({ spent: 100, remaining: 400, percentageUsed: 20 }),
      },
      categories: { list: () => Promise.resolve([{ id: 'c1', name: 'Utilities' }]) },
    },
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider>
          <AuthProvider>{children}</AuthProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

describe('BudgetsPage', () => {
  it('renders page title', () => {
    render(<BudgetsPage />, { wrapper: createWrapper() });
    expect(screen.getByText(BUDGETS_PAGE.title)).toBeInTheDocument();
  });

  it('renders Add Budget button', () => {
    render(<BudgetsPage />, { wrapper: createWrapper() });
    expect(
      screen.getByRole('button', { name: BUDGETS_PAGE.addButton }),
    ).toBeInTheDocument();
  });

  it('renders budget table with category column', async () => {
    render(<BudgetsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Utilities')).toBeInTheDocument();
    });
  });

  it('renders table header for Amount', async () => {
    render(<BudgetsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: /amount/i })).toBeInTheDocument();
    });
  });
});

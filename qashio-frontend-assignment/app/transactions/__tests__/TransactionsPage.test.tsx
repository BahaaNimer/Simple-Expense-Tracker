/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import { AuthProvider } from '../../contexts/AuthContext';
import TransactionsPage from '../page';

jest.mock('../../lib/api', () => {
  const actual = jest.requireActual<typeof import('../../lib/api')>('../../lib/api');
  return {
    ...actual,
    api: {
      ...actual.api,
      transactions: {
        list: () => Promise.resolve({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
        referencePrefixes: () => Promise.resolve([]),
      },
      categories: { list: () => Promise.resolve([]) },
    },
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <AuthProvider>{children}</AuthProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
};

describe('TransactionsPage', () => {
  it('renders transactions table column headers', async () => {
    render(<TransactionsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: /date/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('columnheader', { name: /reference/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /counterparty/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /amount/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<TransactionsPage />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});

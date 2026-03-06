/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import { AuthProvider } from '../../contexts/AuthContext';
import CategoriesPage from '../page';
import { CATEGORIES_PAGE } from '../../constants/categories';

jest.mock('../../lib/api', () => {
  const actual =
    jest.requireActual<typeof import('../../lib/api')>('../../lib/api');
  return {
    ...actual,
    api: {
      ...actual.api,
      categories: {
        list: () =>
          Promise.resolve([
            { id: '1', name: 'Utilities', transactionCount: 2 },
            { id: '2', name: 'Software', transactionCount: 0 },
          ]),
      },
    },
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <AuthProvider>{children}</AuthProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
};

describe('CategoriesPage', () => {
  it('renders page title', () => {
    render(<CategoriesPage />, { wrapper: createWrapper() });
    expect(screen.getByText(CATEGORIES_PAGE.title)).toBeInTheDocument();
  });

  it('renders Add Category button', () => {
    render(<CategoriesPage />, { wrapper: createWrapper() });
    expect(
      screen.getByRole('button', { name: CATEGORIES_PAGE.addButton }),
    ).toBeInTheDocument();
  });

  it('renders categories table headers', async () => {
    render(<CategoriesPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText(CATEGORIES_PAGE.nameLabel)).toBeInTheDocument();
    });
    expect(
      screen.getByText(CATEGORIES_PAGE.transactionsColumn),
    ).toBeInTheDocument();
    expect(
      screen.getByText(CATEGORIES_PAGE.actionsColumn),
    ).toBeInTheDocument();
  });

  it('renders category names from api', async () => {
    render(<CategoriesPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Utilities')).toBeInTheDocument();
    });
    expect(screen.getByText('Software')).toBeInTheDocument();
  });
});

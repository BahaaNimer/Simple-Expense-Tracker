import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from '../../../contexts/SnackbarContext';
import { AuthProvider } from '../../../contexts/AuthContext';
import NewTransactionPage from '../page';

// Mock only categories list so form renders (no loading spinner); keep rest of api and fetcher
jest.mock('../../../lib/api', () => {
  const actual = jest.requireActual<typeof import('../../../lib/api')>('../../../lib/api');
  return {
    ...actual,
    api: {
      ...actual.api,
      categories: { list: () => Promise.resolve([{ id: '1', name: 'Utilities' }]) },
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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider>
          <AuthProvider>{children}</AuthProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

describe('NewTransactionPage', () => {
  it('renders new transaction form title', async () => {
    render(<NewTransactionPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('New Transaction')).toBeInTheDocument();
    });
  });

  it('renders amount field after load', async () => {
    render(<NewTransactionPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });
  });

  it('renders category dropdown', async () => {
    render(<NewTransactionPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getAllByText(/category/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders type selector', async () => {
    render(<NewTransactionPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getAllByText(/type/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders create button', async () => {
    render(<NewTransactionPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });
});

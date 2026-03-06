/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SignInPage from '../page';
import { AUTH_PAGES } from '../../constants/auth-pages';

const signInConfig = AUTH_PAGES.signIn;
const mockLogin = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: mockLogin,
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('../../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
  });

  it('renders sign in title and form', () => {
    render(<SignInPage />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders link to sign up', () => {
    render(<SignInPage />);
    expect(screen.getByText(signInConfig.linkPrompt)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: signInConfig.linkLabel });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', signInConfig.linkHref);
  });

  it('shows validation error when email is empty', async () => {
    render(<SignInPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Email is required'))).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    render(<SignInPage />);
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Invalid email'))).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login with trimmed lowercased email on valid submit', async () => {
    render(<SignInPage />);
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: '  User@Example.COM  ' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password');
    });
    expect(mockShowSuccess).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/transactions');
  });
});

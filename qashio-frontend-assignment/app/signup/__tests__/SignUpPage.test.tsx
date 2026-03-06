/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SignUpPage from '../page';
import { AUTH_PAGES } from '../../constants/auth-pages';

const signUpConfig = AUTH_PAGES.signUp;
const mockRegister = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: jest.fn(),
    register: mockRegister,
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

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockResolvedValue(undefined);
  });

  it('renders sign up title and form', () => {
    render(<SignUpPage />);
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders link to sign in', () => {
    render(<SignUpPage />);
    expect(screen.getByText(signUpConfig.linkPrompt)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: signUpConfig.linkLabel });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', signUpConfig.linkHref);
  });

  it('shows validation error when email is empty', async () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'SecurePass1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Email is required'))).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'SecurePass1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Invalid email'))).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register with trimmed lowercased email on valid submit', async () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: '  User@Example.COM  ' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'SecurePass1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('user@example.com', 'SecurePass1!');
    });
    expect(mockShowSuccess).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/transactions');
  });
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options?.headers as Record<string, string>) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${API_URL}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.statusCode || 'Request failed');
  }
  return res.json();
}

export interface AuthUser {
  id: string;
  email: string;
}
export interface AuthResponse {
  user: AuthUser;
  access_token: string;
}

export const api = {
  auth: {
    register: (data: { email: string; password: string }) =>
      fetcher<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      fetcher<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  transactions: {
    list: (params?: Record<string, string | number>) => {
      const search = params
        ? '?' + new URLSearchParams(
            Object.fromEntries(
              Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, String(v)])
            )
          ).toString()
        : '';
      return fetcher<{ data: Transaction[]; pagination: Pagination }>('/transactions' + search);
    },
    get: (id: string) => fetcher<Transaction>(`/transactions/${id}`),
    create: (data: CreateTransactionInput) =>
      fetcher<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateTransactionInput>) =>
      fetcher<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetcher<{ deleted: boolean }>(`/transactions/${id}`, { method: 'DELETE' }),
    summary: (startDate?: string, endDate?: string) =>
      fetcher<SummaryReport>(`/transactions/summary/report?startDate=${startDate || ''}&endDate=${endDate || ''}`),
    referencePrefixes: () => fetcher<string[]>('/transactions/options/reference-prefixes'),
  },
  categories: {
    list: () => fetcher<Category[]>('/categories'),
    create: (data: { name: string }) =>
      fetcher<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string }) =>
      fetcher<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetcher<{ deleted: boolean }>(`/categories/${id}`, { method: 'DELETE' }),
  },
  budgets: {
    list: () => fetcher<Budget[]>('/budgets'),
    create: (data: CreateBudgetInput) =>
      fetcher<Budget>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateBudgetInput>) =>
      fetcher<Budget>(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetcher<{ deleted: boolean }>(`/budgets/${id}`, { method: 'DELETE' }),
    getUsage: (id: string) => fetcher<BudgetUsage | null>(`/budgets/${id}/usage`),
  },
};

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  reference: string;
  counterparty: string;
  status: string;
  narration?: string;
  categoryId: string;
  category?: Category;
}

export interface CreateTransactionInput {
  amount: number;
  date: string;
  type: 'income' | 'expense';
  reference: string;
  counterparty: string;
  status?: string;
  narration?: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  transactionCount?: number;
}

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  id: string;
  amount: number;
  period: BudgetPeriod;
  categoryId: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
  category?: Category;
}

export interface CreateBudgetInput {
  amount: number;
  period: BudgetPeriod;
  categoryId: string;
  startDate: string;
  endDate: string;
}

export interface BudgetUsage {
  budget: Budget;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SummaryReport {
  totalIncome: number;
  totalExpense: number;
  net: number;
  startDate: string;
  endDate: string;
}

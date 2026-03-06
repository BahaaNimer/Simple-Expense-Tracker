import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const BRAND_LABEL = 'Qashio';

export const HEADER = {
  newTransactionButton: 'New Transaction',
} as const;

export const SIDEBAR = {
  signOut: 'Sign out',
} as const;

export const NAV_ITEMS = [
  { href: '/transactions', label: 'Transactions', icon: AccountBalanceIcon },
  { href: '/categories', label: 'Categories', icon: CategoryIcon },
  { href: '/budgets', label: 'Budgets', icon: AccountBalanceWalletIcon },
] as const;

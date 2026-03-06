'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface SnackbarContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

interface SnackbarProviderProps {
  children: ReactNode;
  autoHideDuration?: number;
}

export function SnackbarProvider({
  children,
  autoHideDuration = 6000,
}: SnackbarProviderProps) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSuccess = useCallback((message: string) => {
    setState({ open: true, message, severity: 'success' });
  }, []);

  const showError = useCallback((message: string) => {
    setState({ open: true, message, severity: 'error' });
  }, []);

  const handleClose = useCallback(
    (_?: unknown, reason?: string) => {
      if (reason === 'clickaway') return;
      setState((prev) => ({ ...prev, open: false }));
    },
    [],
  );

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => handleClose()}
          severity={state.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

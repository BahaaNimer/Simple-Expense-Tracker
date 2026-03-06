'use client';

import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, Link } from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { z } from 'zod';
import { AUTH_PAGES } from '../constants/auth-pages';
import { SNACKBAR } from '../constants/messages';
import { AUTH_FORM_MAX_WIDTH, AUTH_FORM_PAPER_PADDING } from '../constants/ui';

const signInConfig = AUTH_PAGES.signIn;
const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function SignInPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const snackbar = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) router.replace('/transactions');
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join('. '));
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      snackbar.showSuccess(SNACKBAR.signedIn);
      router.push('/transactions');
    } catch (err) {
      const message = err instanceof Error ? err.message : SNACKBAR.signInFailed;
      setError(message);
      snackbar.showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) return null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: AUTH_FORM_MAX_WIDTH, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {signInConfig.title}
      </Typography>
      <Paper variant="outlined" sx={{ p: AUTH_FORM_PAPER_PADDING, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label={signInConfig.emailLabel}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={signInConfig.passwordLabel}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : signInConfig.submitLabel}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
              {signInConfig.linkPrompt}{' '}
              <Link component={NextLink} href={signInConfig.linkHref} sx={{ fontWeight: 600 }}>
                {signInConfig.linkLabel}
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, Link, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENT_ITEMS } from '../constants/auth';
import { AUTH_PAGES } from '../constants/auth-pages';
import { SNACKBAR } from '../constants/messages';
import { AUTH_FORM_MAX_WIDTH, AUTH_FORM_PAPER_PADDING } from '../constants/ui';
import { getPasswordRequirements } from '../lib/password';

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `At least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[0-9]/, 'At least one number')
  .regex(/[^A-Za-z0-9]/, 'At least one special character');

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: passwordSchema,
});

export default function SignUpPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, register } = useAuth();
  const snackbar = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const requirements = useMemo(
    () => getPasswordRequirements(password, PASSWORD_MIN_LENGTH),
    [password]
  );
  const requirementItems = useMemo(
    () =>
      PASSWORD_REQUIREMENT_ITEMS.map(({ key, label }) => ({
        met: requirements[key as keyof typeof requirements],
        label,
      })),
    [requirements]
  );

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
      await register(email, password);
      snackbar.showSuccess(SNACKBAR.signedUp);
      router.push('/transactions');
    } catch (err) {
      const message = err instanceof Error ? err.message : SNACKBAR.signUpFailed;
      setError(message);
      snackbar.showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) return null;

  const signUpConfig = AUTH_PAGES.signUp;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: AUTH_FORM_MAX_WIDTH, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {signUpConfig.title}
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
            label={signUpConfig.emailLabel}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={signUpConfig.passwordLabel}
            type="password"
            autoComplete="new-password"
            placeholder={AUTH_PAGES.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <List dense disablePadding sx={{ mt: 0.5, mb: 1 }}>
            {requirementItems.map(({ met, label }) => (
              <ListItem key={label} disablePadding sx={{ py: 0, minHeight: 32 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {met ? (
                    <CheckCircleOutlineIcon fontSize="small" color="success" />
                  ) : (
                    <RadioButtonUncheckedIcon fontSize="small" sx={{ color: 'action.disabled' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: met ? 'text.secondary' : 'text.disabled',
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : signUpConfig.submitLabel}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
              {signUpConfig.linkPrompt}{' '}
              <Link component={NextLink} href={signUpConfig.linkHref} sx={{ fontWeight: 600 }}>
                {signUpConfig.linkLabel}
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

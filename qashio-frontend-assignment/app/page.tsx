'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { HOME_PAGE } from './constants/home';
import { LAYOUT } from './theme/layout';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace('/transactions');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: LAYOUT.background,
        }}
      >
        <Typography color="text.secondary">{HOME_PAGE.loading}</Typography>
      </Box>
    );
  }

  if (user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: LAYOUT.background,
        px: 2,
      }}
    >
      <AccountBalanceIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
        {HOME_PAGE.welcomeTitle}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 400, textAlign: 'center' }}
      >
        {HOME_PAGE.welcomeDescription}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button component={Link} href="/signin" variant="contained" size="large">
          {HOME_PAGE.signIn}
        </Button>
        <Button component={Link} href="/signup" variant="outlined" size="large">
          {HOME_PAGE.signUp}
        </Button>
      </Box>
    </Box>
  );
}

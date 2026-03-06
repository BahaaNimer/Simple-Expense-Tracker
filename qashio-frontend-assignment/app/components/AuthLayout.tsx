'use client';

import { Box, Typography } from '@mui/material';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="header"
        sx={{
          py: 2,
          px: { xs: 2, sm: 3 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          component={Link}
          href="/"
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': { color: 'primary.dark' },
          }}
        >
          Qashio
        </Typography>
      </Box>
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}

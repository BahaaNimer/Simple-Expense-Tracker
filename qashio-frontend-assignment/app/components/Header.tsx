'use client';

import { Box, Button, IconButton } from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import { useLayout } from '../contexts/LayoutContext';
import { LAYOUT } from '../theme/layout';
import { HEADER } from '../constants/navigation';
import { ARIA_LABELS } from '../constants/common';

export default function Header() {
  const { openMobileMenu } = useLayout();

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'space-between', sm: 'flex-end' },
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 },
        bgcolor: LAYOUT.contentBackground,
        borderBottom: LAYOUT.header.borderBottom,
      }}
    >
      <IconButton
        aria-label={ARIA_LABELS.openMenu}
        onClick={openMobileMenu}
        sx={{ mr: 1, display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      <Button
        component={Link}
        href="/transactions/new"
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        sx={{
          borderColor: '#ccc',
          color: '#333',
          textTransform: 'none',
          '&:hover': {
            borderColor: '#999',
            bgcolor: 'rgba(0,0,0,0.04)',
          },
        }}
      >
        {HEADER.newTransactionButton}
      </Button>
    </Box>
  );
}

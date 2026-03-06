'use client';

import { Box, Drawer } from '@mui/material';
import { ReactNode } from 'react';
import { LayoutProvider, useLayout } from '../contexts/LayoutContext';
import Sidebar from './Sidebar';
import SidebarContent from './SidebarContent';
import { LAYOUT } from '../theme/layout';

function MobileDrawer() {
  const { mobileMenuOpen, closeMobileMenu } = useLayout();

  return (
    <Drawer
      variant="temporary"
      open={mobileMenuOpen}
      onClose={closeMobileMenu}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { sm: 'none' },
        '& .MuiDrawer-paper': {
          width: LAYOUT.sidebar.widthMobile,
          boxSizing: 'border-box',
          bgcolor: LAYOUT.background,
          borderRight: 0,
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}

function PageLayoutInner({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: LAYOUT.background,
      }}
    >
      <Sidebar />
      <MobileDrawer />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutProvider>
      <PageLayoutInner>{children}</PageLayoutInner>
    </LayoutProvider>
  );
}

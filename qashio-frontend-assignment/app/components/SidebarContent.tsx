'use client';

import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';
import { LAYOUT } from '../theme/layout';
import { useLayout } from '../contexts/LayoutContext';
import { useAuth } from '../contexts/AuthContext';
import { BRAND_LABEL, NAV_ITEMS, SIDEBAR } from '../constants/navigation';

export default function SidebarContent() {
  const pathname = usePathname();
  const { closeMobileMenu } = useLayout();
  const { user, logout } = useAuth();

  return (
    <>
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '2rem', md: '2.25rem' },
          px: 2,
          pt: 2,
          pb: 1.5,
          color: '#333',
        }}
      >
        {BRAND_LABEL}
      </Typography>
      <Box sx={{ px: 1.5, pb: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              fullWidth
              onClick={closeMobileMenu}
              startIcon={<Icon />}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: '0.8rem',
                px: 2,
                py: 1,
                textTransform: 'none',
                fontSize: '0.7rem',
                fontWeight: 500,
                color: isActive ? LAYOUT.sidebar.navActiveColor : LAYOUT.sidebar.navInactiveColor,
                bgcolor: isActive ? LAYOUT.sidebar.navActiveBg : 'transparent',
                '&:hover': {
                  bgcolor: isActive
                    ? LAYOUT.sidebar.navActiveBgHover
                    : 'rgba(0,0,0,0.05)',
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
        {user && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ px: 2, display: 'block', color: 'text.secondary' }}>
              {user.email}
            </Typography>
            <Button
              fullWidth
              onClick={() => { logout(); closeMobileMenu(); }}
              startIcon={<LogoutIcon />}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: '0.8rem',
                px: 2,
                py: 1,
                textTransform: 'none',
                fontSize: '0.7rem',
                color: LAYOUT.sidebar.navInactiveColor,
              }}
            >
              {SIDEBAR.signOut}
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}

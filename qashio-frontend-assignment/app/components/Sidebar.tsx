'use client';

import { Box } from '@mui/material';
import SidebarContent from './SidebarContent';
import { LAYOUT } from '../theme/layout';

export default function Sidebar() {
  return (
    <Box
      component="nav"
      sx={{
        width: LAYOUT.sidebar.width,
        flexShrink: 0,
        bgcolor: LAYOUT.contentBackground,
        display: { xs: 'none', sm: 'block' },
        py: 0,
        overflow: 'auto',
        borderRight: LAYOUT.sidebar.BorderRight,
      }}
    >
      <SidebarContent />
    </Box>
  );
}

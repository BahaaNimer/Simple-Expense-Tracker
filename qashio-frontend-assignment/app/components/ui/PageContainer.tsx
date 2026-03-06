'use client';

import { Box } from '@mui/material';
import { PAGE_CONTAINER_SX } from '../../constants/ui';

interface PageContainerProps {
  children: React.ReactNode;
  sx?: object;
}

export function PageContainer({ children, sx }: PageContainerProps) {
  return <Box sx={{ ...PAGE_CONTAINER_SX, ...sx }}>{children}</Box>;
}

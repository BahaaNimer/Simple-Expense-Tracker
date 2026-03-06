'use client';

import { Chip } from '@mui/material';
import { STATUS_CONFIG } from '../../constants/transactions';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

const DEFAULT_CONFIG = { bgColor: 'rgba(0,0,0,0.08)', textColor: '#616161' };

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;
  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: config.bgColor,
        color: config.textColor,
        fontWeight: 500,
      }}
    />
  );
}

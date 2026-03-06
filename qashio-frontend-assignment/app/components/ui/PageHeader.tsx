'use client';

import { Box, Button, Typography } from '@mui/material';
import { PAGE_HEADER_SX, ADD_BUTTON_SX } from '../../constants/ui';

interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  };
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <Box sx={PAGE_HEADER_SX}>
      <Typography variant="h5" fontWeight={600}>
        {title}
      </Typography>
      {action && (
        <Button
          variant="outlined"
          size="small"
          startIcon={action.icon}
          onClick={action.onClick}
          disabled={action.disabled}
          sx={ADD_BUTTON_SX}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}

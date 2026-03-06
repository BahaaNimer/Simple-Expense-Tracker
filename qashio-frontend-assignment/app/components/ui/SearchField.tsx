'use client';

import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { SEARCH_PLACEHOLDER } from '../../constants/common';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'small' | 'medium';
  minWidth?: number | string | object;
}

export function SearchField({
  value,
  onChange,
  placeholder = SEARCH_PLACEHOLDER,
  size = 'small',
  minWidth = 200,
}: SearchFieldProps) {
  return (
    <TextField
      placeholder={placeholder}
      size={size}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}

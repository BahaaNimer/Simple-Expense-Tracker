'use client';

import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { FILTER_ALL } from '../../constants/transactions';

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

interface FilterSelectProps<T extends string = string> {
  label: string;
  labelId: string;
  value: string;
  options: FilterOption<T>[];
  onChange: (value: string) => void;
  minWidth?: number;
}

export function FilterSelect<T extends string = string>({
  label,
  labelId,
  value,
  options,
  onChange,
  minWidth = 80,
}: FilterSelectProps<T>) {
  const handleChange = (e: SelectChangeEvent<string>) => onChange(e.target.value);

  return (
    <FormControl size="small" sx={{ minWidth }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={handleChange}
      >
        <MenuItem value={FILTER_ALL}>All</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

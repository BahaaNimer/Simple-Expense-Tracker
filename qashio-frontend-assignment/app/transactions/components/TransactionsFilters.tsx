'use client';

import { Box } from '@mui/material';
import { SearchField } from '../../components/ui/SearchField';
import { FilterSelect } from '../../components/ui/FilterSelect';
import {
  AMOUNT_RANGE_OPTIONS,
  DATE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../../constants/transactions';
import { TRANSACTIONS_PAGE } from '../../constants/transactions-page';
import type { FilterOption } from '../../components/ui/FilterSelect';

const FILTER_LABELS = TRANSACTIONS_PAGE.filters;
const FILTER_IDS = TRANSACTIONS_PAGE.filterIds;

interface TransactionsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  referencePrefix: string;
  onReferencePrefixChange: (value: string) => void;
  referencePrefixOptions: FilterOption<string>[];
  amountRange: string;
  onAmountRangeChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryOptions: FilterOption<string>[];
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  typeOptions: FilterOption<string>[];
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

type FilterId = (typeof FILTER_IDS)[number]['id'];

function getFilterProps(
  id: FilterId,
  props: TransactionsFiltersProps,
): { value: string; options: FilterOption<string>[]; onChange: (value: string) => void } {
  switch (id) {
    case 'date':
      return {
        value: props.dateFilter,
        options: DATE_FILTER_OPTIONS,
        onChange: props.onDateFilterChange,
      };
    case 'reference':
      return {
        value: props.referencePrefix,
        options: props.referencePrefixOptions,
        onChange: props.onReferencePrefixChange,
      };
    case 'amount':
      return {
        value: props.amountRange,
        options: [...AMOUNT_RANGE_OPTIONS],
        onChange: props.onAmountRangeChange,
      };
    case 'category':
      return {
        value: props.categoryFilter,
        options: props.categoryOptions,
        onChange: props.onCategoryFilterChange,
      };
    case 'type':
      return {
        value: props.typeFilter,
        options: props.typeOptions,
        onChange: props.onTypeFilterChange,
      };
    case 'status':
      return {
        value: props.statusFilter,
        options: STATUS_FILTER_OPTIONS,
        onChange: props.onStatusFilterChange,
      };
    default:
      return { value: '', options: [], onChange: () => {} };
  }
}

export function TransactionsFilters(props: TransactionsFiltersProps) {
  const { search, onSearchChange } = props;
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', pl: { xs: 2, sm: 3 }, alignItems: 'flex-end' }}>
      <SearchField value={search} onChange={onSearchChange} />
      {FILTER_IDS.map(({ id, minWidth }) => {
        const { value, options, onChange } = getFilterProps(id, props);
        return (
          <FilterSelect
            key={id}
            labelId={`filter-${id}`}
            label={FILTER_LABELS[id]}
            value={value}
            options={options}
            onChange={onChange}
            minWidth={minWidth}
          />
        );
      })}
    </Box>
  );
}

export const ADD_BUTTON_SX = {
  borderColor: '#ccc',
  color: '#333',
  textTransform: 'none' as const,
  '&:hover': { borderColor: '#999', bgcolor: 'rgba(0,0,0,0.04)' },
};

export const PAGE_CONTAINER_SX = {
  bgcolor: 'background.paper',
  flex: 1,
  p: { xs: 2, sm: 3 },
};

export const PAGE_HEADER_SX = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 3,
};

export const TABLE_CONTAINER_SX = {
  border: 'none',
  boxShadow: 'none',
  overflowX: 'auto' as const,
};

export const TABLE_HEAD_ROW_SX = { backgroundColor: 'grey.200' };

export const TABLE_CELL_HEAD_SX = { border: 'none', fontWeight: 600 };

export const TABLE_ROW_BORDER_TOP_SX = {
  '&:not(:first-of-type) .MuiTableCell-root': {
    borderTop: '1px solid',
    borderTopColor: 'divider',
  },
};

export const LOADING_SPINNER_SIZE = 24;

export const AUTH_FORM_MAX_WIDTH = 400;
export const AUTH_FORM_PAPER_PADDING = 3;
export const CENTERED_FORM_MAX_WIDTH = 560;

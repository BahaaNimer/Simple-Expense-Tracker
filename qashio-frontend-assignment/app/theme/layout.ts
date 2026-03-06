export const LAYOUT = {
  background: '#f5f5f5',
  contentBackground: '#fff',
  sidebar: {
    width: 220,
    widthMobile: 280,
    navActiveBg: '#a78f66',
    navActiveBgHover: '#b8943f',
    navInactiveColor: '#000',
    navActiveColor: '#fff',
    BorderRight: '1px solid #e0e0e0',
  },
  header: {
    borderBottom: 'none',
  },
} as const;

export const BREAKPOINTS = {
  sidebarVisible: 'md',
} as const;

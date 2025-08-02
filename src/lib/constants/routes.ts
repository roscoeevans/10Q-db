// Application routes
export const ROUTES = {
  HOME: '/',
  UPLOAD: '/upload',
  EXPLORE: '/explore',
  SETTINGS: '/settings',
  ADMIN: '/admin'
} as const;

// Tab navigation
export const TABS = {
  UPLOAD: 'upload',
  EXPLORE: 'explore',
  SETTINGS: 'settings'
} as const;

export type Tab = typeof TABS[keyof typeof TABS]; 
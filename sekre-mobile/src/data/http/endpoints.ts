// Semua endpoint API Sekre — typed constants
export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },

  // Health
  HEALTH: {
    LIVE: '/health/live',
    READY: '/health/ready',
  },

  // Users
  USERS: {
    LIST: '/users',
    SEARCH: '/users/search',
    UPDATE_PROFILE: '/users/me/profile',
    CHANGE_PASSWORD: '/users/me/change-password',
  },

  // Organizations
  ORGANIZATIONS: {
    UPDATE: '/organizations/me',
    DELETE: '/organizations/me',
  },

  // Members
  MEMBERS: {
    LIST: '/members',
    CREATE: '/members/create',
    BULK_IMPORT: '/members/bulk-import',
    TEMPLATE: '/members/template',
    UPDATE: (userId: string) => `/members/${userId}`,
    DELETE: (userId: string) => `/members/${userId}`,
  },

  // Divisions
  DIVISIONS: {
    LIST: '/divisions',
    CREATE: '/divisions',
    DETAIL: (id: string) => `/divisions/${id}`,
    UPDATE: (id: string) => `/divisions/${id}`,
    DELETE: (id: string) => `/divisions/${id}`,
    MEMBERS: (id: string) => `/divisions/${id}/members`,
    ADD_MEMBER: (id: string) => `/divisions/${id}/members`,
    UPDATE_MEMBER: (id: string, userId: string) =>
      `/divisions/${id}/members/${userId}`,
    REMOVE_MEMBER: (id: string, userId: string) =>
      `/divisions/${id}/members/${userId}`,
  },

  // Tasks
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    DETAIL: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    UPDATE_STATUS: (id: string) => `/tasks/${id}/status`,
    DELETE: (id: string) => `/tasks/${id}`,
  },

  // Events
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    DETAIL: (id: string) => `/events/${id}`,
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
  },

  // Finance
  FINANCE: {
    TRANSACTIONS_LIST: '/transactions',
    TRANSACTION_CREATE: '/transactions',
    TRANSACTION_DETAIL: (id: string) => `/transactions/${id}`,
    TRANSACTION_UPDATE: (id: string) => `/transactions/${id}`,
    TRANSACTION_DELETE: (id: string) => `/transactions/${id}`,
    SUMMARY: '/finance/summary',
  },
} as const;

export const ROLES = { CLIENT: 'client', ADMIN: 'admin' };
export const BOOKING_STATUS = { PENDING: 'pending', CONFIRMED: 'confirmed', CANCELLED: 'cancelled', COMPLETED: 'completed', NO_SHOW: 'no_show' };
export const SLOT_STATUS = { AVAILABLE: 'available', BOOKED: 'booked', LAST_MINUTE: 'last_minute', BLOCKED: 'blocked' };
export const RELIABILITY = { INITIAL_SCORE: 100, NO_SHOW_PENALTY: -15, COMPLETION_REWARD: 5, BLOCK_THRESHOLD: 40, WARNING_THRESHOLD: 70 };
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_REGISTER: '/beauty-admin-portal-2024',
  CLIENT_DASHBOARD: '/dashboard',
  CLIENT_BOOKING: '/book/:salonId',
  CLIENT_MARKETPLACE: '/marketplace',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_SLOTS: '/admin/slots',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
};

export const ROUTES_EXTRA = {
  ADMIN_PRICING: '/admin/pricing',
};

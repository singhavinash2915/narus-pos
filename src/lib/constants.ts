export const APP_NAME = "NARU's Biryani & Kababs"
export const APP_SHORT_NAME = "NARU's POS"

export const TAX_RATE = 0.05 // 5% GST

export const ORDER_TYPES = ['dine-in', 'delivery', 'pickup'] as const
export const ORDER_STATUSES = ['completed', 'saved', 'held'] as const
export const PAYMENT_METHODS = ['cash', 'card', 'upi'] as const
export const ITEM_TYPES = ['veg', 'non-veg'] as const
export const VARIATIONS = ['Half', 'Full'] as const
export const DISCOUNT_TYPES = ['percentage', 'fixed'] as const
export const STAFF_ROLES = ['staff', 'owner'] as const

export const DASHBOARD_PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
] as const

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const

// Touch target minimum sizes
export const TOUCH_MIN = 48 // px
export const PINPAD_BUTTON_SIZE = 72 // px on mobile
export const PINPAD_BUTTON_SIZE_DESKTOP = 64 // px

// Navigation
export const NAV_ITEMS = [
  { path: '/pos', label: 'POS', icon: 'ShoppingCart', roles: ['staff', 'owner'] },
  { path: '/orders', label: 'Orders', icon: 'ClipboardList', roles: ['staff', 'owner'] },
  { path: '/manage', label: 'Manage', icon: 'Settings', roles: ['owner'] },
  { path: '/dashboard', label: 'Dashboard', icon: 'BarChart3', roles: ['owner'] },
] as const

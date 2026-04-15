// ──────────────────────────────────────
// Database types (maps to Supabase schema)
// ──────────────────────────────────────

export type StaffRole = 'staff' | 'owner'
export type ItemType = 'veg' | 'non-veg'
export type OrderType = 'dine-in' | 'delivery' | 'pickup'
export type OrderStatus = 'completed' | 'saved' | 'held'
export type PaymentMethod = 'cash' | 'card' | 'upi'
export type DiscountType = 'percentage' | 'fixed'
export type Variation = 'Half' | 'Full'

export interface Staff {
  id: string
  name: string
  pin: string // hashed
  role: StaffRole
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  sort_order: number
  created_at: string
}

export interface MenuItem {
  id: string
  name: string
  category_id: string
  price_half: number | null
  price_full: number
  type: ItemType
  is_available: boolean
  created_at: string
  updated_at: string
  // Joined field
  category?: Category
}

export interface Coupon {
  id: string
  code: string
  discount_type: DiscountType
  discount_value: number
  is_active: boolean
  min_order_value: number
  max_discount: number | null
  valid_from: string | null
  valid_until: string | null
  created_at: string
}

export interface Order {
  id: string
  order_number: number
  order_type: OrderType
  status: OrderStatus
  customer_name: string | null
  customer_phone: string | null
  table_number: string | null
  subtotal: number
  discount_amount: number
  discount_label: string | null
  tax_amount: number
  total: number
  payment_method: PaymentMethod | null
  staff_id: string | null
  created_at: string
  updated_at: string
  // Joined fields
  items?: OrderItem[]
  staff?: Staff
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  item_name: string
  variation: Variation
  unit_price: number
  quantity: number
  line_total: number
}

// ──────────────────────────────────────
// UI State types
// ──────────────────────────────────────

export interface CartItem {
  id: string // temp ID for cart
  menu_item_id: string
  item_name: string
  variation: Variation
  unit_price: number
  quantity: number
  line_total: number
  type: ItemType
}

export interface CartDiscount {
  type: DiscountType
  value: number
  label: string
  coupon_code?: string
}

export interface CurrentOrder {
  order_type: OrderType
  customer_name: string
  customer_phone: string
  table_number: string
  items: CartItem[]
  discount: CartDiscount | null
}

export interface DashboardKPIs {
  total_revenue: number
  total_orders: number
  avg_order_value: number
  top_item: string
}

export type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter'

// ──────────────────────────────────────
// Supabase Database type (for typed client)
// ──────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'id' | 'created_at'>
        Update: Partial<Omit<Staff, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      menu_items: {
        Row: MenuItem
        Insert: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'category'>
        Update: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'category'>>
      }
      coupons: {
        Row: Coupon
        Insert: Omit<Coupon, 'id' | 'created_at'>
        Update: Partial<Omit<Coupon, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'items' | 'staff'>
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'items' | 'staff'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id'>
        Update: Partial<Omit<OrderItem, 'id'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

import type { Category, MenuItem, Coupon, Staff, Order, OrderItem } from '@/types'

// ──────────────────────────────────────
// Demo Categories (12)
// ──────────────────────────────────────
export const demoCategories: Category[] = [
  { id: 'cat-1', name: 'Veg Starter', sort_order: 1, created_at: '2024-01-01' },
  { id: 'cat-2', name: 'Non-Veg Starter', sort_order: 2, created_at: '2024-01-01' },
  { id: 'cat-3', name: 'Veg Main Course', sort_order: 3, created_at: '2024-01-01' },
  { id: 'cat-4', name: 'Non-Veg Main Course', sort_order: 4, created_at: '2024-01-01' },
  { id: 'cat-5', name: 'Biryani', sort_order: 5, created_at: '2024-01-01' },
  { id: 'cat-6', name: 'Breads', sort_order: 6, created_at: '2024-01-01' },
  { id: 'cat-7', name: 'Rice', sort_order: 7, created_at: '2024-01-01' },
  { id: 'cat-8', name: 'Raita & Sides', sort_order: 8, created_at: '2024-01-01' },
  { id: 'cat-9', name: 'Desserts', sort_order: 9, created_at: '2024-01-01' },
  { id: 'cat-10', name: 'Beverages', sort_order: 10, created_at: '2024-01-01' },
  { id: 'cat-11', name: 'Kebabs', sort_order: 11, created_at: '2024-01-01' },
  { id: 'cat-12', name: 'Combos', sort_order: 12, created_at: '2024-01-01' },
]

// ──────────────────────────────────────
// Demo Menu Items (47)
// ──────────────────────────────────────
export const demoMenuItems: MenuItem[] = [
  // Veg Starters
  { id: 'item-1', name: 'Paneer Tikka', category_id: 'cat-1', price_half: 160, price_full: 280, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-2', name: 'Veg Manchurian', category_id: 'cat-1', price_half: 140, price_full: 240, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-3', name: 'Mushroom Chilli', category_id: 'cat-1', price_half: 150, price_full: 260, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-4', name: 'Hara Bhara Kebab', category_id: 'cat-1', price_half: null, price_full: 220, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Non-Veg Starters
  { id: 'item-5', name: 'Chicken Tikka', category_id: 'cat-2', price_half: 180, price_full: 320, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-6', name: 'Tandoori Chicken', category_id: 'cat-2', price_half: 200, price_full: 360, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-7', name: 'Fish Fry', category_id: 'cat-2', price_half: null, price_full: 300, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-8', name: 'Chicken 65', category_id: 'cat-2', price_half: 170, price_full: 300, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-9', name: 'Mutton Seekh Kebab', category_id: 'cat-2', price_half: null, price_full: 380, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Veg Main Course
  { id: 'item-10', name: 'Paneer Butter Masala', category_id: 'cat-3', price_half: 180, price_full: 300, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-11', name: 'Dal Tadka', category_id: 'cat-3', price_half: 120, price_full: 200, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-12', name: 'Shahi Paneer', category_id: 'cat-3', price_half: 180, price_full: 310, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-13', name: 'Mix Veg Curry', category_id: 'cat-3', price_half: 140, price_full: 240, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-14', name: 'Palak Paneer', category_id: 'cat-3', price_half: 170, price_full: 290, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Non-Veg Main Course
  { id: 'item-15', name: 'Butter Chicken', category_id: 'cat-4', price_half: 200, price_full: 360, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-16', name: 'Chicken Curry', category_id: 'cat-4', price_half: 180, price_full: 320, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-17', name: 'Mutton Rogan Josh', category_id: 'cat-4', price_half: 240, price_full: 420, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-18', name: 'Kadhai Chicken', category_id: 'cat-4', price_half: 200, price_full: 350, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-19', name: 'Egg Curry', category_id: 'cat-4', price_half: 120, price_full: 200, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Biryani
  { id: 'item-20', name: 'Chicken Biryani', category_id: 'cat-5', price_half: 180, price_full: 320, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-21', name: 'Mutton Biryani', category_id: 'cat-5', price_half: 220, price_full: 400, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-22', name: 'Veg Biryani', category_id: 'cat-5', price_half: 150, price_full: 260, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-23', name: 'Egg Biryani', category_id: 'cat-5', price_half: 160, price_full: 280, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-24', name: 'Special Naru Biryani', category_id: 'cat-5', price_half: 250, price_full: 450, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Breads
  { id: 'item-25', name: 'Butter Naan', category_id: 'cat-6', price_half: null, price_full: 50, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-26', name: 'Garlic Naan', category_id: 'cat-6', price_half: null, price_full: 60, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-27', name: 'Tandoori Roti', category_id: 'cat-6', price_half: null, price_full: 30, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-28', name: 'Laccha Paratha', category_id: 'cat-6', price_half: null, price_full: 50, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-29', name: 'Kulcha', category_id: 'cat-6', price_half: null, price_full: 55, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Rice
  { id: 'item-30', name: 'Steamed Rice', category_id: 'cat-7', price_half: null, price_full: 100, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-31', name: 'Jeera Rice', category_id: 'cat-7', price_half: null, price_full: 130, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-32', name: 'Ghee Rice', category_id: 'cat-7', price_half: null, price_full: 140, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Raita & Sides
  { id: 'item-33', name: 'Raita', category_id: 'cat-8', price_half: null, price_full: 60, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-34', name: 'Green Salad', category_id: 'cat-8', price_half: null, price_full: 50, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-35', name: 'Papad', category_id: 'cat-8', price_half: null, price_full: 30, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Desserts
  { id: 'item-36', name: 'Gulab Jamun', category_id: 'cat-9', price_half: null, price_full: 80, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-37', name: 'Shahi Tukda', category_id: 'cat-9', price_half: null, price_full: 100, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-38', name: 'Phirni', category_id: 'cat-9', price_half: null, price_full: 90, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Beverages
  { id: 'item-39', name: 'Masala Chai', category_id: 'cat-10', price_half: null, price_full: 30, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-40', name: 'Cold Drink', category_id: 'cat-10', price_half: null, price_full: 40, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-41', name: 'Lassi', category_id: 'cat-10', price_half: null, price_full: 60, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-42', name: 'Buttermilk', category_id: 'cat-10', price_half: null, price_full: 40, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Kebabs
  { id: 'item-43', name: 'Chicken Seekh Kebab', category_id: 'cat-11', price_half: null, price_full: 280, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-44', name: 'Mutton Galouti Kebab', category_id: 'cat-11', price_half: null, price_full: 350, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-45', name: 'Paneer Reshmi Kebab', category_id: 'cat-11', price_half: null, price_full: 260, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Combos
  { id: 'item-46', name: 'Biryani + Raita Combo', category_id: 'cat-12', price_half: null, price_full: 350, type: 'non-veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'item-47', name: 'Thali Special', category_id: 'cat-12', price_half: null, price_full: 300, type: 'veg', is_available: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
]

// ──────────────────────────────────────
// Demo Coupons (3)
// ──────────────────────────────────────
export const demoCoupons: Coupon[] = [
  { id: 'coupon-1', code: 'NARU10', discount_type: 'percentage', discount_value: 10, is_active: true, min_order_value: 200, max_discount: 100, valid_from: null, valid_until: null, created_at: '2024-01-01' },
  { id: 'coupon-2', code: 'DROOL20', discount_type: 'percentage', discount_value: 20, is_active: true, min_order_value: 500, max_discount: 200, valid_from: null, valid_until: null, created_at: '2024-01-01' },
  { id: 'coupon-3', code: 'FLAT50', discount_type: 'fixed', discount_value: 50, is_active: true, min_order_value: 300, max_discount: null, valid_from: null, valid_until: null, created_at: '2024-01-01' },
]

// ──────────────────────────────────────
// Demo Staff
// ──────────────────────────────────────
export const demoStaff: Staff[] = [
  { id: 'staff-1', name: 'Raju', pin: '1234', role: 'staff', is_active: true, created_at: '2024-01-01' },
  { id: 'staff-2', name: 'Amit', pin: '5678', role: 'staff', is_active: true, created_at: '2024-01-01' },
  { id: 'staff-owner', name: 'Owner', pin: '0000', role: 'owner', is_active: true, created_at: '2024-01-01' },
]

// ──────────────────────────────────────
// Demo Order Generator
// ──────────────────────────────────────
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateDemoOrders(count: number = 85): { orders: Order[]; orderItems: OrderItem[] } {
  const orders: Order[] = []
  const orderItems: OrderItem[] = []
  const now = Date.now()
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000

  const orderTypes: Array<'dine-in' | 'delivery' | 'pickup'> = ['dine-in', 'delivery', 'pickup']
  const paymentMethods: Array<'cash' | 'card' | 'upi'> = ['cash', 'card', 'upi']
  const statuses: Array<'completed' | 'saved' | 'held'> = ['completed', 'completed', 'completed', 'completed', 'saved', 'held']

  for (let i = 0; i < count; i++) {
    const orderId = `order-${i + 1}`
    const orderDate = new Date(now - Math.random() * ninetyDaysMs)
    const itemCount = randomInt(1, 5)
    let subtotal = 0
    const items: OrderItem[] = []

    for (let j = 0; j < itemCount; j++) {
      const menuItem = randomChoice(demoMenuItems)
      const hasHalf = menuItem.price_half !== null
      const variation: 'Half' | 'Full' = hasHalf && Math.random() > 0.5 ? 'Half' : 'Full'
      const unitPrice = variation === 'Half' ? (menuItem.price_half ?? menuItem.price_full) : menuItem.price_full
      const qty = randomInt(1, 3)
      const lineTotal = unitPrice * qty

      items.push({
        id: `oi-${i}-${j}`,
        order_id: orderId,
        menu_item_id: menuItem.id,
        item_name: menuItem.name,
        variation,
        unit_price: unitPrice,
        quantity: qty,
        line_total: lineTotal,
      })
      subtotal += lineTotal
    }

    const discountAmount = Math.random() > 0.7 ? Math.round(subtotal * 0.1) : 0
    const taxAmount = Math.round((subtotal - discountAmount) * 0.05)
    const total = subtotal - discountAmount + taxAmount
    const status = randomChoice(statuses)

    orders.push({
      id: orderId,
      order_number: 1000 + i,
      order_type: randomChoice(orderTypes),
      status,
      customer_name: status === 'completed' ? `Customer ${i + 1}` : null,
      customer_phone: null,
      table_number: Math.random() > 0.5 ? `T${randomInt(1, 10)}` : null,
      subtotal,
      discount_amount: discountAmount,
      discount_label: discountAmount > 0 ? '10% Off' : null,
      tax_amount: taxAmount,
      total,
      payment_method: status === 'completed' ? randomChoice(paymentMethods) : null,
      staff_id: randomChoice(demoStaff).id,
      created_at: orderDate.toISOString(),
      updated_at: orderDate.toISOString(),
      items,
    })

    orderItems.push(...items)
  }

  // Sort newest first
  orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return { orders, orderItems }
}

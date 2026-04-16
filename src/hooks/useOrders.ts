import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus, PaymentMethod, CartItem, CartDiscount } from '@/types'
import type { OrderTotals } from '@/contexts/CurrentOrderContext'

// ──────────────────────────────────────
// Fetch orders
// ──────────────────────────────────────
interface OrderFilters {
  status?: string  // 'all' | OrderStatus
  since?: string   // ISO date string
  search?: string
  limit?: number
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.since) {
        query = query.gte('created_at', filters.since)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error

      // Supabase returns NUMERIC columns as strings; parse them
      return (data ?? []).map(normalizeOrder) as Order[]
    },
    staleTime: 30_000,  // 30s
  })
}

// ──────────────────────────────────────
// Create order (complete / save / hold)
// ──────────────────────────────────────
interface CreateOrderInput {
  orderType: string
  status: OrderStatus
  customerName: string
  customerPhone: string
  tableNumber: string
  items: CartItem[]
  totals: OrderTotals
  discount: CartDiscount | null
  paymentMethod?: PaymentMethod
  staffId?: string
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_type: input.orderType,
          status: input.status,
          customer_name: input.customerName || null,
          customer_phone: input.customerPhone || null,
          table_number: input.tableNumber || null,
          subtotal: input.totals.subtotal,
          discount_amount: input.totals.discountAmount,
          discount_label: input.discount?.label || null,
          tax_amount: input.totals.taxAmount,
          total: input.totals.total,
          payment_method: input.paymentMethod || null,
          staff_id: input.staffId || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Insert order items
      if (input.items.length > 0) {
        const orderItems = input.items.map(item => ({
          order_id: newOrder.id,
          menu_item_id: item.menu_item_id,
          item_name: item.item_name,
          variation: item.variation,
          unit_price: item.unit_price,
          quantity: item.quantity,
          line_total: item.line_total,
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError
      }

      return normalizeOrder(newOrder)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// ──────────────────────────────────────
// Delete order (for resuming held/saved)
// ──────────────────────────────────────
export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      // order_items cascade-deleted via FK
      const { error } = await supabase.from('orders').delete().eq('id', orderId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// ──────────────────────────────────────
// Normalise numeric strings from Supabase
// ──────────────────────────────────────
function normalizeOrder(row: Record<string, unknown>): Order {
  return {
    ...row,
    subtotal: Number(row.subtotal),
    discount_amount: Number(row.discount_amount),
    tax_amount: Number(row.tax_amount),
    total: Number(row.total),
    order_number: Number(row.order_number),
    items: Array.isArray(row.items)
      ? row.items.map((i: Record<string, unknown>) => ({
          ...i,
          unit_price: Number(i.unit_price),
          quantity: Number(i.quantity),
          line_total: Number(i.line_total),
        }))
      : [],
  } as Order
}

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type { CartItem, CartDiscount, CurrentOrder, OrderType, Variation, ItemType, MenuItem } from '@/types'
import { CGST_RATE, SGST_RATE } from '@/lib/constants'

export interface OrderTotals {
  subtotal: number
  discountAmount: number
  taxableAmount: number
  cgstAmount: number
  sgstAmount: number
  taxAmount: number // = cgstAmount + sgstAmount, kept for DB compatibility
  total: number
  itemCount: number
}

interface CurrentOrderState extends CurrentOrder {
  totals: OrderTotals
}

type OrderAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; variation: Variation } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_ORDER_TYPE'; payload: OrderType }
  | { type: 'SET_CUSTOMER'; payload: { name: string; phone: string } }
  | { type: 'SET_TABLE'; payload: string }
  | { type: 'SET_DISCOUNT'; payload: CartDiscount | null }
  | { type: 'CLEAR_ORDER' }
  | { type: 'LOAD_ORDER'; payload: CurrentOrder }

function calculateTotals(items: CartItem[], discount: CartDiscount | null): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  let discountAmount = 0
  if (discount) {
    if (discount.type === 'percentage') {
      discountAmount = Math.round(subtotal * (discount.value / 100))
    } else {
      discountAmount = discount.value
    }
  }
  discountAmount = Math.min(discountAmount, subtotal) // Can't exceed subtotal

  const taxableAmount = subtotal - discountAmount
  // Round each GST half independently so the receipt math always reconciles
  const cgstAmount = Math.round(taxableAmount * CGST_RATE * 100) / 100
  const sgstAmount = Math.round(taxableAmount * SGST_RATE * 100) / 100
  const taxAmount = cgstAmount + sgstAmount
  const total = Math.round((taxableAmount + taxAmount) * 100) / 100

  return { subtotal, discountAmount, taxableAmount, cgstAmount, sgstAmount, taxAmount, total, itemCount }
}

const initialState: CurrentOrderState = {
  order_type: 'dine-in',
  customer_name: '',
  customer_phone: '',
  table_number: '',
  items: [],
  discount: null,
  totals: { subtotal: 0, discountAmount: 0, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, taxAmount: 0, total: 0, itemCount: 0 },
}

function orderReducer(state: CurrentOrderState, action: OrderAction): CurrentOrderState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, variation } = action.payload
      const unitPrice = variation === 'Half'
        ? (menuItem.price_half ?? menuItem.price_full)
        : menuItem.price_full

      // Check if same item+variation exists
      const existingIndex = state.items.findIndex(
        item => item.menu_item_id === menuItem.id && item.variation === variation
      )

      let newItems: CartItem[]
      if (existingIndex >= 0) {
        newItems = state.items.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + 1, line_total: (item.quantity + 1) * item.unit_price }
            : item
        )
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          menu_item_id: menuItem.id,
          item_name: menuItem.name,
          variation,
          unit_price: unitPrice,
          quantity: 1,
          line_total: unitPrice,
          type: menuItem.type as ItemType,
        }
        newItems = [...state.items, newItem]
      }

      const totals = calculateTotals(newItems, state.discount)
      return { ...state, items: newItems, totals }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id)
      const totals = calculateTotals(newItems, state.discount)
      return { ...state, items: newItems, totals }
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.id !== id)
        const totals = calculateTotals(newItems, state.discount)
        return { ...state, items: newItems, totals }
      }
      const newItems = state.items.map(item =>
        item.id === id
          ? { ...item, quantity, line_total: quantity * item.unit_price }
          : item
      )
      const totals = calculateTotals(newItems, state.discount)
      return { ...state, items: newItems, totals }
    }

    case 'SET_ORDER_TYPE':
      return { ...state, order_type: action.payload }

    case 'SET_CUSTOMER':
      return { ...state, customer_name: action.payload.name, customer_phone: action.payload.phone }

    case 'SET_TABLE':
      return { ...state, table_number: action.payload }

    case 'SET_DISCOUNT': {
      const totals = calculateTotals(state.items, action.payload)
      return { ...state, discount: action.payload, totals }
    }

    case 'CLEAR_ORDER':
      return { ...initialState }

    case 'LOAD_ORDER': {
      const totals = calculateTotals(action.payload.items, action.payload.discount)
      return { ...action.payload, totals }
    }

    default:
      return state
  }
}

interface CurrentOrderContextValue {
  order: CurrentOrderState
  addItem: (menuItem: MenuItem, variation: Variation) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setOrderType: (type: OrderType) => void
  setCustomer: (name: string, phone: string) => void
  setTable: (table: string) => void
  setDiscount: (discount: CartDiscount | null) => void
  clearOrder: () => void
  loadOrder: (order: CurrentOrder) => void
}

const CurrentOrderContext = createContext<CurrentOrderContextValue | null>(null)

export function CurrentOrderProvider({ children }: { children: React.ReactNode }) {
  const [order, dispatch] = useReducer(orderReducer, initialState)

  const addItem = useCallback((menuItem: MenuItem, variation: Variation) => {
    dispatch({ type: 'ADD_ITEM', payload: { menuItem, variation } })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }, [])

  const setOrderType = useCallback((type: OrderType) => {
    dispatch({ type: 'SET_ORDER_TYPE', payload: type })
  }, [])

  const setCustomer = useCallback((name: string, phone: string) => {
    dispatch({ type: 'SET_CUSTOMER', payload: { name, phone } })
  }, [])

  const setTable = useCallback((table: string) => {
    dispatch({ type: 'SET_TABLE', payload: table })
  }, [])

  const setDiscount = useCallback((discount: CartDiscount | null) => {
    dispatch({ type: 'SET_DISCOUNT', payload: discount })
  }, [])

  const clearOrder = useCallback(() => {
    dispatch({ type: 'CLEAR_ORDER' })
  }, [])

  const loadOrder = useCallback((orderData: CurrentOrder) => {
    dispatch({ type: 'LOAD_ORDER', payload: orderData })
  }, [])

  return (
    <CurrentOrderContext.Provider
      value={{ order, addItem, removeItem, updateQuantity, setOrderType, setCustomer, setTable, setDiscount, clearOrder, loadOrder }}
    >
      {children}
    </CurrentOrderContext.Provider>
  )
}

export function useCurrentOrder() {
  const ctx = useContext(CurrentOrderContext)
  if (!ctx) throw new Error('useCurrentOrder must be used within CurrentOrderProvider')
  return ctx
}

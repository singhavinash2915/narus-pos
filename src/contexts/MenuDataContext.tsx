import React, { createContext, useContext, useState, useCallback } from 'react'
import type { MenuItem, Category, Coupon, ItemType } from '@/types'
import { demoMenuItems, demoCategories, demoCoupons } from '@/lib/demo-data'

// ──────────────────────────────────────
// Context value interface
// ──────────────────────────────────────

interface MenuDataContextValue {
  // Data
  menuItems: MenuItem[]
  categories: Category[]
  coupons: Coupon[]

  // Menu item CRUD
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => void
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  toggleMenuItemAvailability: (id: string) => void

  // Category CRUD
  addCategory: (cat: Omit<Category, 'id' | 'created_at'>) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => boolean // returns false if category has items

  // Coupon CRUD
  addCoupon: (coupon: Omit<Coupon, 'id' | 'created_at'>) => void
  updateCoupon: (id: string, updates: Partial<Coupon>) => void
  deleteCoupon: (id: string) => void
  toggleCouponActive: (id: string) => void
}

const MenuDataContext = createContext<MenuDataContextValue | null>(null)

// ──────────────────────────────────────
// Helper: generate IDs
// ──────────────────────────────────────
let idCounter = 1000
function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${++idCounter}`
}
function nowISO() {
  return new Date().toISOString()
}

// ──────────────────────────────────────
// Provider
// ──────────────────────────────────────
export function MenuDataProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(demoMenuItems)
  const [categories, setCategories] = useState<Category[]>(demoCategories)
  const [coupons, setCoupons] = useState<Coupon[]>(demoCoupons)

  // ── Menu Items ──

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    const now = nowISO()
    const newItem: MenuItem = { ...item, id: nextId('item'), created_at: now, updated_at: now }
    setMenuItems(prev => [...prev, newItem])
  }, [])

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates, updated_at: nowISO() } : item
      )
    )
  }, [])

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const toggleMenuItemAvailability = useCallback((id: string) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, is_available: !item.is_available, updated_at: nowISO() } : item
      )
    )
  }, [])

  // ── Categories ──

  const addCategory = useCallback((cat: Omit<Category, 'id' | 'created_at'>) => {
    const newCat: Category = { ...cat, id: nextId('cat'), created_at: nowISO() }
    setCategories(prev => [...prev, newCat])
  }, [])

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...updates } : cat))
    )
  }, [])

  const deleteCategory = useCallback((id: string): boolean => {
    // Check if any menu items use this category
    const hasItems = menuItems.some(item => item.category_id === id)
    if (hasItems) return false
    setCategories(prev => prev.filter(cat => cat.id !== id))
    return true
  }, [menuItems])

  // ── Coupons ──

  const addCoupon = useCallback((coupon: Omit<Coupon, 'id' | 'created_at'>) => {
    const newCoupon: Coupon = { ...coupon, id: nextId('coupon'), created_at: nowISO() }
    setCoupons(prev => [...prev, newCoupon])
  }, [])

  const updateCoupon = useCallback((id: string, updates: Partial<Coupon>) => {
    setCoupons(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [])

  const deleteCoupon = useCallback((id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id))
  }, [])

  const toggleCouponActive = useCallback((id: string) => {
    setCoupons(prev =>
      prev.map(c => (c.id === id ? { ...c, is_active: !c.is_active } : c))
    )
  }, [])

  return (
    <MenuDataContext.Provider
      value={{
        menuItems,
        categories,
        coupons,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponActive,
      }}
    >
      {children}
    </MenuDataContext.Provider>
  )
}

export function useMenuData() {
  const ctx = useContext(MenuDataContext)
  if (!ctx) throw new Error('useMenuData must be used within MenuDataProvider')
  return ctx
}

import React, { createContext, useContext, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { MenuItem, Category, Coupon } from '@/types'

// ──────────────────────────────────────
// Normalise Supabase numeric strings
// ──────────────────────────────────────
function normalizeMenuItem(row: Record<string, unknown>): MenuItem {
  return {
    ...row,
    price_half: row.price_half != null ? Number(row.price_half) : null,
    price_full: Number(row.price_full),
  } as MenuItem
}

function normalizeCoupon(row: Record<string, unknown>): Coupon {
  return {
    ...row,
    discount_value: Number(row.discount_value),
    min_order_value: Number(row.min_order_value),
    max_discount: row.max_discount != null ? Number(row.max_discount) : null,
  } as Coupon
}

// ──────────────────────────────────────
// Context value interface
// ──────────────────────────────────────
interface MenuDataContextValue {
  // Data
  menuItems: MenuItem[]
  categories: Category[]
  coupons: Coupon[]

  // Loading / error
  isLoading: boolean
  error: Error | null

  // Menu item CRUD
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'category'>) => Promise<void>
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>
  deleteMenuItem: (id: string) => Promise<void>
  toggleMenuItemAvailability: (id: string) => Promise<void>

  // Category CRUD
  addCategory: (cat: { name: string; sort_order: number }) => Promise<void>
  updateCategory: (id: string, updates: { name?: string; sort_order?: number }) => Promise<void>
  deleteCategory: (id: string) => Promise<boolean>

  // Coupon CRUD
  addCoupon: (coupon: Omit<Coupon, 'id' | 'created_at'>) => Promise<void>
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>
  deleteCoupon: (id: string) => Promise<void>
  toggleCouponActive: (id: string) => Promise<void>
}

const MenuDataContext = createContext<MenuDataContextValue | null>(null)

// ──────────────────────────────────────
// Provider
// ──────────────────────────────────────
export function MenuDataProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  // ── Queries ──

  const menuItemsQuery = useQuery({
    queryKey: ['menu_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name')
      if (error) throw error
      return (data ?? []).map(r => normalizeMenuItem(r as Record<string, unknown>))
    },
    staleTime: 60_000,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
      if (error) throw error
      return (data ?? []) as Category[]
    },
    staleTime: 60_000,
  })

  const couponsQuery = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('code')
      if (error) throw error
      return (data ?? []).map(r => normalizeCoupon(r as Record<string, unknown>))
    },
    staleTime: 60_000,
  })

  const menuItems = menuItemsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const coupons = couponsQuery.data ?? []
  const isLoading = menuItemsQuery.isLoading || categoriesQuery.isLoading || couponsQuery.isLoading
  const error = (menuItemsQuery.error || categoriesQuery.error || couponsQuery.error) as Error | null

  // ── Menu Item Mutations ──

  const addMenuItemMut = useMutation({
    mutationFn: async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
      const { error } = await supabase.from('menu_items').insert({
        name: item.name,
        category_id: item.category_id,
        price_half: item.price_half,
        price_full: item.price_full,
        type: item.type,
        is_available: item.is_available,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu_items'] }),
  })

  const updateMenuItemMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MenuItem> }) => {
      // Strip fields the DB auto-manages
      const { id: _id, created_at, updated_at, category, ...safe } = updates as Record<string, unknown>
      const { error } = await supabase.from('menu_items').update(safe).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu_items'] }),
  })

  const deleteMenuItemMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu_items'] }),
  })

  // ── Category Mutations ──

  const addCategoryMut = useMutation({
    mutationFn: async (cat: { name: string; sort_order: number }) => {
      const { error } = await supabase.from('categories').insert(cat)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  const updateCategoryMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; sort_order?: number } }) => {
      const { error } = await supabase.from('categories').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  const deleteCategoryMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  // ── Coupon Mutations ──

  const addCouponMut = useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('coupons').insert({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        is_active: coupon.is_active,
        min_order_value: coupon.min_order_value,
        max_discount: coupon.max_discount,
        valid_from: coupon.valid_from,
        valid_until: coupon.valid_until,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  })

  const updateCouponMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Coupon> }) => {
      const { id: _id, created_at, ...safe } = updates as Record<string, unknown>
      const { error } = await supabase.from('coupons').update(safe).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  })

  const deleteCouponMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  })

  // ── Exposed callbacks ──

  const addMenuItem = useCallback(
    async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'category'>) => { await addMenuItemMut.mutateAsync(item) },
    [addMenuItemMut]
  )
  const updateMenuItem = useCallback(
    async (id: string, updates: Partial<MenuItem>) => { await updateMenuItemMut.mutateAsync({ id, updates }) },
    [updateMenuItemMut]
  )
  const deleteMenuItem = useCallback(
    async (id: string) => { await deleteMenuItemMut.mutateAsync(id) },
    [deleteMenuItemMut]
  )
  const toggleMenuItemAvailability = useCallback(
    async (id: string) => {
      const item = menuItems.find(i => i.id === id)
      if (item) await updateMenuItemMut.mutateAsync({ id, updates: { is_available: !item.is_available } })
    },
    [menuItems, updateMenuItemMut]
  )

  const addCategory = useCallback(
    async (cat: { name: string; sort_order: number }) => { await addCategoryMut.mutateAsync(cat) },
    [addCategoryMut]
  )
  const updateCategory = useCallback(
    async (id: string, updates: { name?: string; sort_order?: number }) => { await updateCategoryMut.mutateAsync({ id, updates }) },
    [updateCategoryMut]
  )
  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      const hasItems = menuItems.some(item => item.category_id === id)
      if (hasItems) return false
      await deleteCategoryMut.mutateAsync(id)
      return true
    },
    [menuItems, deleteCategoryMut]
  )

  const addCoupon = useCallback(
    async (coupon: Omit<Coupon, 'id' | 'created_at'>) => { await addCouponMut.mutateAsync(coupon) },
    [addCouponMut]
  )
  const updateCoupon = useCallback(
    async (id: string, updates: Partial<Coupon>) => { await updateCouponMut.mutateAsync({ id, updates }) },
    [updateCouponMut]
  )
  const deleteCoupon = useCallback(
    async (id: string) => { await deleteCouponMut.mutateAsync(id) },
    [deleteCouponMut]
  )
  const toggleCouponActive = useCallback(
    async (id: string) => {
      const coupon = coupons.find(c => c.id === id)
      if (coupon) await updateCouponMut.mutateAsync({ id, updates: { is_active: !coupon.is_active } as Partial<Coupon> })
    },
    [coupons, updateCouponMut]
  )

  return (
    <MenuDataContext.Provider
      value={{
        menuItems, categories, coupons, isLoading, error,
        addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability,
        addCategory, updateCategory, deleteCategory,
        addCoupon, updateCoupon, deleteCoupon, toggleCouponActive,
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

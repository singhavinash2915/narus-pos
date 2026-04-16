import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/**
 * Subscribe to Supabase Realtime postgres_changes for key tables.
 * On any INSERT / UPDATE / DELETE → invalidate the matching TanStack Query cache.
 * Call once at the app root (e.g. in AppShell).
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('pos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => { queryClient.invalidateQueries({ queryKey: ['menu_items'] }) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => { queryClient.invalidateQueries({ queryKey: ['categories'] }) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coupons' },
        () => { queryClient.invalidateQueries({ queryKey: ['coupons'] }) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => { queryClient.invalidateQueries({ queryKey: ['orders'] }) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => { queryClient.invalidateQueries({ queryKey: ['orders'] }) }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Staff, StaffRole } from '@/types'
import { demoStaff } from '@/lib/demo-data'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthState {
  staff: Staff | null
  isOwner: boolean
  isAuthenticated: boolean
  login: (pin: string) => Promise<{ success: boolean; error?: string }>
  loginOwner: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  staff: null,
  isOwner: false,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  loginOwner: async () => ({ success: false }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(() => {
    const saved = sessionStorage.getItem('narus_staff')
    return saved ? JSON.parse(saved) : null
  })

  const isOwner = staff?.role === 'owner'
  const isAuthenticated = staff !== null

  useEffect(() => {
    if (staff) {
      sessionStorage.setItem('narus_staff', JSON.stringify(staff))
    } else {
      sessionStorage.removeItem('narus_staff')
    }
  }, [staff])

  const login = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    // Demo mode — match against demo staff
    if (!isSupabaseConfigured) {
      const found = demoStaff.find(s => s.pin === pin && s.is_active)
      if (found) {
        setStaff(found)
        return { success: true }
      }
      return { success: false, error: 'Invalid PIN' }
    }

    // Supabase mode
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('pin', pin)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return { success: false, error: 'Invalid PIN' }
      }
      setStaff(data)
      return { success: true }
    } catch {
      return { success: false, error: 'Connection error' }
    }
  }, [])

  const loginOwner = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Demo mode — owner login with any credentials
    if (!isSupabaseConfigured) {
      const owner = demoStaff.find(s => s.role === 'owner')
      if (owner) {
        setStaff(owner)
        return { success: true }
      }
      return { success: false, error: 'No owner account' }
    }

    // Supabase Auth
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { success: false, error: error.message }
      }
      // After Supabase Auth, find the owner staff record
      const { data: ownerData } = await supabase
        .from('staff')
        .select('*')
        .eq('role', 'owner')
        .eq('is_active', true)
        .single()

      if (ownerData) {
        setStaff(ownerData)
        return { success: true }
      }
      return { success: false, error: 'Owner record not found' }
    } catch {
      return { success: false, error: 'Connection error' }
    }
  }, [])

  const logout = useCallback(() => {
    setStaff(null)
    sessionStorage.removeItem('narus_staff')
    if (isSupabaseConfigured) {
      supabase.auth.signOut()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ staff, isOwner, isAuthenticated, login, loginOwner, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useRequireRole(role: StaffRole): boolean {
  const { staff } = useAuth()
  if (!staff) return false
  if (role === 'owner') return staff.role === 'owner'
  return true // 'staff' role means any authenticated user
}

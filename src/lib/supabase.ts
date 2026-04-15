import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Flag to check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Only create the client if credentials are provided; otherwise use a dummy placeholder
// In demo mode (no Supabase), all data comes from demo-data.ts
export const supabase: SupabaseClient<Database> = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder-key')

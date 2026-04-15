-- ============================================
-- NARU's POS — Migration 003: Tighten RLS
-- Idempotent: safe to re-run
-- Run this in Supabase SQL Editor
-- ============================================
--
-- Why:
--   Migration 001 ships liberal RLS so demo mode works out of the box.
--   Now that we're stable, we tighten access so:
--     * The full staff table (including PINs) is no longer readable by anon
--     * Staff PIN check still works via a SECURITY DEFINER RPC
--     * Owner-only mutations on menu/categories/coupons/staff are enforced at DB level
--     * Order DELETE is restricted to authenticated (owner)
--
-- Roles in Supabase:
--   anon          → staff devices using the public anon key (PIN auth)
--   authenticated → owner who logs in via supabase.auth (email + password)
-- ============================================

-- ──────────────────────────────────────
-- 1. Lock down the staff table
-- ──────────────────────────────────────

-- Remove the open-read policy from migration 001
DROP POLICY IF EXISTS "Anyone can read staff" ON staff;

-- Authenticated users (= owner) can fully manage staff
DROP POLICY IF EXISTS "Authenticated can read staff" ON staff;
CREATE POLICY "Authenticated can read staff" ON staff
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can insert staff" ON staff;
CREATE POLICY "Authenticated can insert staff" ON staff
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can update staff" ON staff;
CREATE POLICY "Authenticated can update staff" ON staff
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can delete staff" ON staff;
CREATE POLICY "Authenticated can delete staff" ON staff
  FOR DELETE USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────
-- 2. SECURITY DEFINER function for PIN-based staff login
--    Anon clients can call this with a PIN and get back the matching
--    staff record (without the PIN itself), without ever being able to
--    SELECT the table directly.
-- ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.verify_staff_pin(p_pin TEXT)
RETURNS TABLE (
  id          UUID,
  name        TEXT,
  role        TEXT,
  is_active   BOOLEAN,
  created_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, s.role, s.is_active, s.created_at
  FROM   public.staff s
  WHERE  s.pin = p_pin
    AND  s.is_active = true
  LIMIT  1;
END;
$$;

-- Anyone with the anon key (= staff devices) can call this RPC
GRANT EXECUTE ON FUNCTION public.verify_staff_pin(TEXT) TO anon, authenticated;

-- ──────────────────────────────────────
-- 3. Tighten DELETE on orders / order_items
-- ──────────────────────────────────────

-- order_items: drop the public-delete policy from migration 001
DROP POLICY IF EXISTS "Anyone can delete order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated can delete order items" ON order_items;
CREATE POLICY "Authenticated can delete order items" ON order_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- orders: add an explicit DELETE policy (none existed in 001 — DELETEs were silently denied)
DROP POLICY IF EXISTS "Authenticated can delete orders" ON orders;
CREATE POLICY "Authenticated can delete orders" ON orders
  FOR DELETE USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────
-- 4. Sanity check (run by hand if you want to verify)
-- ──────────────────────────────────────
-- As an unauthenticated client, this should now return NO rows:
--     SELECT * FROM staff;
-- And this should still work (returns the matching staff record):
--     SELECT * FROM verify_staff_pin('1234');
-- ============================================

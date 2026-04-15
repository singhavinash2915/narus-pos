-- ============================================
-- NARU's POS - Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────
-- 1. Staff Table
-- ──────────────────────────────────────
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('staff', 'owner')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────
-- 2. Categories Table
-- ──────────────────────────────────────
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────
-- 3. Menu Items Table
-- ──────────────────────────────────────
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  price_half NUMERIC(10, 2),
  price_full NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('veg', 'non-veg')),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────
-- 4. Coupons Table
-- ──────────────────────────────────────
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  min_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10, 2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────
-- 5. Orders Table
-- ──────────────────────────────────────
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number SERIAL,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine-in', 'delivery', 'pickup')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'saved', 'held')) DEFAULT 'saved',
  customer_name TEXT,
  customer_phone TEXT,
  table_number TEXT,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_label TEXT,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi')),
  staff_id UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────
-- 6. Order Items Table
-- ──────────────────────────────────────
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  item_name TEXT NOT NULL,
  variation TEXT NOT NULL CHECK (variation IN ('Half', 'Full')),
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  line_total NUMERIC(10, 2) NOT NULL
);

-- ──────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ──────────────────────────────────────
-- Updated_at trigger
-- ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────
-- RLS Policies
-- ──────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Staff: anon can read (for PIN check), authenticated can read
CREATE POLICY "Anyone can read staff" ON staff FOR SELECT USING (true);

-- Categories: anyone can read, authenticated can write
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Menu Items: anyone can read, authenticated can write
CREATE POLICY "Anyone can read menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage menu items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');

-- Coupons: anyone can read, authenticated can write
CREATE POLICY "Anyone can read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage coupons" ON coupons FOR ALL USING (auth.role() = 'authenticated');

-- Orders: anyone can read and write (staff use anon key)
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE USING (true);

-- Order Items: anyone can read and write
CREATE POLICY "Anyone can read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update order items" ON order_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete order items" ON order_items FOR DELETE USING (true);

-- ──────────────────────────────────────
-- Realtime
-- ──────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

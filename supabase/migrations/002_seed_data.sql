-- ============================================
-- NARU's POS - Seed Data
-- Run after 001_initial_schema.sql
-- ============================================

-- ──────────────────────────────────────
-- Staff (PINs stored as plain text for demo; hash in production)
-- ──────────────────────────────────────
INSERT INTO staff (name, pin, role) VALUES
  ('Raju', '1234', 'staff'),
  ('Amit', '5678', 'staff'),
  ('Owner', '0000', 'owner');

-- ──────────────────────────────────────
-- Categories (12)
-- ──────────────────────────────────────
INSERT INTO categories (name, sort_order) VALUES
  ('Veg Starter', 1),
  ('Non-Veg Starter', 2),
  ('Veg Main Course', 3),
  ('Non-Veg Main Course', 4),
  ('Biryani', 5),
  ('Breads', 6),
  ('Rice', 7),
  ('Raita & Sides', 8),
  ('Desserts', 9),
  ('Beverages', 10),
  ('Kebabs', 11),
  ('Combos', 12);

-- ──────────────────────────────────────
-- Menu Items (47)
-- ──────────────────────────────────────

-- Veg Starters
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Paneer Tikka',    (SELECT id FROM categories WHERE name = 'Veg Starter'), 160, 280, 'veg'),
  ('Veg Manchurian',  (SELECT id FROM categories WHERE name = 'Veg Starter'), 140, 240, 'veg'),
  ('Mushroom Chilli',  (SELECT id FROM categories WHERE name = 'Veg Starter'), 150, 260, 'veg'),
  ('Hara Bhara Kebab', (SELECT id FROM categories WHERE name = 'Veg Starter'), NULL, 220, 'veg');

-- Non-Veg Starters
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Chicken Tikka',      (SELECT id FROM categories WHERE name = 'Non-Veg Starter'), 180, 320, 'non-veg'),
  ('Tandoori Chicken',   (SELECT id FROM categories WHERE name = 'Non-Veg Starter'), 200, 360, 'non-veg'),
  ('Fish Fry',           (SELECT id FROM categories WHERE name = 'Non-Veg Starter'), NULL, 300, 'non-veg'),
  ('Chicken 65',         (SELECT id FROM categories WHERE name = 'Non-Veg Starter'), 170, 300, 'non-veg'),
  ('Mutton Seekh Kebab', (SELECT id FROM categories WHERE name = 'Non-Veg Starter'), NULL, 380, 'non-veg');

-- Veg Main Course
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Paneer Butter Masala', (SELECT id FROM categories WHERE name = 'Veg Main Course'), 180, 300, 'veg'),
  ('Dal Tadka',            (SELECT id FROM categories WHERE name = 'Veg Main Course'), 120, 200, 'veg'),
  ('Shahi Paneer',         (SELECT id FROM categories WHERE name = 'Veg Main Course'), 180, 310, 'veg'),
  ('Mix Veg Curry',        (SELECT id FROM categories WHERE name = 'Veg Main Course'), 140, 240, 'veg'),
  ('Palak Paneer',         (SELECT id FROM categories WHERE name = 'Veg Main Course'), 170, 290, 'veg');

-- Non-Veg Main Course
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Butter Chicken',    (SELECT id FROM categories WHERE name = 'Non-Veg Main Course'), 200, 360, 'non-veg'),
  ('Chicken Curry',     (SELECT id FROM categories WHERE name = 'Non-Veg Main Course'), 180, 320, 'non-veg'),
  ('Mutton Rogan Josh', (SELECT id FROM categories WHERE name = 'Non-Veg Main Course'), 240, 420, 'non-veg'),
  ('Kadhai Chicken',    (SELECT id FROM categories WHERE name = 'Non-Veg Main Course'), 200, 350, 'non-veg'),
  ('Egg Curry',         (SELECT id FROM categories WHERE name = 'Non-Veg Main Course'), 120, 200, 'non-veg');

-- Biryani
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Chicken Biryani',      (SELECT id FROM categories WHERE name = 'Biryani'), 180, 320, 'non-veg'),
  ('Mutton Biryani',       (SELECT id FROM categories WHERE name = 'Biryani'), 220, 400, 'non-veg'),
  ('Veg Biryani',          (SELECT id FROM categories WHERE name = 'Biryani'), 150, 260, 'veg'),
  ('Egg Biryani',          (SELECT id FROM categories WHERE name = 'Biryani'), 160, 280, 'non-veg'),
  ('Special Naru Biryani', (SELECT id FROM categories WHERE name = 'Biryani'), 250, 450, 'non-veg');

-- Breads
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Butter Naan',    (SELECT id FROM categories WHERE name = 'Breads'), NULL, 50, 'veg'),
  ('Garlic Naan',    (SELECT id FROM categories WHERE name = 'Breads'), NULL, 60, 'veg'),
  ('Tandoori Roti',  (SELECT id FROM categories WHERE name = 'Breads'), NULL, 30, 'veg'),
  ('Laccha Paratha', (SELECT id FROM categories WHERE name = 'Breads'), NULL, 50, 'veg'),
  ('Kulcha',         (SELECT id FROM categories WHERE name = 'Breads'), NULL, 55, 'veg');

-- Rice
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Steamed Rice', (SELECT id FROM categories WHERE name = 'Rice'), NULL, 100, 'veg'),
  ('Jeera Rice',   (SELECT id FROM categories WHERE name = 'Rice'), NULL, 130, 'veg'),
  ('Ghee Rice',    (SELECT id FROM categories WHERE name = 'Rice'), NULL, 140, 'veg');

-- Raita & Sides
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Raita',       (SELECT id FROM categories WHERE name = 'Raita & Sides'), NULL, 60, 'veg'),
  ('Green Salad', (SELECT id FROM categories WHERE name = 'Raita & Sides'), NULL, 50, 'veg'),
  ('Papad',       (SELECT id FROM categories WHERE name = 'Raita & Sides'), NULL, 30, 'veg');

-- Desserts
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Gulab Jamun', (SELECT id FROM categories WHERE name = 'Desserts'), NULL, 80, 'veg'),
  ('Shahi Tukda', (SELECT id FROM categories WHERE name = 'Desserts'), NULL, 100, 'veg'),
  ('Phirni',      (SELECT id FROM categories WHERE name = 'Desserts'), NULL, 90, 'veg');

-- Beverages
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Masala Chai', (SELECT id FROM categories WHERE name = 'Beverages'), NULL, 30, 'veg'),
  ('Cold Drink',  (SELECT id FROM categories WHERE name = 'Beverages'), NULL, 40, 'veg'),
  ('Lassi',       (SELECT id FROM categories WHERE name = 'Beverages'), NULL, 60, 'veg'),
  ('Buttermilk',  (SELECT id FROM categories WHERE name = 'Beverages'), NULL, 40, 'veg');

-- Kebabs
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Chicken Seekh Kebab',  (SELECT id FROM categories WHERE name = 'Kebabs'), NULL, 280, 'non-veg'),
  ('Mutton Galouti Kebab', (SELECT id FROM categories WHERE name = 'Kebabs'), NULL, 350, 'non-veg'),
  ('Paneer Reshmi Kebab',  (SELECT id FROM categories WHERE name = 'Kebabs'), NULL, 260, 'veg');

-- Combos
INSERT INTO menu_items (name, category_id, price_half, price_full, type) VALUES
  ('Biryani + Raita Combo', (SELECT id FROM categories WHERE name = 'Combos'), NULL, 350, 'non-veg'),
  ('Thali Special',         (SELECT id FROM categories WHERE name = 'Combos'), NULL, 300, 'veg');

-- ──────────────────────────────────────
-- Coupons (3)
-- ──────────────────────────────────────
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount) VALUES
  ('NARU10',  'percentage', 10, 200, 100),
  ('DROOL20', 'percentage', 20, 500, 200),
  ('FLAT50',  'fixed',      50, 300, NULL);

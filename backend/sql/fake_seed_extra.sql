-- Extra demo records for frontend interaction testing.

INSERT INTO clients (
  full_name, phone, email, instagram_handle, skin_tone, undertone, skin_type,
  allergies, sensitivity_notes, preferred_brands, notes, photo_url
) VALUES
  ('Aria Sinclair', '555-0110', 'aria.sinclair@example.com', '@aria.sfx', 'Fair', 'Cool', 'Combination', 'Latex', 'Patch test required', 'Danessa Myricks, Pat McGrath', 'Editorial + bridal blend client', NULL),
  ('Naomi Vale', '555-0111', 'naomi.vale@example.com', '@naomi.glam', 'Medium', 'Warm', 'Normal', NULL, NULL, 'NARS, Makeup by Mario', 'Books monthly shoots', NULL),
  ('Imani Rhodes', '555-0112', 'imani.rhodes@example.com', '@imani.ink', 'Deep', 'Neutral', 'Dry', 'Fragrance', 'Fragrance free products only', 'Fenty Beauty, UOMA', 'High contrast looks preferred', NULL),
  ('Elena Cruz', '555-0113', 'elena.cruz@example.com', '@elenacruzbeauty', 'Light', 'Olive', 'Oily', NULL, NULL, 'Rare Beauty, Dior', 'Frequent camera-ready appointments', NULL),
  ('Jules Mercer', '555-0114', 'jules.mercer@example.com', '@julesmercer', 'Tan', 'Warm', 'Sensitive', 'Acrylic', 'Avoid strong adhesives near eye area', 'Charlotte Tilbury, MAC', 'Theater and red carpet work', NULL),
  ('Bianca North', '555-0115', 'bianca.north@example.com', '@bnorthstudio', 'Medium', 'Neutral', 'Combination', NULL, NULL, 'Haus Labs, Hourglass', 'Requests cool-toned palettes', NULL)
ON CONFLICT(email) DO NOTHING;

INSERT INTO looks_morgue (
  look_name, category, difficulty, skin_tone_tags, occasion_tags, image_url,
  gallery_urls, products_used, color_palette, created_by
) VALUES
  (
    'Emerald Flux', 'Editorial', 'Pro',
    '["Fair", "Medium", "Deep"]',
    '["Runway", "Fashion Week"]',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80"]',
    '["Chrome liner", "Foil pigment", "Setting mist"]',
    '["#00a693", "#e85aa8", "#1b2224"]',
    'MUA Vault Team'
  ),
  (
    'Rose Circuit', 'Bridal', 'Intermediate',
    '["Light", "Medium", "Tan"]',
    '["Wedding", "Engagement"]',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"]',
    '["Soft matte base", "Rose blush", "Gloss finish"]',
    '["#f6b2c6", "#f2d5c4", "#9f4d68"]',
    'MUA Vault Team'
  ),
  (
    'Noir Velvet', 'Film', 'Pro',
    '["Medium", "Tan", "Deep"]',
    '["Film", "Night Shoot"]',
    'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1200&q=80"]',
    '["Velvet lip", "Contour stack", "Smoky eyes"]',
    '["#2a1f2f", "#8c2f5b", "#d5baa3"]',
    'MUA Vault Team'
  ),
  (
    'Solar Pop', 'Runway', 'Beginner',
    '["Fair", "Light", "Medium"]',
    '["Runway", "Commercial"]',
    'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80"]',
    '["Cream blush", "Graphic liner", "Gloss topper"]',
    '["#ff9a3c", "#ffe36c", "#0b8f89"]',
    'MUA Vault Team'
  )
ON CONFLICT DO NOTHING;

INSERT INTO appointments (
  client_id, production_id, shoot_day_id, appointment_date, start_time, end_time,
  event_type, location, status, price, deposit_paid, deposit_amount, notes
)
SELECT
  c.id,
  (SELECT id FROM productions ORDER BY id LIMIT 1),
  (SELECT id FROM shoot_days ORDER BY id LIMIT 1),
  datetime('now', '+1 day'),
  '09:00',
  '10:30',
  'Bridal Trial',
  'Studio A',
  'Booked',
  280,
  1,
  100,
  'Soft glam with skin-forward finish'
FROM clients c
WHERE c.email = 'aria.sinclair@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.client_id = c.id
      AND a.appointment_date = datetime('now', '+1 day')
      AND a.start_time = '09:00'
  );

INSERT INTO appointments (
  client_id, production_id, shoot_day_id, appointment_date, start_time, end_time,
  event_type, location, status, price, deposit_paid, deposit_amount, notes
)
SELECT
  c.id,
  (SELECT id FROM productions ORDER BY id LIMIT 1 OFFSET 1),
  (SELECT id FROM shoot_days ORDER BY id LIMIT 1 OFFSET 1),
  datetime('now', '+2 day'),
  '12:00',
  '13:30',
  'Editorial Shoot',
  'Set B',
  'Booked',
  450,
  1,
  200,
  'Metallic eye and defined contour'
FROM clients c
WHERE c.email = 'naomi.vale@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.client_id = c.id
      AND a.appointment_date = datetime('now', '+2 day')
      AND a.start_time = '12:00'
  );

INSERT INTO appointments (
  client_id, production_id, shoot_day_id, appointment_date, start_time, end_time,
  event_type, location, status, price, deposit_paid, deposit_amount, notes
)
SELECT
  c.id,
  (SELECT id FROM productions ORDER BY id LIMIT 1 OFFSET 2),
  (SELECT id FROM shoot_days ORDER BY id LIMIT 1 OFFSET 2),
  datetime('now', '+3 day'),
  '15:00',
  '16:30',
  'FX Session',
  'Effects Room',
  'Booked',
  520,
  0,
  0,
  'Creature prosthetic base and texture detail'
FROM clients c
WHERE c.email = 'imani.rhodes@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.client_id = c.id
      AND a.appointment_date = datetime('now', '+3 day')
      AND a.start_time = '15:00'
  );

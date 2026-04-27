-- MUA Vault seed data (SQLite)
-- Usage:
--   sqlite3 app.db ".read SCHEMA"
--   sqlite3 app.db ".read SEED.sql"

PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- 1) Users
INSERT INTO users (id, name, email, password_hash, role)
VALUES
    (1, 'Bianca', 'bianca.admin@muavault.com', 'hash_admin_demo', 'admin'),
    (2, 'Nia Carter', 'nia.artist@muavault.com', 'hash_artist_demo', 'artist'),
    (3, 'Zoe Bennett', 'zoe.artist@muavault.com', 'hash_artist_demo_2', 'artist');

-- 2) Clients
INSERT INTO clients (
    id, full_name, phone, email, instagram_handle,
    skin_tone, undertone, skin_type,
    allergies, sensitivity_notes, preferred_brands, notes, photo_url
)
VALUES
    (
        1, 'Maya Johnson', '+1-555-0101', 'maya.j@example.com', '@maya.j',
        'Medium', 'Warm', 'Combination',
        'Latex', 'Patch test all new adhesives.', 'Fenty Beauty, NARS',
        'Bride prefers soft-glam with natural lashes.', 'https://images.example.com/clients/maya.jpg'
    ),
    (
        2, 'Sofia Ramirez', '+1-555-0102', 'sofia.r@example.com', '@sofia.r',
        'Tan', 'Olive', 'Oily',
        NULL, 'Forehead gets shiny quickly.', 'Huda Beauty, Dior',
        'Likes bold lips for evening events.', 'https://images.example.com/clients/sofia.jpg'
    ),
    (
        3, 'Chloe Williams', '+1-555-0103', 'chloe.w@example.com', '@chloew',
        'Light', 'Neutral', 'Sensitive',
        'Fragrance', 'Avoid heavily scented skincare prep.', 'Rare Beauty, Charlotte Tilbury',
        'Prefers lightweight base and peach tones.', 'https://images.example.com/clients/chloe.jpg'
    );

-- 3) Client allergies (normalized)
INSERT INTO client_allergies (id, client_id, allergy_name, reaction_notes, severity)
VALUES
    (1, 1, 'Latex', 'Irritation around lash line when latex glue is used.', 'Moderate'),
    (2, 3, 'Fragrance', 'Redness appears after exposure to fragranced primers.', 'Mild');

-- 4) Makeup looks
INSERT INTO makeup_looks (
    id, look_name, category, description, skin_tone_match,
    difficulty_level, image_url, created_by
)
VALUES
    (
        1, 'Soft Bridal Glow', 'Bridal',
        'Radiant skin, champagne lid, flutter lashes, nude lip.', 'Light-Medium-Tan',
        'Intermediate', 'https://images.example.com/looks/soft-bridal-glow.jpg', 2
    ),
    (
        2, 'Sunset Glam', 'Editorial',
        'Warm gradient eyeshadow with bronzed skin and glossy lip.', 'Medium-Tan-Deep',
        'Advanced', 'https://images.example.com/looks/sunset-glam.jpg', 3
    ),
    (
        3, 'Clean Corporate', 'Natural',
        'Polished complexion with subtle definition and satin lip.', 'Fair-Light-Medium',
        'Beginner', 'https://images.example.com/looks/clean-corporate.jpg', 2
    );

-- 5) Products
INSERT INTO products (
    id, name, brand, category, shade, finish,
    suitable_skin_type, expiration_date, notes
)
VALUES
    (
        1, 'Pro Filt''r Soft Matte Foundation', 'Fenty Beauty', 'Foundation', '290', 'Matte',
        'Oily/Combination', '2027-09-30', 'Long-wear base for events.'
    ),
    (
        2, 'Radiant Creamy Concealer', 'NARS', 'Concealer', 'Ginger', 'Satin',
        'Normal/Dry/Combination', '2027-06-30', 'Brightening under-eye coverage.'
    ),
    (
        3, 'Rose Quartz Palette', 'Huda Beauty', 'Eyeshadow', NULL, 'Shimmer',
        'All', '2028-01-15', 'Versatile pink/champagne shades.'
    ),
    (
        4, 'Airbrush Flawless Finish', 'Charlotte Tilbury', 'Bronzer', 'Medium', 'Matte',
        'All', '2027-11-01', 'Soft sculpting powder bronzer.'
    ),
    (
        5, 'Dew Set Spray', 'Rare Beauty', 'Setting Spray', NULL, 'Dewy',
        'Dry/Normal/Combination', '2027-04-01', 'Hydrating set for natural finish.'
    ),
    (
        6, 'Gloss Bomb', 'Fenty Beauty', 'Lipgloss', 'Fenty Glow', 'Glossy',
        'All', '2027-08-20', 'Universal gloss topper.'
    );

-- 6) Look-product mapping
INSERT INTO look_products (id, look_id, product_id, usage_notes)
VALUES
    (1, 1, 1, 'Primary foundation for medium warm skin.'),
    (2, 1, 2, 'Use under-eye and center of face.'),
    (3, 1, 3, 'Champagne shimmer on center lid.'),
    (4, 2, 1, 'Mix with moisturizer for editorial skin prep.'),
    (5, 2, 4, 'Warm contour placement on temples and jawline.'),
    (6, 2, 6, 'Gloss finish over nude liner.'),
    (7, 3, 2, 'Minimal spot concealing.'),
    (8, 3, 5, 'Final set for natural sheen.');

-- 7) Productions
INSERT INTO productions (
    id, production_name, production_type, director_name, producer_name,
    start_date, end_date, location, notes
)
VALUES
    (
        1, 'Echoes of Midnight', 'Film', 'Darius Cole', 'Mina Hart',
        '2026-05-01', '2026-06-15', 'Stage 4, Silverline Studios',
        'Night scenes require camera-safe matte skin and continuity precision.'
    ),
    (
        2, 'Lumen Skin Campaign', 'Photoshoot', 'Jules Rivers', 'Ari Stone',
        '2026-05-18', '2026-05-22', 'Loft Set B',
        'Beauty campaign with close-up macro shots and reflective lighting.'
    ),
    (
        3, 'Velvet Curtain Revival', 'Theater', 'Naomi Vale', 'Chris Bell',
        '2026-04-01', '2026-07-30', 'Grandview Theater',
        'Stage makeup focused on long wear and distance visibility.'
    );

-- 8) Shoot days / call windows
INSERT INTO shoot_days (
    id, production_id, shoot_date, call_time, wrap_time, int_ext,
    shoot_type, location, weather_notes, scene_summary
)
VALUES
    (
        1, 1, '2026-05-14', '05:30', '19:00', 'Interior',
        'Film', 'Stage 4 - Apartment Set', 'Controlled indoor environment.',
        'Lead confrontation sequence with heavy close-ups.'
    ),
    (
        2, 2, '2026-05-20', '07:00', '16:00', 'Exterior',
        'Photoshoot', 'Loft Rooftop + Window Bay', 'Partly cloudy, variable daylight.',
        'Golden-hour skin campaign looks and product hero shots.'
    ),
    (
        3, 3, '2026-04-10', '10:00', '22:00', 'Interior',
        'Theater', 'Grandview Theater Main Stage', 'Warm house lights, dry air.',
        'Dress rehearsal for act 1 and 2 transitions.'
    );

-- 9) Call sheets
INSERT INTO call_sheets (
    id, shoot_day_id, call_sheet_file, crew_call_time, talent_call_time, notes
)
VALUES
    (
        1, 1, 'https://docs.example.com/callsheets/echoes-midnight-day14.pdf',
        '05:30', '06:15', 'FX touchups scheduled before scene 17.'
    ),
    (
        2, 2, 'https://docs.example.com/callsheets/lumen-campaign-day3.pdf',
        '07:00', '07:45', 'Hair/makeup rotation every 90 minutes.'
    ),
    (
        3, 3, 'https://docs.example.com/callsheets/velvet-revival-rehearsal.pdf',
        '10:00', '11:00', 'Quick-change stations confirmed stage left.'
    );

-- 10) Script sides
INSERT INTO script_sides (
    id, production_id, shoot_day_id, scene_number, page_number,
    script_file_url, sides_file_url, script_excerpt, continuity_notes
)
VALUES
    (
        1, 1, 1, '17A', '45-46',
        'https://files.example.com/scripts/echoes-midnight-full-script-v12.pdf',
        'https://files.example.com/sides/echoes-midnight-scene-17A.pdf',
        'INT. APARTMENT - NIGHT. She steps under the flickering hallway light.',
        'Maintain slight under-eye smudge and left-cheek bruise continuity.'
    ),
    (
        2, 1, 1, '18', '47',
        'https://files.example.com/scripts/echoes-midnight-full-script-v12.pdf',
        'https://files.example.com/sides/echoes-midnight-scene-18.pdf',
        'INT. APARTMENT - LATER. Close-up monologue at kitchen island.',
        'Reduce forehead shine for extreme close-up lens.'
    ),
    (
        3, 3, 3, 'ACT1-SC4', '12',
        'https://files.example.com/scripts/velvet-curtain-script-revival.pdf',
        'https://files.example.com/sides/velvet-curtain-act1-sc4.pdf',
        'Stage direction: Actor enters from upstage in spotlight.',
        'Increase blush intensity by one level for stage distance.'
    );

-- 11) Character makeup tracking
INSERT INTO character_makeup (
    id, production_id, character_name, actor_name, makeup_description,
    fx_makeup, continuity_notes, reference_photo
)
VALUES
    (
        1, 1, 'Elena Cross', 'Maya Johnson',
        'Soft matte base, taupe contour, subtle fatigue detailing under eyes.',
        1, 'Keep bruise depth consistent in scenes 17A-19.',
        'https://images.example.com/continuity/elena-cross-ref.jpg'
    ),
    (
        2, 2, 'Campaign Model A', 'Sofia Ramirez',
        'Radiant skin finish with bronzed perimeter and glossy nude lip.',
        0, 'Highlight placement must align with key light direction.',
        'https://images.example.com/continuity/campaign-model-a-ref.jpg'
    ),
    (
        3, 3, 'Lady Marlowe', 'Chloe Williams',
        'Classic stage contour with defined brows and satin red lip.',
        0, 'Lip shape must remain symmetrical across acts.',
        'https://images.example.com/continuity/lady-marlowe-ref.jpg'
    );

-- 12) Effects makeup
INSERT INTO effects_makeup (
    id, character_id, effect_type, materials_used, application_time_minutes, removal_notes
)
VALUES
    (
        1, 1, 'Bruise', 'Alcohol palette, stipple sponge, fixing spray', 18,
        'Remove with oil cleanser; avoid aggressive rubbing.'
    ),
    (
        2, 1, 'Cut', 'Silicone scar wax, blood gel, sealant', 25,
        'Dissolve adhesive before lifting wax edges.'
    );

-- 13) Lighting conditions
INSERT INTO lighting_conditions (id, shoot_day_id, lighting_type, lighting_notes)
VALUES
    (1, 1, 'LED', 'Cool LED practicals around kitchen set.'),
    (2, 1, 'Harsh', 'Single overhead source creates sharp shadow under eyes.'),
    (3, 2, 'Natural', 'Direct daylight near noon, reflected by white bounce.'),
    (4, 2, 'Warm', 'Golden-hour warmth after 18:30 for hero shots.'),
    (5, 3, 'Studio', 'Theater spotlights with warm front wash.');

-- 14) Continuity photos
INSERT INTO continuity_photos (
    id, character_id, shoot_day_id, image_url, angle_notes, makeup_notes
)
VALUES
    (
        1, 1, 1,
        'https://images.example.com/continuity/elena-day14-front.jpg',
        'Front neutral, lens height eye-level.',
        'Bruise centered on left cheekbone; under-eye smudge at 40% intensity.'
    ),
    (
        2, 1, 1,
        'https://images.example.com/continuity/elena-day14-left.jpg',
        'Left profile, key light side.',
        'Scar edge blended along zygomatic line.'
    ),
    (
        3, 2, 2,
        'https://images.example.com/continuity/campaign-a-day3-front.jpg',
        'Front with reflector fill.',
        'Gloss concentration at center lip; cheek highlight soft.'
    );

-- 15) Upload registry
INSERT INTO uploads (
    id, uploaded_by, original_filename, mime_type, file_size_bytes, storage_url, checksum_sha256
)
VALUES
    (
        1, 2, 'echoes-midnight-full-script-v12.pdf', 'application/pdf', 2489012,
        'https://files.example.com/scripts/echoes-midnight-full-script-v12.pdf',
        'sha256-demo-script-001'
    ),
    (
        2, 2, 'echoes-midnight-scene-17A.pdf', 'application/pdf', 423881,
        'https://files.example.com/sides/echoes-midnight-scene-17A.pdf',
        'sha256-demo-sides-017a'
    ),
    (
        3, 3, 'lighting-plot-day3.png', 'image/png', 190222,
        'https://files.example.com/lighting/lumen-day3-plot.png',
        'sha256-demo-lighting-003'
    ),
    (
        4, 2, 'elena-face-chart-v2.png', 'image/png', 311902,
        'https://files.example.com/facecharts/elena-v2.png',
        'sha256-demo-facechart-002'
    );

-- 16) Upload links for entity input fields
INSERT INTO upload_links (
    id, upload_id, entity_type, entity_id, field_name, is_primary, notes
)
VALUES
    (1, 1, 'script_sides', 1, 'script_file_url', 1, 'Primary script for day 14 continuity prep.'),
    (2, 2, 'script_sides', 1, 'sides_file_url', 1, 'Scene-specific side for makeup continuity.'),
    (3, 3, 'lighting_conditions', 3, 'lighting_reference', 1, 'Lighting diagram tied to natural-light setup.'),
    (4, 4, 'character_makeup', 1, 'reference_photo', 1, 'Updated face chart before camera tests.');

-- 17) Appointments
INSERT INTO appointments (
    id, client_id, look_id, production_id, shoot_day_id, appointment_date,
    start_time, end_time, event_type, location, status,
    price, deposit_paid, deposit_amount, notes
)
VALUES
    (
        1, 1, 1, 1, 1, '2026-05-14 09:00:00',
        '09:00', '11:00', 'Wedding', 'Downtown Studio', 'Booked',
        250.00, 1, 100.00, 'Trial complete. Bring veil for final fitting.'
    ),
    (
        2, 2, 2, 2, 2, '2026-05-20 18:00:00',
        '18:00', '19:30', 'Photoshoot', 'Loft Set B', 'Booked',
        180.00, 0, 0.00, 'Focus on sunset eye and glossy lip.'
    ),
    (
        3, 3, 3, 3, 3, '2026-04-10 08:30:00',
        '08:30', '09:30', 'Corporate Headshots', 'On-site Office', 'Completed',
        120.00, 1, 60.00, 'Natural look approved by client.'
    );

-- 18) Appointment-product usage
INSERT INTO appointment_products (id, appointment_id, product_id, quantity_used)
VALUES
    (1, 1, 1, '2 pumps'),
    (2, 1, 2, '1/2 pump'),
    (3, 1, 3, 'Light lid placement'),
    (4, 2, 1, '1.5 pumps'),
    (5, 2, 4, 'Small brush amount'),
    (6, 2, 6, '1 applicator'),
    (7, 3, 2, 'Spot application'),
    (8, 3, 5, '3 sprays');

-- 19) Client history
INSERT INTO client_history (
    id, client_id, appointment_id, look_id,
    date, notes, client_feedback, would_recommend
)
VALUES
    (
        1, 3, 3, 3,
        '2026-04-10', 'Client arrived early and requested subtle coverage.',
        'Loved the skin finish and quick turnaround.', 1
    );

-- 20) Foundation shades
INSERT INTO foundation_shades (
    id, client_id, brand, shade_name, shade_code, undertone, notes
)
VALUES
    (1, 1, 'Fenty Beauty', 'Pro Filt''r Soft Matte', '290', 'Warm', 'Best match for event lighting.'),
    (2, 2, 'Dior', 'Backstage Face & Body', '3WO', 'Olive', 'Works well with bronzed look.'),
    (3, 3, 'Rare Beauty', 'Liquid Touch', '230N', 'Neutral', 'Lightweight coverage preferred.');

-- 21) Eyeshadow preferences (one row per client)
INSERT INTO eyeshadow_preferences (id, client_id, finish_preference, color_preference, notes)
VALUES
    (1, 1, 'Shimmer', 'Champagne and soft bronze', 'Avoid chunky glitter.'),
    (2, 2, 'Glitter', 'Copper and terracotta', 'Likes bold evening eye looks.'),
    (3, 3, 'Matte', 'Taupe and soft brown', 'Office-friendly tones only.');

-- 22) Lip preferences (one row per client)
INSERT INTO lip_preferences (
    id, client_id, lipstick_finish, lip_color_preference, lipgloss_preference, notes
)
VALUES
    (1, 1, 'Satin', 'Rosy nude', 1, 'Gloss only at center of lip.'),
    (2, 2, 'Glossy', 'Warm mauve', 1, 'Open to deeper evening shades.'),
    (3, 3, 'Matte', 'Peach nude', 0, 'Prefers transfer-resistant formulas.');

-- 23) Before and after photos
INSERT INTO before_after_photos (id, appointment_id, image_type, image_url, notes)
VALUES
    (1, 3, 'Before', 'https://images.example.com/appointments/3-before.jpg', 'Natural skin, no makeup.'),
    (2, 3, 'After', 'https://images.example.com/appointments/3-after.jpg', 'Finished natural corporate look.');

-- 24) Extra industry panel mock data (additive rows, not duplicates)

-- Additional productions
INSERT INTO productions (
    id, production_name, production_type, director_name, producer_name,
    start_date, end_date, location, notes
)
VALUES
    (
        4, 'Neon District', 'TV Show', 'Imani Frost', 'Logan Reid',
        '2026-06-01', '2026-09-15', 'Backlot City Blocks',
        'Cyberpunk palette; sweat-resistant base for long night shoots.'
    ),
    (
        5, 'Glass Orchid', 'Commercial', 'Tariq West', 'Lena Park',
        '2026-06-10', '2026-06-30', 'Studio K + Beach Exterior',
        'Clean beauty campaign with both daylight and tungsten setups.'
    );

-- Additional shoot days
INSERT INTO shoot_days (
    id, production_id, shoot_date, call_time, wrap_time, int_ext,
    shoot_type, location, weather_notes, scene_summary
)
VALUES
    (
        4, 4, '2026-06-03', '04:45', '18:30', 'Exterior',
        'Film', 'Backlot Alley Set', 'Humid morning, overcast until noon.',
        'Pilot episode chase sequence with practical rain effects.'
    ),
    (
        5, 4, '2026-06-05', '06:00', '20:00', 'Interior',
        'Film', 'Neon District Police Station Set', 'Climate controlled.',
        'Interrogation scenes requiring precise shine control.'
    ),
    (
        6, 5, '2026-06-12', '07:30', '17:00', 'Interior',
        'Photoshoot', 'Studio K Cyclorama', 'Dry, cool studio air.',
        'Beauty macro shots for skin texture campaign assets.'
    ),
    (
        7, 5, '2026-06-14', '05:15', '15:30', 'Exterior',
        'Photoshoot', 'North Beach Boardwalk', 'Windy; strong UV after 11:00.',
        'Lifestyle movement shots with ocean backlight.'
    );

-- Additional call sheets
INSERT INTO call_sheets (
    id, shoot_day_id, call_sheet_file, crew_call_time, talent_call_time, notes
)
VALUES
    (
        4, 4, 'https://docs.example.com/callsheets/neon-district-day03.pdf',
        '04:45', '05:30', 'Rain rigs active; waterproofing kit required.'
    ),
    (
        5, 5, 'https://docs.example.com/callsheets/neon-district-day05.pdf',
        '06:00', '06:45', 'Continuity checks each take due to perspiration FX.'
    ),
    (
        6, 6, 'https://docs.example.com/callsheets/glass-orchid-studio-day01.pdf',
        '07:30', '08:00', 'High-res closeups; powder and blot on standby.'
    ),
    (
        7, 7, 'https://docs.example.com/callsheets/glass-orchid-beach-day02.pdf',
        '05:15', '05:45', 'Wind/saltwater contingency plan included.'
    );

-- Additional script sides
INSERT INTO script_sides (
    id, production_id, shoot_day_id, scene_number, page_number,
    script_file_url, sides_file_url, script_excerpt, continuity_notes
)
VALUES
    (
        4, 4, 4, 'PILOT-12', '33-34',
        'https://files.example.com/scripts/neon-district-pilot-v6.pdf',
        'https://files.example.com/sides/neon-district-pilot-12.pdf',
        'EXT. ALLEY - PRE-DAWN. Rain streaks neon reflections across wet pavement.',
        'Maintain wet-look sheen without breaking down foundation.'
    ),
    (
        5, 4, 5, 'PILOT-19', '52',
        'https://files.example.com/scripts/neon-district-pilot-v6.pdf',
        'https://files.example.com/sides/neon-district-pilot-19.pdf',
        'INT. INTERROGATION ROOM - NIGHT. Close-up under overhead practical.',
        'Reduce forehead highlights by 20% between takes.'
    ),
    (
        6, 5, 6, 'COMM-A', '2',
        'https://files.example.com/scripts/glass-orchid-commercial-v3.pdf',
        'https://files.example.com/sides/glass-orchid-comm-a.pdf',
        'Model rotates toward lens for skin detail hero frame.',
        'Avoid shimmer particles that can blow out in macro lenses.'
    ),
    (
        7, 5, 7, 'COMM-B', '4',
        'https://files.example.com/scripts/glass-orchid-commercial-v3.pdf',
        'https://files.example.com/sides/glass-orchid-comm-b.pdf',
        'Boardwalk walking sequence against backlit sky.',
        'Reapply SPF-safe setting products every 90 minutes.'
    );

-- Additional character makeup tracking
INSERT INTO character_makeup (
    id, production_id, character_name, actor_name, makeup_description,
    fx_makeup, continuity_notes, reference_photo
)
VALUES
    (
        4, 4, 'Detective Sol', 'Sofia Ramirez',
        'Neutral matte complexion, defined brows, subtle cheek hollowing.',
        0, 'Maintain under-eye tone consistency in all night scenes.',
        'https://images.example.com/continuity/detective-sol-ref.jpg'
    ),
    (
        5, 4, 'Rook', 'Maya Johnson',
        'Smudged liner, controlled skin sheen, bruising on right jaw.',
        1, 'Bruise hue must match scene chronology progression.',
        'https://images.example.com/continuity/rook-ref.jpg'
    ),
    (
        6, 5, 'Model Prime', 'Chloe Williams',
        'Luminous complexion with satin finish and glossy coral lip.',
        0, 'Keep cupid''s bow highlight soft for 4K close-ups.',
        'https://images.example.com/continuity/model-prime-ref.jpg'
    );

-- Additional effects makeup
INSERT INTO effects_makeup (
    id, character_id, effect_type, materials_used, application_time_minutes, removal_notes
)
VALUES
    (
        3, 5, 'Bruise', 'Cream pigments, stipple brush, setting powder', 16,
        'Break down pigments with cleansing balm before soap.'
    ),
    (
        4, 5, 'Burn', 'Silicone transfer, alcohol paint, matte sealer', 32,
        'Use adhesive remover around prosthetic edges first.'
    );

-- Additional lighting conditions
INSERT INTO lighting_conditions (id, shoot_day_id, lighting_type, lighting_notes)
VALUES
    (6, 4, 'Cool', 'Blue neon practicals drive skin undertone shifts.'),
    (7, 4, 'Harsh', 'Top-down alley fixtures produce hard nose shadows.'),
    (8, 5, 'LED', 'Flicker-free LEDs at 5600K for interrogation coverage.'),
    (9, 6, 'Softbox', 'Large softbox wrap for texture-true skin rendering.'),
    (10, 6, 'Studio', 'Controlled key/fill ratio for macro beauty shots.'),
    (11, 7, 'Natural', 'Strong sun bounce from water after midday.'),
    (12, 7, 'Warm', 'Golden-hour backlight warms skin by sunset.');

-- Additional continuity photos
INSERT INTO continuity_photos (
    id, character_id, shoot_day_id, image_url, angle_notes, makeup_notes
)
VALUES
    (
        4, 4, 4,
        'https://images.example.com/continuity/detective-sol-day03-front.jpg',
        'Front neutral in alley practical light.',
        'Matte center face, soft contour, neutral lip.'
    ),
    (
        5, 5, 4,
        'https://images.example.com/continuity/rook-day03-right.jpg',
        'Right profile for bruise continuity.',
        'Jaw bruise saturation level 2 of 5.'
    ),
    (
        6, 5, 5,
        'https://images.example.com/continuity/rook-day05-front.jpg',
        'Front with overhead hard light.',
        'Increase bruise darkness to level 3 for later timeline.'
    ),
    (
        7, 6, 6,
        'https://images.example.com/continuity/model-prime-studio-front.jpg',
        'Front in softbox setup.',
        'Glow retained on high points only; no T-zone shine.'
    ),
    (
        8, 6, 7,
        'https://images.example.com/continuity/model-prime-beach-left.jpg',
        'Left profile in ocean backlight.',
        'SPF-safe powder touchup on forehead and chin.'
    );

-- Additional uploads
INSERT INTO uploads (
    id, uploaded_by, original_filename, mime_type, file_size_bytes, storage_url, checksum_sha256
)
VALUES
    (
        5, 2, 'neon-district-pilot-v6.pdf', 'application/pdf', 5212234,
        'https://files.example.com/scripts/neon-district-pilot-v6.pdf',
        'sha256-demo-script-nd-006'
    ),
    (
        6, 2, 'neon-district-pilot-12.pdf', 'application/pdf', 532881,
        'https://files.example.com/sides/neon-district-pilot-12.pdf',
        'sha256-demo-sides-nd-012'
    ),
    (
        7, 3, 'neon-district-pilot-19.pdf', 'application/pdf', 498112,
        'https://files.example.com/sides/neon-district-pilot-19.pdf',
        'sha256-demo-sides-nd-019'
    ),
    (
        8, 3, 'glass-orchid-commercial-v3.pdf', 'application/pdf', 1944032,
        'https://files.example.com/scripts/glass-orchid-commercial-v3.pdf',
        'sha256-demo-script-go-003'
    ),
    (
        9, 3, 'glass-orchid-comm-a.pdf', 'application/pdf', 290003,
        'https://files.example.com/sides/glass-orchid-comm-a.pdf',
        'sha256-demo-sides-go-a'
    ),
    (
        10, 3, 'neon-lighting-setup-day03.png', 'image/png', 265900,
        'https://files.example.com/lighting/neon-day03-setup.png',
        'sha256-demo-lighting-nd-03'
    ),
    (
        11, 2, 'rook-fx-facechart-v1.png', 'image/png', 346771,
        'https://files.example.com/facecharts/rook-fx-v1.png',
        'sha256-demo-facechart-rook-01'
    ),
    (
        12, 2, 'model-prime-beach-touchup-guide.jpg', 'image/jpeg', 188334,
        'https://files.example.com/guides/model-prime-beach-touchup-guide.jpg',
        'sha256-demo-guide-mp-beach'
    );

-- Additional upload links
INSERT INTO upload_links (
    id, upload_id, entity_type, entity_id, field_name, is_primary, notes
)
VALUES
    (5, 5, 'script_sides', 4, 'script_file_url', 1, 'Pilot master script linked to scene 12.'),
    (6, 6, 'script_sides', 4, 'sides_file_url', 1, 'Scene 12 sides for chase makeup continuity.'),
    (7, 7, 'script_sides', 5, 'sides_file_url', 1, 'Scene 19 sides for close-up sweat control.'),
    (8, 8, 'script_sides', 6, 'script_file_url', 1, 'Commercial script for macro beauty run.'),
    (9, 9, 'script_sides', 6, 'sides_file_url', 1, 'Shot list sides for studio day.'),
    (10, 10, 'lighting_conditions', 6, 'lighting_reference', 1, 'Lighting diagram for alley sequence.'),
    (11, 11, 'character_makeup', 5, 'reference_photo', 1, 'FX face chart for Rook continuity.'),
    (12, 12, 'shoot_days', 7, 'touchup_guide', 1, 'Outdoor reapplication cadence for beach unit.');

-- 25) Looks morgue
INSERT INTO looks_morgue (
    id, look_name, category, difficulty, skin_tone_tags, occasion_tags,
    image_url, gallery_urls, products_used, color_palette, created_by
)
VALUES
    (
        1,
        'Bronzed Goddess',
        'Bridal',
        'Intermediate',
        '["medium","deep","olive"]',
        '["wedding","engagement"]',
        '/images/morgue/bronzed_goddess_main.jpg',
        '["/images/morgue/bronzed_goddess_1.jpg","/images/morgue/bronzed_goddess_2.jpg"]',
        '[{"product":"Fenty Pro Filt''r","type":"Foundation"},{"product":"NARS Laguna","type":"Bronzer"}]',
        '["#C68642","#8D5524","#E0AC69"]',
        'MUA Vault Team'
    ),
    (
        2,
        '90s Supermodel',
        'Editorial',
        'Pro',
        '["light","medium","deep"]',
        '["photoshoot","runway"]',
        '/images/morgue/90s_super.jpg',
        '["/images/morgue/90s_super_1.jpg","/images/morgue/90s_super_2.jpg"]',
        '[{"product":"MAC Lip Pencil","type":"Lip"},{"product":"Huda Palette","type":"Eyeshadow"}]',
        '["#8B4513","#F5DEB3","#000000"]',
        'MUA Vault Team'
    ),
    (
        3,
        'Clean Girl Glow',
        'Everyday',
        'Beginner',
        '["light","medium","deep"]',
        '["work","brunch"]',
        '/images/morgue/clean_girl.jpg',
        '["/images/morgue/clean_girl_1.jpg","/images/morgue/clean_girl_2.jpg"]',
        '[{"product":"Rare Beauty Tint","type":"Base"},{"product":"Tower 28 Gloss","type":"Lip"}]',
        '["#FADADD","#E6BE8A","#FFFFFF"]',
        'MUA Vault Team'
    );

-- 26) Look morgue assignments
INSERT INTO look_morgue_assignments (
    id, look_morgue_id, client_id, assigned_by, notes
)
VALUES
    (1, 1, 1, 2, 'Assigned for bridal trial board.'),
    (2, 2, 2, 3, 'Editorial reference for campaign moodboard.');

COMMIT;

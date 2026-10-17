-- ==============================================================================
-- MANAVAI TVK (V) - SUPABASE DATABASE SCHEMA
-- Run this complete script in your Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. TABLE: profiles (Users Table)
-- Stores Google Auth user details (Name, Email, Profile Photo) + Mobile Number
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  district TEXT DEFAULT 'Chennai',
  ward TEXT DEFAULT 'Ward 4, Anna Nagar',
  preferred_language TEXT DEFAULT 'ta',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for phone and email lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- 3. TABLE: complaints (Grievances filed by citizens)
-- Includes category, title, description, GPS location, Google Maps URL, photos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,                       -- e.g. 'TN-2026-004821'
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,                    -- 'streetLights', 'water', 'drainage', 'garbage', 'roads', etc.
  category_key TEXT,
  status TEXT DEFAULT 'inProgress' NOT NULL, -- 'pending', 'inProgress', 'resolved', 'rejected'
  title_en TEXT NOT NULL,
  title_ta TEXT,
  desc_en TEXT,
  desc_ta TEXT,
  landmark_en TEXT,
  landmark_ta TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_maps_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,          -- Array of citizen uploaded photo URLs
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. TABLE: complaint_updates (Admin Updates & Progress Photos)
-- Supports UNLIMITED admin photos and messages per update
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id TEXT REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  admin_name TEXT DEFAULT 'Ward Official / TVK Grievance Cell',
  status TEXT,                               -- e.g. 'inProgress', 'resolved'
  title_en TEXT NOT NULL,
  title_ta TEXT,
  message_en TEXT NOT NULL,
  message_ta TEXT,
  admin_photos JSONB DEFAULT '[]'::jsonb,    -- Unlimited admin proof/inspection photos
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint_id ON public.complaint_updates(complaint_id);

-- ------------------------------------------------------------------------------
-- 5. TABLE: notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  complaint_id TEXT REFERENCES public.complaints(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ta TEXT,
  message_en TEXT NOT NULL,
  message_ta TEXT,
  icon TEXT DEFAULT 'notifications',
  icon_color TEXT DEFAULT '#D32F2F',
  is_unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. ENABLE ROW LEVEL SECURITY (RLS) & DEV POLICIES
-- Configured for easy development and full access during testing
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public / anon read and write for testing
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on complaints" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on complaints" ON public.complaints FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on complaint_updates" ON public.complaint_updates FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on complaint_updates" ON public.complaint_updates FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for live admin updates and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ------------------------------------------------------------------------------
-- 7. SEED DATA (Initial demo user, complaints, and admin updates with photos)
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (id, name, email, phone, avatar_url, district, ward, preferred_language)
VALUES (
  'user_tvk_demo',
  'Karthik Selvam',
  'karthik.selvam@gmail.com',
  '+91 98765 43210',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'Chennai',
  'Ward 4, Anna Nagar',
  'ta'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone;

INSERT INTO public.complaints (
  id,
  user_id,
  category,
  category_key,
  status,
  title_en,
  title_ta,
  desc_en,
  desc_ta,
  landmark_en,
  landmark_ta,
  latitude,
  longitude,
  google_maps_url,
  photos
)
VALUES
(
  'TN-2026-004821',
  'user_tvk_demo',
  'streetLights',
  'streetLights',
  'inProgress',
  'Damaged Post - Ward 4, Anna Nagar',
  'சேதமடைந்த மின்கம்பம் - வார்டு 4, அண்ணா நகர்',
  'Damaged metal electric post leaning dangerously towards Anna Park boundary wall. Sparking observed during recent rain.',
  'அண்ணா பூங்கா சுவரை நோக்கி ஆபத்தான முறையில் சாய்ந்துள்ள இரும்பு மின் கம்பம். மழை நேரத்தில் தீப்பொறி பறக்கிறது.',
  'Opposite to Gate 2, Anna Park Main Road, Anna Nagar',
  'கேட் 2 எதிரில், அண்ணா பூங்கா பிரதான சாலை, அண்ணா நகர்',
  13.0850,
  80.2101,
  'https://www.google.com/maps?q=13.0850,80.2101',
  '["https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80"]'::jsonb
),
(
  'TN-2026-004682',
  'user_tvk_demo',
  'garbage',
  'garbage',
  'inProgress',
  'Garbage Pile Overflow on corner street',
  'தெரு முனையில் குப்பைகள் தேக்கம்',
  'Large overflow of waste accumulating near street corner creating foul smell.',
  'தெரு முனையில் அதிக அளவில் குப்பைகள் தேங்கி துர்நாற்றம் வீசுகிறது.',
  'Corner Street, Anna Nagar West',
  'முனைத் தெரு, அண்ணா நகர் மேற்கு',
  13.0872,
  80.2054,
  'https://www.google.com/maps?q=13.0872,80.2054',
  '["https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80"]'::jsonb
),
(
  'TN-2026-004712',
  'user_tvk_demo',
  'water',
  'water',
  'resolved',
  'Water Pipe Leakage - Gandhi Road',
  'குடிநீர் குழாய் கசிவு - காந்தி சாலை',
  'Main distribution pipe leakage causing water waste.',
  'முக்கிய விநியோகக் குழாயில் உடைப்பு ஏற்பட்டு குடிநீர் வீணாகிறது.',
  'Gandhi Road, Near Bus Terminus',
  'காந்தி சாலை, பேருந்து நிலையம் அருகே',
  13.0831,
  80.2140,
  'https://www.google.com/maps?q=13.0831,80.2140',
  '["https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Seed Admin Progress Updates & Unlimited Photos
INSERT INTO public.complaint_updates (
  complaint_id,
  admin_name,
  status,
  title_en,
  title_ta,
  message_en,
  message_ta,
  admin_photos
)
VALUES
(
  'TN-2026-004821',
  'Ward 12 Engineer - AE Senthil Kumar',
  'inProgress',
  'Inspection Completed & Crew Dispatched',
  'கள ஆய்வு நிறைவு & குழுவினர் அனுப்பப்பட்டுள்ளனர்',
  'Our inspection team visited the spot and cordoned off the sparking area. New replacement post arriving today.',
  'எங்கள் ஆய்வு குழுவினர் களத்திற்கு சென்று ஆய்வு செய்து பாதுகாப்பு வளையம் அமைத்தனர். புதிய மின்கம்பம் இன்று பொருத்தப்படும்.',
  '[
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"
  ]'::jsonb
),
(
  'TN-2026-004712',
  'Metro Water Maintenance Head',
  'resolved',
  'Leakage Repaired & Valve Replaced',
  'கசிவு சரிசெய்யப்பட்டது & வால்வு மாற்றப்பட்டது',
  'Defective joint was welded and secondary pressure valve replaced. Normal water supply restored.',
  'பழுதடைந்த குழாய் இணைக்கப்பட்டு புதிய வால்வு பொருத்தப்பட்டது. குடிநீர் விநியோகம் சீரமைக்கப்பட்டது.',
  '[
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Seed Notifications
INSERT INTO public.notifications (
  user_id,
  complaint_id,
  title_en,
  title_ta,
  message_en,
  message_ta,
  icon,
  icon_color,
  is_unread
)
VALUES
(
  'user_tvk_demo',
  'TN-2026-004821',
  'Inspection Team Assigned',
  'ஆய்வுக் குழு ஒதுக்கப்பட்டுள்ளது',
  'AE Senthil Kumar dispatched for damaged post inspection.',
  'சேதமடைந்த மின்கம்பத்தை ஆய்வு செய்ய உதவி பொறியாளர் நியமிக்கப்பட்டுள்ளார்.',
  'notifications',
  '#D32F2F',
  true
),
(
  'user_tvk_demo',
  'TN-2026-004712',
  'Grievance Resolved',
  'புகார் சரிசெய்யப்பட்டது',
  'Water pipe leakage on Gandhi Road has been repaired.',
  'காந்தி சாலையில் குடிநீர் குழாய் கசிவு வெற்றிகரமாக சரிசெய்யப்பட்டது.',
  'checkmark-circle',
  '#10B981',
  false
)
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'MANAVAI TVK (V) Database Schema and Seed Data Loaded Successfully!' AS result;

-- Supabase PostgreSQL Schema for Masjid Donation Platform
-- Run this in Supabase Dashboard → SQL Editor

-- ── CAMPAIGNS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  "goalAmount" DOUBLE PRECISION DEFAULT 0,
  "raisedAmount" DOUBLE PRECISION DEFAULT 0,
  "donorCount" INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  "endDate" TEXT DEFAULT '',
  "imageUrl" TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ── DONATIONS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "donorName" TEXT DEFAULT 'Anonymous',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  amount DOUBLE PRECISION NOT NULL,
  "campaignId" TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  "donationType" TEXT DEFAULT 'one-time',
  "paymentMethod" TEXT DEFAULT 'card',
  message TEXT DEFAULT '',
  anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  "approvedBy" TEXT DEFAULT '',
  "approvedAt" TEXT DEFAULT '',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ── CONTACTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT DEFAULT 'General Enquiry',
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  ip TEXT DEFAULT 'unknown',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ── VOLUNTEERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  roles JSONB DEFAULT '[]'::jsonb,
  availability JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ── NEWSLETTER ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ── ADMIN USERS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  "displayName" TEXT DEFAULT '',
  email TEXT DEFAULT '',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ── SEED DEFAULT ADMIN USERS ───────────────────────────────────────────────
INSERT INTO admin_users (username, password, role, "displayName")
VALUES ('superadmin', 'super123', 'super_admin', 'Super Admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO admin_users (username, password, role, "displayName")
VALUES ('admin', 'admin123', 'admin', 'Admin')
ON CONFLICT (username) DO NOTHING;

-- ── INDEXES FOR PERFORMANCE ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations (status);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations ("campaignId");
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns (active);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter (active);
CREATE INDEX IF NOT EXISTS idx_contacts_read ON contacts (read);

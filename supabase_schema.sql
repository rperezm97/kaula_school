-- ============================================================
-- Kaula School — Supabase / PostgreSQL Schema
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ─── Enum types ─────────────────────────────────────────────
CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE subscription_tier AS ENUM ('none', 'lower', 'mid', 'premium');
CREATE TYPE subscription_status AS ENUM ('none', 'active', 'past_due', 'canceled', 'trialing');
CREATE TYPE required_tier AS ENUM ('none', 'lower', 'mid', 'premium');
CREATE TYPE email_status AS ENUM ('sent', 'failed', 'pending');

-- ─── Auto-update trigger (replaces MySQL ON UPDATE CURRENT_TIMESTAMP) ──
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Users ──────────────────────────────────────────────────
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  "openId"        VARCHAR(64)  NOT NULL UNIQUE,
  name            TEXT,
  email           VARCHAR(320) UNIQUE,
  "passwordHash"  VARCHAR(255),
  "loginMethod"   VARCHAR(64),
  role            role NOT NULL DEFAULT 'user',
  "stripeCustomerId"     VARCHAR(255),
  "subscriptionTier"     subscription_tier NOT NULL DEFAULT 'none',
  "subscriptionStatus"   subscription_status NOT NULL DEFAULT 'none',
  "stripeSubscriptionId" VARCHAR(255),
  "contractAcceptedAt"   TIMESTAMPTZ,
  "resetToken"           VARCHAR(255),
  "resetTokenExpiresAt"  TIMESTAMPTZ,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastSignedIn"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Sections ───────────────────────────────────────────────
CREATE TABLE sections (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  description   TEXT,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "parentId"    INTEGER,
  "iconName"    VARCHAR(64),
  "requiredTier" required_tier NOT NULL DEFAULT 'none',
  "isVisible"   BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER sections_set_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Videos ─────────────────────────────────────────────────
CREATE TABLE videos (
  id                    SERIAL PRIMARY KEY,
  "sectionId"           INTEGER NOT NULL,
  title                 VARCHAR(255) NOT NULL,
  slug                  VARCHAR(255) NOT NULL UNIQUE,
  description           TEXT,
  "googleDriveFileId"   VARCHAR(255),
  "googleDriveUrl"      TEXT,
  "cloudflareStreamId"  VARCHAR(255),
  "streamStatus"        VARCHAR(64),
  "subtitleUrl"         TEXT,
  "thumbnailUrl"        TEXT,
  "durationSeconds"     INTEGER,
  "sortOrder"           INTEGER NOT NULL DEFAULT 0,
  "requiredTier"        required_tier NOT NULL DEFAULT 'none',
  "isVisible"           BOOLEAN NOT NULL DEFAULT TRUE,
  "relatedVideoIds"     JSONB,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER videos_set_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Resources ──────────────────────────────────────────────
CREATE TABLE resources (
  id             SERIAL PRIMARY KEY,
  "sectionId"    INTEGER,
  "videoId"      INTEGER,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  "fileUrl"      TEXT NOT NULL,
  "fileType"     VARCHAR(64) NOT NULL,
  "fileSize"     INTEGER,
  "requiredTier" required_tier NOT NULL DEFAULT 'none',
  "isVisible"    BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder"    INTEGER NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER resources_set_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── User Progress ───────────────────────────────────────────
CREATE TABLE user_progress (
  id               SERIAL PRIMARY KEY,
  "userId"         INTEGER NOT NULL,
  "videoId"        INTEGER NOT NULL,
  "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
  completed        BOOLEAN NOT NULL DEFAULT FALSE,
  "lastWatchedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX user_progress_user_idx ON user_progress ("userId");
CREATE INDEX user_progress_video_idx ON user_progress ("videoId");

CREATE TRIGGER user_progress_set_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Bookmarks ──────────────────────────────────────────────
CREATE TABLE bookmarks (
  id          SERIAL PRIMARY KEY,
  "userId"    INTEGER NOT NULL,
  "videoId"   INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX bookmarks_user_idx ON bookmarks ("userId");

-- ─── Newsletter Subscribers ──────────────────────────────────
CREATE TABLE newsletter_subscribers (
  id               SERIAL PRIMARY KEY,
  email            VARCHAR(320) NOT NULL UNIQUE,
  name             TEXT,
  "isActive"       BOOLEAN NOT NULL DEFAULT TRUE,
  "subscribedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "unsubscribedAt" TIMESTAMPTZ
);

-- ─── Email Log ──────────────────────────────────────────────
CREATE TABLE email_log (
  id               SERIAL PRIMARY KEY,
  "recipientEmail" VARCHAR(320) NOT NULL,
  subject          VARCHAR(500) NOT NULL,
  "templateName"   VARCHAR(100),
  status           email_status NOT NULL DEFAULT 'pending',
  "errorMessage"   TEXT,
  "sentAt"         TIMESTAMPTZ,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Video Notes ─────────────────────────────────────────────
CREATE TABLE video_notes (
  id                 SERIAL PRIMARY KEY,
  "userId"           INTEGER NOT NULL,
  "videoId"          INTEGER NOT NULL,
  content            TEXT NOT NULL,
  "timestampSeconds" INTEGER,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX video_notes_user_idx  ON video_notes ("userId");
CREATE INDEX video_notes_video_idx ON video_notes ("videoId");

CREATE TRIGGER video_notes_set_updated_at
  BEFORE UPDATE ON video_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Programs ────────────────────────────────────────────────
CREATE TABLE programs (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  description      TEXT,
  "stripePriceId"  VARCHAR(255),
  "stripeProductId" VARCHAR(255),
  price            INTEGER,
  currency         VARCHAR(3) DEFAULT 'eur',
  "isVisible"      BOOLEAN NOT NULL DEFAULT FALSE,
  "thumbnailUrl"   TEXT,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER programs_set_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── User Program Access ─────────────────────────────────────
CREATE TABLE user_program_access (
  id                       SERIAL PRIMARY KEY,
  "userId"                 INTEGER NOT NULL,
  "programId"              INTEGER NOT NULL,
  "stripePaymentIntentId"  VARCHAR(255),
  "grantedAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "expiresAt"              TIMESTAMPTZ
);

-- ─── Make yourself admin after registering ───────────────────
-- Run this after you create your account:
-- UPDATE users SET role = 'admin' WHERE email = 'feral.awareness@gmail.com';

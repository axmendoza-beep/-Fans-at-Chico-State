-- Enable required extensions (uncomment if needed)
-- pgcrypto provides gen_random_uuid(); use uuid-ossp or other generator if preferred
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enum types
CREATE TYPE app_group_chat_setting AS ENUM ('all', 'mentions', 'none');
CREATE TYPE app_venue_type AS ENUM ('dorm', 'lounge', 'bar', 'house');
CREATE TYPE app_event_visibility AS ENUM ('public');
-- If visibility may include private or other values in future, add them here.
CREATE TYPE app_rsvp_status AS ENUM ('going', 'cancelled');
CREATE TYPE app_reminder_channel AS ENUM ('email', 'sms');
CREATE TYPE app_reminder_cadence AS ENUM ('daily', 'weekly', 'biweekly');
CREATE TYPE app_group_role AS ENUM ('member', 'moderator', 'owner');
CREATE TYPE app_report_category AS ENUM ('harassment', 'spam', 'off_topic', 'safety', 'other');
CREATE TYPE app_report_routed_to AS ENUM ('moderator', 'admin');
CREATE TYPE app_report_status AS ENUM ('open', 'escalated', 'resolved', 'dismissed');

-- Optional: sports enum (if you prefer to constrain sport values)
-- CREATE TYPE app_sport AS ENUM ('football', 'basketball', 'baseball', 'soccer', 'other');

-- Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL, -- duplicated for quick access; auth.users.email also exists
  email_verified boolean NOT NULL DEFAULT FALSE,
  password_hash text NOT NULL, -- hashed password if you manage auth outside Supabase; usually not required with Supabase Auth
  display_name text,
  bio text,
  major text,
  hometown text,
  dob date,
  profile_photo_url text,
  followed_team_events boolean NOT NULL DEFAULT true,
  trending_opt_in boolean NOT NULL DEFAULT false,
  group_chat_setting app_group_chat_setting NOT NULL DEFAULT 'mentions',
  allow_email boolean NOT NULL DEFAULT true,
  allow_sms boolean NOT NULL DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Chico-only unique email constraint (partial unique index) 
-- Enforces uniqueness only for emails at chico.edu domain
CREATE UNIQUE INDEX IF NOT EXISTS profiles_chico_email_unique
  ON public.profiles ((lower(email)))
  WHERE lower(email) LIKE '%@chico.edu';

-- Additional index for email lookup
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles ((lower(email)));

-- FollowedTeam
CREATE TABLE IF NOT EXISTS public.followed_teams (
  followed_team_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  sport text NOT NULL,
  team_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS followed_teams_user_idx ON public.followed_teams (user_id);

-- Venue
CREATE TABLE IF NOT EXISTS public.venues (
  venue_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  creator_email text,
  type app_venue_type NOT NULL,
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  food_options text,
  parking_notes text,
  atmosphere_rating smallint CHECK (atmosphere_rating >= 1 AND atmosphere_rating <= 5),
  proximity_notes text,
  capacity integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venues_name_idx ON public.venues (lower(name));
CREATE INDEX IF NOT EXISTS venues_location_idx ON public.venues (latitude, longitude);

-- VenueReview
CREATE TABLE IF NOT EXISTS public.venue_reviews (
  review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (venue_id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body varchar(250),
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venue_reviews_venue_idx ON public.venue_reviews (venue_id);
CREATE INDEX IF NOT EXISTS venue_reviews_user_idx ON public.venue_reviews (user_id);

-- Event
CREATE TABLE IF NOT EXISTS public.events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  venue_id uuid NOT NULL REFERENCES public.venues (venue_id) ON DELETE SET NULL,
  sport text NOT NULL,
  game_name text NOT NULL,
  start_time timestamptz NOT NULL,
  description text,
  capacity integer,
  food_drinks text,
  is_twentyone_plus boolean NOT NULL DEFAULT false,
  visibility app_event_visibility NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_host_idx ON public.events (host_user_id);
CREATE INDEX IF NOT EXISTS events_venue_idx ON public.events (venue_id);
CREATE INDEX IF NOT EXISTS events_start_time_idx ON public.events (start_time);

-- EventVote (Trending)
CREATE TABLE IF NOT EXISTS public.event_votes (
  event_vote_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (event_id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  value smallint NOT NULL CHECK (value IN (-1, 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id) -- 1 vote per user per event
);

CREATE INDEX IF NOT EXISTS event_votes_event_idx ON public.event_votes (event_id);
CREATE INDEX IF NOT EXISTS event_votes_user_idx ON public.event_votes (user_id);

-- RSVP
CREATE TABLE IF NOT EXISTS public.rsvps (
  rsvp_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (event_id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  name_at_rsvp text,
  email_at_rsvp text,
  status app_rsvp_status NOT NULL DEFAULT 'going',
  reminder_enabled boolean NOT NULL DEFAULT false,
  reminder_channel app_reminder_channel,
  reminder_cadence app_reminder_cadence,
  next_reminder_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id) -- one RSVP per user per event
);

CREATE INDEX IF NOT EXISTS rsvps_event_idx ON public.rsvps (event_id);
CREATE INDEX IF NOT EXISTS rsvps_user_idx ON public.rsvps (user_id);

-- Group
CREATE TABLE IF NOT EXISTS public.groups (
  group_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sport text NOT NULL,
  team text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS groups_name_idx ON public.groups (lower(name));

-- GroupMembership
CREATE TABLE IF NOT EXISTS public.group_memberships (
  membership_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (group_id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  role app_group_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_memberships_group_idx ON public.group_memberships (group_id);
CREATE INDEX IF NOT EXISTS group_memberships_user_idx ON public.group_memberships (user_id);

-- GroupMessage
CREATE TABLE IF NOT EXISTS public.group_messages (
  message_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (group_id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  body text NOT NULL,
  image_url text,
  is_removed boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  pinned_by_user_id uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  pinned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS group_messages_group_idx ON public.group_messages (group_id);
CREATE INDEX IF NOT EXISTS group_messages_user_idx ON public.group_messages (user_id);

-- Announcement
CREATE TABLE IF NOT EXISTS public.announcements (
  announcement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (group_id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS announcements_group_idx ON public.announcements (group_id);

-- GroupPoll
CREATE TABLE IF NOT EXISTS public.group_polls (
  poll_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (group_id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  question text NOT NULL,
  options_text text NOT NULL, -- store JSON or delimited list
  closes_at timestamptz,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS group_polls_group_idx ON public.group_polls (group_id);
CREATE INDEX IF NOT EXISTS group_polls_author_idx ON public.group_polls (author_user_id);

-- GroupPollVote
CREATE TABLE IF NOT EXISTS public.group_poll_votes (
  poll_vote_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.group_polls (poll_id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  selected_option text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_poll_votes_poll_idx ON public.group_poll_votes (poll_id);
CREATE INDEX IF NOT EXISTS group_poll_votes_user_idx ON public.group_poll_votes (user_id);

-- Report
CREATE TABLE IF NOT EXISTS public.reports (
  report_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  event_id uuid NOT NULL REFERENCES public.events (event_id) ON DELETE CASCADE,
  category app_report_category NOT NULL,
  routed_to app_report_routed_to NOT NULL,
  status app_report_status NOT NULL DEFAULT 'open',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS reports_reporter_idx ON public.reports (reporter_user_id);
CREATE INDEX IF NOT EXISTS reports_event_idx ON public.reports (event_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports (status);

-- Helpful FK/index sanity: create indexes on auth.users.id if not present (auth schema managed by Supabase)
-- Note: auth.users.id is already primary key in Supabase.

-- Example additional constraints you might want:
-- - Ensure dob implies age >= 21 when is_twentyone_plus = true for events or RSVPs.
--   This kind of cross-table enforced check is complex and better handled in app logic or via triggers.

-- Example trigger (optional): deny RSVP if event is 21+ and user is under 21.
-- Implement as needed with a SECURITY DEFINER function that checks dob.
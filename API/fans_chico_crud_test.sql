-- =========================================================
-- CRUD TEST QUERIES FOR "Fans at Chico State"
-- =========================================================

-- -------------------------------------------------------------
-- 🎯 PROFILES
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.profiles 
(user_id, email, email_verified, password_hash, display_name)
VALUES
(gen_random_uuid(), 'testuser@chico.edu', true, 'hash123', 'Test User')
RETURNING *;

-- READ
SELECT * FROM public.profiles LIMIT 10;

-- UPDATE
UPDATE public.profiles
SET bio = 'Updated bio testing CRUD.'
WHERE email = 'testuser@chico.edu'
RETURNING *;

-- DELETE
DELETE FROM public.profiles
WHERE email = 'testuser@chico.edu'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 FOLLOWED TEAMS
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.followed_teams (followed_team_id, user_id, sport, team_name)
VALUES (gen_random_uuid(),
    'cb6a19ef-ed0e-4d0b-a672-2779290dc8ae',
    'football', 
    '49ers')
RETURNING *;

-- READ
SELECT ft.*, p.display_name
FROM public.followed_teams ft
JOIN public.profiles p ON p.user_id = ft.user_id;

-- UPDATE
UPDATE public.followed_teams
SET team_name = 'Raiders'
WHERE sport = 'football'
RETURNING *;

-- DELETE
DELETE FROM public.followed_teams
WHERE team_name = 'Raiders'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 VENUES
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.venues (venue_id, name, type, atmosphere_rating)
VALUES (gen_random_uuid(), 'Test Lounge', 'lounge', 4)
RETURNING *;

-- READ
SELECT * FROM public.venues;

-- UPDATE
UPDATE public.venues
SET atmosphere_rating = 5
WHERE name = 'Test Lounge'
RETURNING *;

-- DELETE
DELETE FROM public.venues
WHERE name = 'Test Lounge'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 VENUE REVIEWS
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.venue_reviews (review_id, venue_id, user_id, rating, body)
SELECT gen_random_uuid(), venue_id, 'cb6a19ef-ed0e-4d0b-a672-2779290dc8ae', 5, 'Test review body'
FROM public.venues LIMIT 1
RETURNING *;

-- READ
SELECT vr.*, v.name AS venue_name
FROM public.venue_reviews vr
JOIN public.venues v ON v.venue_id = vr.venue_id;

-- UPDATE
UPDATE public.venue_reviews
SET body = 'Updated test review'
WHERE rating = 5
RETURNING *;

-- DELETE
DELETE FROM public.venue_reviews
WHERE body LIKE '%test%'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 EVENTS
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.events 
(event_id, host_user_id, venue_id, sport, game_name, start_time)
SELECT gen_random_uuid(), 
       'cb6a19ef-ed0e-4d0b-a672-2779290dc8ae',
       venue_id,
       'basketball',
       'Test Game',
       now() + interval '1 day'
FROM public.venues LIMIT 1
RETURNING *;

-- READ
SELECT e.*, v.name AS venue_name, p.display_name AS host
FROM public.events e
LEFT JOIN public.venues v ON v.venue_id = e.venue_id
LEFT JOIN public.profiles p ON p.user_id = e.host_user_id;

-- UPDATE
UPDATE public.events
SET description = 'Updated event description'
WHERE game_name = 'Test Game'
RETURNING *;

-- DELETE
DELETE FROM public.events
WHERE game_name = 'Test Game'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 EVENT VOTES
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.event_votes (event_vote_id, event_id, user_id, value)
SELECT gen_random_uuid(), event_id,
       '845f13f7-8cf2-4f7f-bc80-d72794486dbb', 1
FROM public.events LIMIT 1
RETURNING *;

-- READ
SELECT ev.*, e.game_name, p.display_name
FROM public.event_votes ev
JOIN public.events e ON e.event_id = ev.event_id
JOIN public.profiles p ON p.user_id = ev.user_id;

-- UPDATE
UPDATE public.event_votes
SET value = -1
WHERE value = 1
RETURNING *;

-- DELETE
DELETE FROM public.event_votes
WHERE value = -1
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 RSVPs
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.rsvps (rsvp_id, event_id, user_id, name_at_rsvp, email_at_rsvp)
SELECT gen_random_uuid(), event_id,
       'aaf043ce-cd54-4789-b051-94e52c291088',
       'Sam Tester', 'sam@chico.edu'
FROM public.events LIMIT 1
RETURNING *;

-- READ
SELECT r.*, e.game_name, p.display_name
FROM public.rsvps r
LEFT JOIN public.events e ON e.event_id = r.event_id
LEFT JOIN public.profiles p ON p.user_id = r.user_id;

-- UPDATE
UPDATE public.rsvps
SET status = 'cancelled'
WHERE name_at_rsvp = 'Sam Tester'
RETURNING *;

-- DELETE
DELETE FROM public.rsvps
WHERE name_at_rsvp = 'Sam Tester'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 GROUPS
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.groups (group_id, name, sport, description)
VALUES (gen_random_uuid(), 'Test Fan Club', 'soccer', 'Test description')
RETURNING *;

-- READ
SELECT * FROM public.groups;

-- UPDATE
UPDATE public.groups
SET description = 'Updated test group'
WHERE name = 'Test Fan Club'
RETURNING *;

-- DELETE
DELETE FROM public.groups
WHERE name = 'Test Fan Club'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 GROUP MEMBERSHIPS
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.group_memberships (membership_id, group_id, user_id, role)
SELECT gen_random_uuid(), group_id, 
       'cb6a19ef-ed0e-4d0b-a672-2779290dc8ae', 'member'
FROM public.groups LIMIT 1
RETURNING *;

-- READ
SELECT gm.*, g.name AS group_name, p.display_name
FROM public.group_memberships gm
JOIN public.groups g ON g.group_id = gm.group_id
JOIN public.profiles p ON p.user_id = gm.user_id;

-- UPDATE
UPDATE public.group_memberships
SET role = 'moderator'
WHERE role = 'member'
RETURNING *;

-- DELETE
DELETE FROM public.group_memberships
WHERE role = 'moderator'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 GROUP MESSAGES
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.group_messages (message_id, group_id, user_id, body)
SELECT gen_random_uuid(), group_id,
       'cb6a19ef-ed0e-4d0b-a672-2779290dc8ae',
       'Hello, testing group messages!'
FROM public.groups LIMIT 1
RETURNING *;

-- READ
SELECT gm.*, g.name AS group_name, p.display_name
FROM public.group_messages gm
JOIN public.groups g ON g.group_id = gm.group_id
JOIN public.profiles p ON p.user_id = gm.user_id;

-- UPDATE
UPDATE public.group_messages
SET body = 'Updated test message'
WHERE body LIKE '%testing%'
RETURNING *;

-- DELETE
DELETE FROM public.group_messages
WHERE body LIKE '%Updated%'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 ANNOUNCEMENTS
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.announcements (announcement_id, group_id, title, body)
SELECT gen_random_uuid(), group_id,
       'Test Announcement', 'Testing announcements table'
FROM public.groups LIMIT 1
RETURNING *;

-- READ
SELECT * FROM public.announcements;

-- UPDATE
UPDATE public.announcements
SET body = 'Updated announcement'
WHERE title = 'Test Announcement'
RETURNING *;

-- DELETE
DELETE FROM public.announcements
WHERE title = 'Test Announcement'
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 GROUP POLLS + POLL VOTES
-- -------------------------------------------------------------
-- CREATE POLL
INSERT INTO public.group_polls (poll_id, group_id, author_user_id, question, options_text)
SELECT gen_random_uuid(), group_id,
       'cb6a19ef-ed0e-4d0b-a672-2779290dc8ae',
       'Which venue?', '["Sutter","Bear","Commons"]'
FROM public.groups LIMIT 1
RETURNING *;

-- CREATE POLL VOTE
INSERT INTO public.group_poll_votes (poll_vote_id, poll_id, user_id, selected_option)
SELECT gen_random_uuid(), poll_id,
       '845f13f7-8cf2-4f7f-bc80-d72794486dbb', 'Sutter'
FROM public.group_polls LIMIT 1
RETURNING *;

-- READ
SELECT pv.*, gp.question, p.display_name
FROM public.group_poll_votes pv
JOIN public.group_polls gp ON gp.poll_id = pv.poll_id
JOIN public.profiles p ON p.user_id = pv.user_id;

-- UPDATE
UPDATE public.group_poll_votes
SET selected_option = 'Commons'
RETURNING *;

-- DELETE
DELETE FROM public.group_poll_votes
RETURNING *;

-- -------------------------------------------------------------
-- 🎯 REPORTS
-- -------------------------------------------------------------
-- CREATE
INSERT INTO public.reports (report_id, reporter_user_id, event_id, category, routed_to, description)
SELECT gen_random_uuid(),
       'cb6a19ef-ed0e-4d0b-a672-2779290dc8ae',
       event_id,
       'spam', 'admin', 'Test report'
FROM public.events LIMIT 1
RETURNING *;

-- READ
SELECT r.*, e.game_name, p.display_name
FROM public.reports r
JOIN public.events e ON e.event_id = r.event_id
JOIN public.profiles p ON p.user_id = r.reporter_user_id;

-- UPDATE
UPDATE public.reports
SET status = 'resolved', resolved_at = now()
WHERE description = 'Test report'
RETURNING *;

-- DELETE
DELETE FROM public.reports
WHERE description = 'Test report'
RETURNING *;

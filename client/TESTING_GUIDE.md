# Testing Guide - Fans at Chico State Client

## ✅ Setup Complete

All pages have been created and are ready to test!

## 🚀 How to Run

### 1. Make sure your API is running
In a separate terminal:
```bash
cd API
npm run dev
```
You should see: `🚀 Fans at Chico State API running on port 3000`

### 2. Start the React client
```bash
cd client
npm run dev
```

The app will open at: **http://localhost:5173**

## 📄 Pages Created

### 1. **Home** (`/`)
- Welcome page
- Feature overview
- Quick stats

### 2. **Events** (`/events`)
- **Browse**: View all watch party events
- **Create**: Add new events with form
- **RSVP**: One-click RSVP to events
- **Features**:
  - Lists all events with venue and host info
  - Shows event details (sport, time, description, 21+ status)
  - Create form with validation
  - Real-time data from API

### 3. **Venues** (`/venues`)
- **Browse**: View all watch party locations
- **Add**: Create new venues
- **Features**:
  - Venue types (dorm, lounge, bar, house)
  - Address and parking info
  - Food options
  - Atmosphere ratings (1-5 stars)

### 4. **Fan Groups** (`/groups`)
- **Browse**: View all fan groups
- **Create**: Start new groups
- **Join**: Become a member
- **Features**:
  - Group by sport
  - Member count
  - Join with one click

### 5. **Profile** (`/profile`)
- **Create Profile**: Sign up with Chico State email
- **Follow Teams**: Get notifications for favorite teams
- **View Profiles**: See all users
- **Features**:
  - Display name, major, bio
  - List of followed teams
  - Sports interests

### 6. **Notifications** (`/notifications`)
- **Followed Teams**: See teams you follow
- **Relevant Events**: Events matching your teams
- **Settings**: Configure notification preferences
- **Features**:
  - Filters events by followed teams
  - Email/Push/SMS toggles
  - Real-time event matching

### 7. **Report** (`/report`)
- **Submit Reports**: Report inappropriate content
- **Safety Guidelines**: Community rules
- **Age Filter Info**: 21+ event filtering
- **Features**:
  - Anonymous reporting
  - Category selection (spam, harassment, etc.)
  - 500 character description
  - Emergency contact info

## 🧪 Testing Workflow

### Test 1: Create and View Data
1. Go to **Profile** → Create a profile (note the user_id from browser console or API response)
2. Go to **Venues** → Add a venue (note the venue_id)
3. Go to **Events** → Create an event using the user_id and venue_id
4. Verify the event appears in the list with venue and host info

### Test 2: RSVP Flow
1. Go to **Events**
2. Click "RSVP" on any event
3. Enter your user_id
4. Check the API to verify RSVP was created: `curl http://localhost:3000/v1/rsvps`

### Test 3: Groups
1. Go to **Fan Groups**
2. Create a new group (e.g., "Warriors Fans", sport: "basketball")
3. Click "Join Group"
4. Enter your user_id
5. Verify membership was created

### Test 4: Notifications
1. Go to **Profile**
2. Follow a team (e.g., Warriors, basketball)
3. Go to **Notifications**
4. See events filtered by your followed teams

### Test 5: Reporting
1. Go to **Report**
2. Fill out the report form
3. Submit and verify it was created

## 🔍 What to Look For

### ✅ Working Features
- Navigation between all pages
- Data loads from API (you'll see existing data from your database)
- Forms submit successfully
- Error messages display when API calls fail
- All pages have clear titles and structure

### 📊 Data Display
Each page should show:
- Loading state while fetching data
- Error messages if API is down
- Empty states when no data exists
- List of items with details

## 🐛 Common Issues

### "Failed to load..." error
- Make sure API is running on port 3000
- Check API terminal for errors
- Verify .env.local has: `VITE_API_BASE=http://localhost:3000`

### "Failed to create..." error
- Check that you're using valid UUIDs for user_id and venue_id
- Look at API terminal for specific error messages
- Verify required fields are filled

### Page is blank
- Check browser console (F12) for errors
- Make sure npm run dev is running without errors

## 📝 Notes

- **No styling yet** - Pages use basic HTML/CSS for structure only
- **User IDs required** - You'll need to manually enter user IDs (copy from API or database)
- **Real data** - All data comes from your Supabase database via the API
- **No authentication yet** - Pages don't have login/logout (that's a future enhancement)

## ✨ Next Steps (After Testing)

Once you verify all pages work:
1. Add styling (CSS/Tailwind)
2. Add authentication
3. Improve form validation
4. Add search/filter functionality
5. Add pagination for large lists
6. Improve error handling
7. Add loading spinners

## 🎯 Success Criteria

You should be able to:
- ✅ Navigate to all 7 pages
- ✅ See data from your API on each page
- ✅ Create new items (events, venues, groups, profiles)
- ✅ View lists of items with details
- ✅ Perform actions (RSVP, Join Group, Follow Team, Report)
- ✅ See appropriate messages for loading/errors/empty states

Ready to test! 🚀

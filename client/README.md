# Fans at Chico State - Client

React frontend for the Fans at Chico State application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure your API is running on http://localhost:3000

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## Pages

- **Home** (`/`) - Welcome page with feature overview
- **Events** (`/events`) - Browse, create, and RSVP to watch parties
- **Venues** (`/venues`) - View and add watch party locations
- **Fan Groups** (`/groups`) - Join groups and connect with fans
- **Profile** (`/profile`) - Manage account and follow teams
- **Notifications** (`/notifications`) - View alerts for followed teams
- **Report** (`/report`) - Report inappropriate content

## Features Implemented

✅ All 6 PRD epics covered:
- Events (Create, RSVP, Browse)
- Locations/Venues (Details, Add)
- Fan Groups (Join, Create)
- Safety (Reporting)
- Notifications (Followed Teams)
- Accounts (Profile Management)

## Testing

Each page connects to your API at http://localhost:3000/v1 and displays real data from your Supabase database.

Test the flow:
1. Create a profile
2. Add a venue
3. Create an event
4. RSVP to the event
5. Join a group
6. Follow a team

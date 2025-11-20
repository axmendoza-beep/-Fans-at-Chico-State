# Fans at Chico State API

Mobile-first web app API to manage events, venues, fan groups, RSVPs, and user accounts.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:3000/v1`
- **Production**: `https://api.fansatchicostate.com/v1`

### Endpoints

All endpoints follow REST conventions with standard CRUD operations:
- `GET /resource` - List all resources
- `POST /resource` - Create a new resource
- `GET /resource/:id` - Get a specific resource
- `PUT /resource/:id` - Update a specific resource
- `DELETE /resource/:id` - Delete a specific resource

#### Available Resources

1. **Profiles** - `/v1/profiles`
   - User profiles with authentication and preferences

2. **Venues** - `/v1/venues`
   - Watch party locations (dorms, lounges, bars, houses)

3. **Events** - `/v1/events`
   - Watch party events with game details

4. **RSVPs** - `/v1/rsvps`
   - Event attendance confirmations

5. **Followed Teams** - `/v1/followed_teams`
   - User's favorite teams for notifications

6. **Groups** - `/v1/groups`
   - Fan groups organized by sport/team

7. **Group Memberships** - `/v1/group_memberships`
   - User memberships in fan groups

8. **Group Messages** - `/v1/group_messages`
   - Chat messages within fan groups

9. **Announcements** - `/v1/announcements`
   - Important group announcements

10. **Group Polls** - `/v1/group_polls`
    - Polls for group decision-making

11. **Group Poll Votes** - `/v1/group_poll_votes`
    - Individual votes on group polls

12. **Reports** - `/v1/reports`
    - Content moderation reports

### Response Codes

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Example Requests

#### Create a Profile
```bash
curl -X POST http://localhost:3000/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@mail.csuchico.edu",
    "display_name": "John Doe",
    "major": "Computer Science"
  }'
```

#### Get All Events
```bash
curl http://localhost:3000/v1/events
```

#### Create an Event
```bash
curl -X POST http://localhost:3000/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "host_user_id": "uuid-here",
    "venue_id": "uuid-here",
    "sport": "basketball",
    "game_name": "Warriors vs Lakers",
    "start_time": "2024-01-15T19:00:00Z",
    "description": "Watch party for the big game!"
  }'
```

#### RSVP to an Event
```bash
curl -X POST http://localhost:3000/v1/rsvps \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "uuid-here",
    "user_id": "uuid-here",
    "status": "going"
  }'
```

## 🗄️ Database

This API uses Supabase (PostgreSQL) for data storage. All database operations are handled through the Supabase client.

### Database Tables

- `profiles` - User accounts and preferences
- `venues` - Watch party locations
- `events` - Watch party events
- `rsvps` - Event attendance
- `followed_teams` - User team preferences
- `groups` - Fan groups
- `group_memberships` - Group membership records
- `group_messages` - Group chat messages
- `announcements` - Group announcements
- `group_polls` - Group polls
- `group_poll_votes` - Poll votes
- `reports` - Content reports

## 🔒 Security

- Helmet.js for security headers
- CORS enabled for cross-origin requests
- Environment variables for sensitive data
- Input validation on all endpoints

## 🛠️ Development

### Project Structure
```
API/
├── config/
│   └── supabase.js       # Supabase client configuration
├── routes/
│   ├── profiles.js
│   ├── venues.js
│   ├── events.js
│   ├── rsvps.js
│   ├── followed_teams.js
│   ├── groups.js
│   ├── group_memberships.js
│   ├── group_messages.js
│   ├── announcements.js
│   ├── group_polls.js
│   ├── group_poll_votes.js
│   └── reports.js
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
├── server.js             # Main application file
├── package.json          # Dependencies
└── README.md            # This file
```

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

## 📝 Notes

- All IDs use UUID format
- Timestamps are in ISO 8601 format
- The API follows the OpenAPI 3.1.0 specification
- Direct database access is forbidden - all operations must go through this API

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

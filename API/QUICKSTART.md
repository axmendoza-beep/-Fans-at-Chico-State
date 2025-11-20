# Quick Start Guide

## Step 1: Install Dependencies

```bash
cd API
npm install
```

## Step 2: Configure Environment Variables

1. Open the `.env` file in the API directory
2. Add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=3000
NODE_ENV=development
```

**Where to find your Supabase credentials:**
- Go to your Supabase project dashboard
- Click on Settings (gear icon) → API
- Copy the Project URL and API keys

## Step 3: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## Step 4: Test the API

Open your browser or use curl to test:

```bash
# Health check
curl http://localhost:3000/health

# Get all profiles
curl http://localhost:3000/v1/profiles

# Get all events
curl http://localhost:3000/v1/events
```

## Available Endpoints

All endpoints are prefixed with `/v1`:

- `/v1/profiles` - User profiles
- `/v1/venues` - Watch party venues
- `/v1/events` - Watch party events
- `/v1/rsvps` - Event RSVPs
- `/v1/followed_teams` - User's followed teams
- `/v1/groups` - Fan groups
- `/v1/group_memberships` - Group memberships
- `/v1/group_messages` - Group chat messages
- `/v1/announcements` - Group announcements
- `/v1/group_polls` - Group polls
- `/v1/group_poll_votes` - Poll votes
- `/v1/reports` - Content reports

## Common Issues

### "Missing Supabase environment variables"
- Make sure you've filled in the `.env` file with your actual Supabase credentials

### Port already in use
- Change the PORT in your `.env` file to a different number (e.g., 3001, 8000)

### Database connection errors
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure your database tables match the schema in `fans_chico_crud_test.sql`

## Next Steps

1. Test all endpoints using Postman or curl
2. Integrate with your frontend client
3. Add authentication middleware
4. Implement rate limiting
5. Set up logging and monitoring

For detailed API documentation, see [README.md](./README.md)

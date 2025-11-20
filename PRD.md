Product Requirements Document (PRD)
Project Title: Fans at Chico State
Description:
Fans at Chico State is a mobile-first web app that helps Chico State students find, host, and join sports watch parties and allows them to connect through fan groups. 
Scope:
Based on the Analyst’s Level 1 Specification, Fans at Chico State v1 will include features in six epics:
  - Events - Create, RSVP, Trending/ Upcoming, Filter/Search, View History
  - Locations - Details & Maps
  - Fan Groups - Join, Chat, Create, Moderate
  - Safety - Reporting, Age filter
  - Notifications - Followed Teams
  - Accounts - Onboarding, Create Bio, List Sports Interests, View Past Attendance, Enter CSU email
Out of Scope: 
  - Private or invite-only events
  - Ticket sales or third-party ticketing integrations
  - Live sports streaming
  - Advanced analytics / AI recommendations
  - Monetization (ads, sponsors, purchases)
  - Cross-campus/external communities
  - Professional-grade event management features (waitlists, capacity automation, complex permissions)

Technical Architecture
Frontend (Client):
  - React (PWA, mobile-first design)
  - React Router for navigation
  - Deployed via AWS Amplify
Backend (API Layer):
  - Express.js REST API (Node.js )
      - Serves as the single gateway for all data operations
      - Handles authentication, validation, and routing
      - Organizes CRUD endpoints by feature area (e.g., /events, /locations, /fan groups)
      - Middleware for logging, error handling, and request validation
  - All CRUD operations go through API - Students must not call Supabase directly from the frontend
Database & Authentication: 
  - Supabase (postgres-based) for:
      - Data Persistence
      - Authentication (email/password, role-based access)
      - Realtime
      - API connects to Supabase using Supabase client or pg driver under the hood
Deployment Strategy:
  - Frontend: AWS Amplify (continuous deployment from GitHub):
  - API Layer: Deployed as serverless functions:
      - AWS Lambda (preferred) - Express Wrapped with servless - http.
  - Database: Managed directly in Supabase cloud instance
Development Tools:
  - GitHub for version control and collaboration\
  - Windsurf IDE for coding environment
  - Trello for task management
  - Slack for team communication
Key Considerations:
  - Separations of concerns: Clear distinction between frontend (UI), API (business logic), and DB (persistence)
  - Role-based access: API enforces role permissions 
  - Environment Variables: API keys stored in .env (never committed)
  - Scalability: reflect industry practices

WORKSPACE_RULES.md
0) Summary (read this first)
P1 & P2: build and run everything locally (client + Express API). Use Supabase (cloud) for Postgres + Auth. Push to GitHub daily for backup & instructor visibility. No PRs required.
P3: deploy the client to AWS Amplify and the API to AWS Lambda (serverless-http wrapper)
_______________________________________________
1) Git & Branching (simple mode)
Single branch workflow: main only
Commit early/often (aim: 5-10 commits/ week).
Optional (not required: short-lived feature branches named feat) <short>, merged back into main with a single fast-forward merge.
Tag milestones:
V0.1-proto1, v0.2-proto2, v1.0-proto3
Remote: push at least once per work session (end of day rule)
Commit message format
[scope]: imperative summary
#  examples
api: add POST /reviews w/ validation
client: wire list view to GET /vendors
Docs:
Add site map and api examples
__________________________________________________
2) Repo Layout
/client/ 			#React PWA (local dev: Vite or CRA)
/api/				#Express API (local dev: Node)
/supabase/			#SQL migrations + seeds (optional)
/docs/ 				# PRD, site map, OpenAPI, deployment notes
README.md
.gitignore must include: node_modules/, .env, .DS_Store, build artifacts
_______________________________________________________________
3) Environment & Secrets Create .env.example files and keep real .env out of git
/client/ .env.example
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=<public-supabase-url>
VITE_SUPABASE_ANON_KEY=<public-anon-key>
/api/.env.example
PORT=3000
SUPABASE_URL=<supabase-url>
SUPABASE_SERVICE_KEY=<service-role-key>
	JWT_SECRET = dev-secret
Rules:
Client may use VITE_* public keys only
All CRUD goes through the PAI; the client never uses services keys
______________________________________________
4)Local Dev (P1 & P2)
Scripts (recommended): 
/client:
npm run dev - local dev server
npm run lint, npm test
/api:
npm run dev - nodemon on port 3000
npm run lint, npm test
Run both:
terminal A - cd api && npm run dev
terminal B - cd client && npm run dev
Health checks
API: GET http://localhost:3000/api/v1/health - {“status”:”ok”}
Client: loads and can call GET /events without CORS errors
________________________________________________
5) API Conventions (unchanged but enforced)
Base: /api/v1
Resources: /events, /locations, .

 	

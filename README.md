# Fans-at-Chico-State
An aid for Chico State students to find, host, and join sports watch parties and connect through different fan groups. 

# Deployed Application 
Link to live site: https://main.d2qxbewq57vyhq.amplifyapp.com/

# Troubleshooting
Client shows a blank page or routing doesn’t work
- Confirm the client dev server is running in  client/: npm run dev
- Confirm the API server is running in API/: npm run dev   # or npm start
- Open the browser devtools console and look for JavaScript or network errors.

API requests are failing
-Check that VITE_API_BASE_URL in client/.env.local matches the environment:
    Local: http://localhost:3000/v1
Deployed: https://unvezad431.execute-api.us-west-1.amazonaws.com/v1
- Watch the API terminal output for error messages on incoming requests.
- Look for CORS errors in the browser; if present, the API’s CORS configuration may need to allow the frontend origin.

Supabase-related errors
- Verify all Supabase environment variables are correct in:
API/.env
client/.env.local
- Confirm the database schema matches Schema.sql (tables, columns, and types).
- Check the API logs for more detailed Supabase error messages.

# Known issues/incomplete features
- reporting feature incomplete
-in terms of design the profile page does not match the design/colorscheme of the rest of the application
-there was a slight issue with creating polls in fan group messages- was unable to see if it worked correctly (would time out immediately)
-Overall design could be a little more re-worked (Adjust text to make certain titles stand out more, adjust buttons to make them easier to click)

# Support contact method
-message me in slack
-or email: axmendoza@csuchico.edu

# Announcement
Here is the third prototype for the Fans at Chico State app. Where students will be able to find, host, and join sports watch parties and connect through different fan groups. Students should be easily able to create new events and venues, with RSVP being a simple one click action. For fan groups they are a part of, they can chat with other members and create voting polls within messages. 
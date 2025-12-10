const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Import routes
const profilesRouter = require('./routes/profiles');
const venuesRouter = require('./routes/venues');
const eventsRouter = require('./routes/events');
const eventVotesRouter = require('./routes/event_votes');
const rsvpsRouter = require('./routes/rsvps');
const followedTeamsRouter = require('./routes/followed_teams');
const groupsRouter = require('./routes/groups');
const groupMembershipsRouter = require('./routes/group_memberships');
const groupMessagesRouter = require('./routes/group_messages');
const announcementsRouter = require('./routes/announcements');
const groupPollsRouter = require('./routes/group_polls');
const groupPollVotesRouter = require('./routes/group_poll_votes');
const pollClosedNotifyRouter = require('./routes/poll_closed_notify');
const reportsRouter = require('./routes/reports');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Fans at Chico State API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes (v1)
app.use('/v1/profiles', profilesRouter);
app.use('/v1/venues', venuesRouter);
app.use('/v1/events', eventsRouter);
app.use('/v1/event_votes', eventVotesRouter);
app.use('/v1/rsvps', rsvpsRouter);
app.use('/v1/followed_teams', followedTeamsRouter);
app.use('/v1/groups', groupsRouter);
app.use('/v1/group_memberships', groupMembershipsRouter);
app.use('/v1/group_messages', groupMessagesRouter);
app.use('/v1/announcements', announcementsRouter);
app.use('/v1/group_polls', groupPollsRouter);
app.use('/v1/group_poll_votes', groupPollVotesRouter);
app.use('/v1/reports', reportsRouter);
app.use('/v1/poll_closed_notify', pollClosedNotifyRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fans at Chico State API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

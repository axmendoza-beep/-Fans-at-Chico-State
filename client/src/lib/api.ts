import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({
  baseURL: `${API_BASE}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Events
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getByHost: (hostUserId: string) => api.get('/events', { params: { host_user_id: hostUserId } }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// Event Votes
export const eventVotesAPI = {
  getForUser: (userId: string) => api.get('/event_votes', { params: { user_id: userId } }),
  getForEvent: (eventId: string) => api.get('/event_votes', { params: { event_id: eventId } }),
  setVote: (data: { event_id: string; user_id: string; value: number }) => api.post('/event_votes', data),
};

// Venues
export const venuesAPI = {
  getAll: () => api.get('/venues'),
  getById: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post('/venues', data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
};

// RSVPs
export const rsvpsAPI = {
  getAll: () => api.get('/rsvps'),
  getForUser: (userId: string) => api.get('/rsvps', { params: { user_id: userId } }),
  getById: (id) => api.get(`/rsvps/${id}`),
  create: (data) => api.post('/rsvps', data),
  update: (id, data) => api.put(`/rsvps/${id}`, data),
  delete: (id) => api.delete(`/rsvps/${id}`),
};

// Profiles
export const profilesAPI = {
  getAll: () => api.get('/profiles'),
  getById: (id) => api.get(`/profiles/${id}`),
  create: (data) => api.post('/profiles', data),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
};

// Followed Teams
export const followedTeamsAPI = {
  getAll: () => api.get('/followed_teams'),
  getById: (id) => api.get(`/followed_teams/${id}`),
  create: (data) => api.post('/followed_teams', data),
  update: (id, data) => api.put(`/followed_teams/${id}`, data),
  delete: (id) => api.delete(`/followed_teams/${id}`),
};

// Groups
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
};

// Group Memberships
export const groupMembershipsAPI = {
  getAll: () => api.get('/group_memberships'),
  getForUser: (userId: string) => api.get('/group_memberships', { params: { user_id: userId } }),
  getById: (id) => api.get(`/group_memberships/${id}`),
  create: (data) => api.post('/group_memberships', data),
  update: (id, data) => api.put(`/group_memberships/${id}`, data),
  delete: (id) => api.delete(`/group_memberships/${id}`),
};

// Group Messages
export const groupMessagesAPI = {
  getAll: () => api.get('/group_messages'),
  getById: (id) => api.get(`/group_messages/${id}`),
  create: (data) => api.post('/group_messages', data),
  update: (id, data) => api.put(`/group_messages/${id}`, data),
  delete: (id) => api.delete(`/group_messages/${id}`),
};

// Group Polls
export const groupPollsAPI = {
  getAll: () => api.get('/group_polls'),
  getById: (id) => api.get(`/group_polls/${id}`),
  create: (data) => api.post('/group_polls', data),
  update: (id, data) => api.put(`/group_polls/${id}`, data),
  delete: (id) => api.delete(`/group_polls/${id}`),
};

// Group Poll Votes
export const groupPollVotesAPI = {
  getAll: () => api.get('/group_poll_votes'),
  getById: (id) => api.get(`/group_poll_votes/${id}`),
  create: (data) => api.post('/group_poll_votes', data),
  update: (id, data) => api.put(`/group_poll_votes/${id}`, data),
  delete: (id) => api.delete(`/group_poll_votes/${id}`),
};

// Reports
export const reportsAPI = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

export default api;

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
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
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

// Reports
export const reportsAPI = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

export default api;

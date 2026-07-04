import api from './api';

export const updateProfile = (data) => api.put('/users/profile', data).then((res) => res.data);
export const changePassword = (data) => api.put('/users/change-password', data).then((res) => res.data);
export const getDashboardStats = () => api.get('/users/dashboard-stats').then((res) => res.data);

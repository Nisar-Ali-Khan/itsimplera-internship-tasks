import api from './api';

export const getProfile = () => api.get('/users/profile').then((res) => res.data);
export const updateProfile = (data) => api.put('/users/profile', data).then((res) => res.data);
export const changePassword = (data) => api.put('/users/change-password', data).then((res) => res.data);
export const getDashboardStats = () => api.get('/users/dashboard-stats').then((res) => res.data);
export const getMyBookmarks = () => api.get('/users/bookmarks').then((res) => res.data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api
    .put('/users/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
};

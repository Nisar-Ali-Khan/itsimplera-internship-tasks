import api from './api';

export const getPosts = (params) => api.get('/posts', { params }).then((res) => res.data);
export const getMyPosts = (params) => api.get('/posts/mine', { params }).then((res) => res.data);
export const getPostById = (idOrSlug) => api.get(`/posts/${idOrSlug}`).then((res) => res.data);
export const createPost = (data) => api.post('/posts', data).then((res) => res.data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data).then((res) => res.data);
export const deletePost = (id) => api.delete(`/posts/${id}`).then((res) => res.data);
export const toggleLike = (id) => api.post(`/posts/${id}/like`).then((res) => res.data);
export const toggleBookmark = (id) => api.post(`/posts/${id}/bookmark`).then((res) => res.data);

export const uploadCoverImage = (id, file) => {
  const formData = new FormData();
  formData.append('coverImage', file);
  return api
    .put(`/posts/${id}/cover-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
};

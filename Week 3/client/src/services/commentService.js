import api from './api';

export const getComments = (postId) => api.get(`/posts/${postId}/comments`).then((res) => res.data);
export const createComment = (postId, data) => api.post(`/posts/${postId}/comments`, data).then((res) => res.data);
export const updateComment = (id, data) => api.put(`/comments/${id}`, data).then((res) => res.data);
export const deleteComment = (id) => api.delete(`/comments/${id}`).then((res) => res.data);

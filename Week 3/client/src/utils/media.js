const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000';

// Post cover images / avatars are stored as relative paths like
// "/uploads/avatars/xyz.png" — this resolves them against the API host.
export const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${UPLOADS_URL}${path}`;
};

// frontend/src/utils/index.js

export const createPageUrl = (path) => {
  if (!path) return "/";
  // Ensure the path starts with /
  return path.startsWith("/") ? path : `/${path}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
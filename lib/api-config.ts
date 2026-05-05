// API Configuration for Mobile App
// This file configures the base URL for API calls

// Always use Vercel production URL for API calls
export const API_BASE_URL = 'https://doremi-tienganh.vercel.app';

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export const apiUrl = (path: string) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

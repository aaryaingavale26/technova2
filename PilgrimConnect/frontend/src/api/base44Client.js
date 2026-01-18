// frontend/src/api/base44Client.js
import axios from "axios";

// Create a standard client instance
export const base44 = axios.create({
  baseURL: "/", // This uses the proxy in vite.config.js
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function if your code expects a specific fetcher
export const fetchData = async (url) => {
  const response = await base44.get(url);
  return response.data;
};
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true, // Crucial for NestJS JWT Cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Could emit an event or handle redirect to /login here if needed, 
      // but usually React Query error handlers or protected route components handle it better.
      console.warn("Unauthorized access detected (401).");
    }
    return Promise.reject(error);
  }
);

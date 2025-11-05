import axios from 'axios';
import { toast } from "react-toastify";

const API_BASE_URL = 'http://localhost:8080/api';

// === Axios instance ===
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// === Automatically attach JWT to every request ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === Handle error responses globally ===
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Unexpected error";

    if (error.response) {
      const data = error.response.data;
      message = typeof data === "string"
        ? data
        : data.message || data.error || "Unexpected server error";

      console.error("API Error:", error.response.status, message);

      // Handle 401 Unauthorized (token expired or invalid)
      if (error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem('jwtToken');
        window.location.href = "/login"; // optional redirect
      }

    } else if (error.request) {
      message = "Server not reachable. Please check your connection.";
    } else {
      message = "Client error: " + error.message;
    }

    // toast.error(message, { autoClose: 4000 });
    return Promise.reject(error);
  }
);

//
// === AUTH ===
//
export const register = async (username, password) => {
  const res = await api.post('/auth/register', { username, password });
  toast.success("Registration successful! You can now log in.");
  return res.data;
};

export const login = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  const token = res.data.token;
  if (token) {
    localStorage.setItem('jwtToken', token);
  }
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('jwtToken');
  toast.info("Logged out.");
};

//
// === STOCKS ===
//
export const getStocks = () => api.get('/stocks');
export const createStock = (data) => api.post('/stocks', data);
export const updateStockPrice = (id, price) =>
  api.put(`/stocks/${id}/price`, { currentPrice: price });
export const deleteStock = (id) => api.delete(`/stocks/${id}`);

//
// === EXCHANGES ===
//
export const getExchanges = () => api.get('/exchanges');
export const createExchange = (data) => api.post('/exchanges', data);
export const updateExchange = (id, data) => api.put(`/exchanges/${id}`, data);
export const deleteExchange = (id) => api.delete(`/exchanges/${id}`);
export const addStockToExchange = (exchangeId, stockId) =>
  api.post(`/exchanges/${exchangeId}/stocks`, { stockId });
export const removeStockFromExchange = (exchangeId, stockId) =>
  api.delete(`/exchanges/${exchangeId}/stocks/${stockId}`);

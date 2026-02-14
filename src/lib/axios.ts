import axios from "axios";

axios.defaults.withCredentials = true;

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const axiosPrivateInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

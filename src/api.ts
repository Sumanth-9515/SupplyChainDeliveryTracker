// src/api.ts  (React Native / Expo)
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL: string =
  (process.env.EXPO_PUBLIC_API_URL as string) || "http://192.168.1.23:5000";

const API: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem("hrms-token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log("⚠️ AsyncStorage Warning (Ignored):", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
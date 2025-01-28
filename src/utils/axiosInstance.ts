import axios from "axios";
import * as Keychain from "react-native-keychain";

export const BaseApi = "http://192.168.1.7:9090"; // Your IP address

export const axiosInstance = axios.create({
  baseURL: BaseApi,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosInstanceAuth = axios.create({
  baseURL: BaseApi,
  headers: {
    "Content-Type": "application/json",
  },
});

// use interceptor to add token to request header
axiosInstanceAuth.interceptors.request.use(
  async (config) => {
    try {
      const credentials = await Keychain.getGenericPassword(); // get token from Keychain
      if (credentials) {
        config.headers.Authorization = `Bearer ${credentials.password}`; // add token to request header
      }
    } catch (error) {
      console.error("Error retrieving token from Keychain:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

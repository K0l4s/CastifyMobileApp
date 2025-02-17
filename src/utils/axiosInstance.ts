import axios from "axios";
import * as Keychain from "react-native-keychain";
import { API_URL } from "@env";
export const BaseApi = API_URL;

console.log('BaseApi:', BaseApi); // Log BaseApi

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
      const tokenData = credentials ? JSON.parse(credentials.password) : null;
      config.headers.Authorization = `Bearer ${tokenData.access_token}`; // add token to request header
    } catch (error) {
      console.error("Error retrieving token from Keychain:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const axiosInstanceFile = axios.create({
  baseURL: BaseApi,
  withCredentials: true,
  headers: {
      "Content-Type": "multipart/form-data",
  },
});
// use interceptor to add token to request header
axiosInstanceFile.interceptors.request.use(
  async (config) => {
    try {
      const credentials = await Keychain.getGenericPassword(); // get token from Keychain
      const tokenData = credentials ? JSON.parse(credentials.password) : null;
      config.headers.Authorization = `Bearer ${tokenData.access_token}`; // add token to request header
    } catch (error) {
      console.error("Error retrieving token from Keychain:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
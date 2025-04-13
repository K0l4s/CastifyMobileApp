import { axiosInstance } from "../utils/axiosInstance";

export const locationService = {
    getProvinces: async () => {
        // return await axiosInstanceLocation.get('provinces?page=0&size=63');'
        return await axiosInstance.get('/api/v1/locations/cities');
    },
    getDistricts: async (provinceId: string) => {
        return await axiosInstance.get(`/api/v1/locations/districts?cityId=${provinceId}`);
    },
    getWards: async (districtId: string) => {
        return await axiosInstance.get(`/api/v1/locations/wards?districtId=${districtId}`);
    }
};
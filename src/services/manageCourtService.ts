import axiosInstance from './axiosInstance';
import { useAuthStore } from "../store/useAuthStore";
// Hãy đảm bảo đường dẫn import type Location đúng với file bạn định nghĩa
import { Location } from "../store/useCourtStore";

export interface PromotionRequest {
  locationId: number;
  code: string;
  discountType: "PERCENT" | "FIXED_AMOUNT"; // Dựa trên logic thường thấy
  discountValue: number;
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  description: string;
}

export const manageCourtService = {
  getLocation: async () => {
    try {
      const response = await axiosInstance.get(`/owner/locations`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ API Error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  addLocation: async (data: Location) => {
    try {
      const response = await axiosInstance.post(`/owner/locations`, data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ API Error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  createPromotion: async (data: PromotionRequest) => {
    try {
      const response = await axiosInstance.post(`/owner/promotions`, data);

      console.log("Promotion Created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Create Promotion Error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  getPromotion: async (locationId: string) => {
    try {
      // Endpoint is /owner/promotions (plural)
      const response = await axiosInstance.get(`/owner/promotions`, {
        params: { locationId }
      });

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Get Promotion Error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  deleteLocation: async (locationId: string) => {
    try {
      const response = await axiosInstance.delete(`/owner/locations/${locationId}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.status);
      throw error;
    }
  },

  getAllCourtByLocationId: async (locationId: string) => {
    try {
      const response = await axiosInstance.get(`/owner/locations/${locationId}/courts`);
      return response.data;
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.status);
      throw error;
    }
  },

  addCourt: async (locationId: string, courtName: string) => {
    // Body request theo yêu cầu
    const payload = {
      name: courtName,
      status: "ACTIVE",
    };

    try {
      const response = await axiosInstance.post(
        `/owner/locations/${locationId}/courts`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Add Court Error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  deleteCourt: async (courtId: string) => {
    try {
      const response = await axiosInstance.delete(`/owner/courts/${courtId}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.status);
      throw error;
    }
  },

  updateCourtStatus: async (courtId: string, courtStatus: string) => {
    try {
      // Axios.put(url, body, config)
      // Vì status nằm ở query param rồi, nên body ta để object rỗng {}
      const response = await axiosInstance.patch(
        `/owner/courts/${courtId}/status?status=${courtStatus}`,
        {} // Body rỗng
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ API Update Status Error:", error.response?.status);
      throw error;
    }
  },
};

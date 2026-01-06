import axiosInstance from './axiosInstance';
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
      const response = await axiosInstance.get(
        `/owner/promotions?locationId=${locationId}`
      );

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

  deletePromotion: async (promotionId: string) => {
    try {
      const response = await axiosInstance.delete(
        `/owner/promotions/${promotionId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ API Error Delete Promotion:", error.response?.status);
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

  getBookingsByLocationAndDate: async (locationId: string | number, date: string) => {
    // date format: YYYY-MM-DD
    try {
      const response = await axiosInstance.get(
        `/owner/bookings?locationId=${locationId}&date=${date}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Get bookings failed:", error);
      throw error;
    }
  },

  uploadFile: async (file: any, type: "location" | "court" | "avatar" = "location") => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.fileName || `upload_${Date.now()}.jpg`,
        type: file.mimeType || "image/jpeg",
      } as any);

      // Determine Base URL
      const currentBaseURL = axiosInstance.defaults.baseURL || "http://10.0.2.2:8080/api/v1";
      // Remove /v1 for file upload
      const fileBaseURL = currentBaseURL.replace("/v1", "");
      const fullUrl = `${fileBaseURL}/files/upload/${type}`;

      // Get Token
      const { useAuthStore } = require("../store/useAuthStore");
      const token = useAuthStore.getState().token;

      console.log("Uploading to:", fullUrl);

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Content-Type must be undefined so fetch generates the boundary
        },
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Upload failed");
      }

      return json;
    } catch (error) {
      console.error("Upload File Error:", error);
      throw error;
    }
  },
};

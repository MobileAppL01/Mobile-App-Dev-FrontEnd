import { Platform } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import axiosInstance, { getAccessToken, BASE_URL } from './axiosInstance';
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

  updateLocation: async (id: string, data: Partial<Location>) => {
    try {
      const response = await axiosInstance.put(`/owner/locations/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error("❌ API Update Location Error:", error.response?.status);
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
      // Clean up base URL
      let currentBaseURL = axiosInstance.defaults.baseURL || "http://10.0.2.2:8080/api/v1";
      if (currentBaseURL.endsWith("/")) currentBaseURL = currentBaseURL.slice(0, -1);

      const fileBaseURL = currentBaseURL.replace(/\/v1$/, ""); // Remove /v1 at end
      const fullUrl = `${fileBaseURL}/files/upload/${type}`;

      console.log(`[Upload] Starting upload to ${fullUrl}`);
      console.log(`[Upload] Original File URI: ${file.uri}`);

      // --- COMPRESSION LOGIC ---
      let uploadUri = file.uri;
      try {
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        if (fileInfo.exists && fileInfo.size > 1 * 1024 * 1024) { // Only compress if > 1MB
          console.log(`[Upload] File size ${fileInfo.size} > 1MB, compressing...`);
          const manipResult = await manipulateAsync(
            file.uri,
            [{ resize: { width: 1200 } }], // Resize width to 1200px (Balance quality/size)
            { compress: 0.8, format: SaveFormat.JPEG } // Compress to 80% quality
          );
          uploadUri = manipResult.uri;
          console.log(`[Upload] Compressed File URI: ${uploadUri}`);
        } else {
          console.log(`[Upload] File size within limit or unknown, skipping compression.`);
        }
      } catch (compError) {
        console.warn("[Upload] Compression check failed, using original file:", compError);
      }
      // --- COMPRESSION END ---

      // Fix Android URI
      let uri = uploadUri;
      if (Platform.OS === 'android' && !uri.startsWith('file://')) {
        uri = `file://${uri}`;
      }

      // Fix MimeType
      let mimeType = file.mimeType || file.type || "image/jpeg";
      if (!mimeType || mimeType === 'image') {
        const ext = uri.split('.').pop()?.toLowerCase();
        mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      }

      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: file.fileName || `image_${Date.now()}.jpg`,
        type: mimeType,
      } as any);

      // Get Token
      const token = getAccessToken();

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          // Content-Type left undefined for boundary generation
        },
        body: formData,
      });

      const text = await response.text();
      console.log(`[Upload] Response status: ${response.status}`);

      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error("[Upload] Failed to parse JSON response:", text);
        throw new Error(`Server returned ${response.status}: ${text}`);
      }

      if (!response.ok) {
        // Handle Max Upload Size
        if ((json.message && json.message.includes("Maximum upload size exceeded")) || text.includes("Maximum upload size exceeded")) {
          throw new Error("Ảnh quá lớn, vui lòng chọn ảnh có dung lượng nhỏ hơn.");
        }

        // Pass exact backend error message
        throw new Error(json.message || `Lỗi tải ảnh: ${response.status}`);
      }

      return json;
    } catch (error: any) {
      console.error("[Upload] Error:", error);
      // Rethrow friendly error if caught from above
      if (error.message && error.message.includes("Ảnh quá lớn")) {
        throw error;
      }
      throw error;
    }
  },
};

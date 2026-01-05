import axios from "axios"; // Import trực tiếp axios
import { useAuthStore } from "../store/useAuthStore";
// Hãy đảm bảo đường dẫn import type Location đúng với file bạn định nghĩa
import { Location } from "../store/useCourtStore";

// Định nghĩa URL gốc (Hardcode luôn để tránh lỗi biến môi trường lúc debug)
const BASE_URL =
  "https://bookington-app.mangobush-e7ff5393.canadacentral.azurecontainerapps.io/api/v1";

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
    const { token } = useAuthStore.getState();
    try {
      const response = await axios.get(`${BASE_URL}/owner/locations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Gắn thủ công ở đây
        },
      });
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
    const { token } = useAuthStore.getState();

    try {
      const response = await axios.post(`${BASE_URL}/owner/locations`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
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
    const { token } = useAuthStore.getState();

    try {
      const response = await axios.post(`${BASE_URL}/owner/promotions`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Promotion Created:", response.data);
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
    const { token } = useAuthStore.getState();

    try {
      const response = await axios.get(
        `${BASE_URL}/owner/promotion?locationId=${locationId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Promotion Created:", response.data);
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

  deleteLocation: async (locationId: string) => {
    const { token } = useAuthStore.getState();
    try {
      const response = await axios.delete(
        `${BASE_URL}/owner/locations/${locationId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.status);
      throw error;
    }
  },

  getAllCourtByLocationId: async (locationId: string) => {
    const { token } = useAuthStore.getState();
    try {
      const response = await axios.get(
        `${BASE_URL}/owner/locations/${locationId}/courts`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.status);
      throw error;
    }
  },

  addCourt: async (locationId: string, courtName: string) => {
    const { token } = useAuthStore.getState();

    // Body request theo yêu cầu
    const payload = {
      name: courtName,
      status: "ACTIVE",
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/owner/locations/${locationId}/courts`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
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
    const { token } = useAuthStore.getState();
    try {
      const response = await axios.delete(
        `${BASE_URL}/owner/courts/${courtId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.status);
      throw error;
    }
  },

  updateCourtStatus: async (courtId: string, courtStatus: string) => {
    const { token } = useAuthStore.getState();
    try {
      // Axios.put(url, body, config)
      // Vì status nằm ở query param rồi, nên body ta để object rỗng {}
      const response = await axios.patch(
        `${BASE_URL}/owner/courts/${courtId}/status?status=${courtStatus}`,
        {}, // <--- Body rỗng
        {
          // <--- Config (Headers) nằm ở đây
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ API Update Status Error:", error.response?.status);
      throw error;
    }
  },
};

import axios from "axios"; // Import trực tiếp axios
import { useAuthStore } from "../store/useAuthStore";
// Hãy đảm bảo đường dẫn import type Location đúng với file bạn định nghĩa
import { Location } from "../store/useCourtStore"; 

// Định nghĩa URL gốc (Hardcode luôn để tránh lỗi biến môi trường lúc debug)
const BASE_URL = "https://bookington-app.mangobush-e7ff5393.canadacentral.azurecontainerapps.io/api/v1";

export const manageCourtService = {
  getLocation: async () => {
    const { token } = useAuthStore.getState();
    try {
      const response = await axios.get(`${BASE_URL}/owner/locations`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Gắn thủ công ở đây
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.status, error.response?.data);
      throw error;
    }
  },

  addLocation: async (data: Location) => {
    const { token } = useAuthStore.getState();

    try {
      const response = await axios.post(`${BASE_URL}/owner/locations`, data, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.status, error.response?.data);
      throw error;
    }
  },

  getAllCourtByLocationId: async (locationId: string) => {
    const { token } = useAuthStore.getState();
    try {
      const response = await axios.get(`${BASE_URL}/owner/locations/${locationId}/courts`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ API Error:", error.response?.status);
      throw error;
    }
  }


};
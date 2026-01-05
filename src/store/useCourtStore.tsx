// src/store/useCourtStore.ts
import { create } from "zustand";
import { manageCourtService } from "../services/manageCourtService";

export interface Court {
  id?: string; // Thêm id để quản lý list
  name: string;
  status: string;
}

export interface Location {
  id?: string; // Thêm id để quản lý list
  name: string;
  address: string;
  description: string;
  pricePerHour: number; // Nên dùng 'number' (nguyên thủy) thay vì 'Number'
  openTime: string;
  closeTime: string;
  image: string;
  courts?: Court[]; // Một địa điểm sẽ chứa danh sách sân con
}

// --- 2. ĐỊNH NGHĨA STATE CỦA STORE (Store Interface) ---
interface CourtStoreState {
  // State chứa dữ liệu
  locations: Location[]; // Danh sách các cơ sở
  currentCourts: any[];
  isLoading: boolean;
  error: string | null;

  // Actions (Hành động)
  fetchLocations: () => Promise<void>;
  addLocation: (data: Location) => Promise<void>;
  fetchCourtByLocation: (locationId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

// --- 3. KHỞI TẠO STORE ---
export const useCourtStore = create<CourtStoreState>((set) => ({
  // Khởi tạo giá trị mặc định
  locations: [],
  currentCourts: [],
  isLoading: false,
  error: null,

  // --- ACTIONS ---

  // 1. Lấy danh sách sân từ API
  fetchLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await manageCourtService.getLocation();

      console.log("Data in Store:", response);

      // --- SỬA Ở ĐÂY ---
      // API trả về: { result:Array, code: 1000, ... }
      // Nên ta phải lấy response.result
      const list = response.result || [];

      set({
        locations: list,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Fetch locations failed:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi tải danh sách sân.",
      });
    }
  },

  // 2. Thêm cơ sở sân mới
  addLocation: async (newLocationData: Location) => {
    set({ isLoading: true, error: null });
    try {
      const createdLocation = await manageCourtService.addLocation(
        newLocationData
      );

      // Cập nhật State: Thêm sân vừa tạo vào danh sách hiện có
      set((state) => ({
        locations: [...state.locations, createdLocation],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Add location failed:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi thêm sân mới.",
      });
      // Ném lỗi ra để component UI bắt được và hiện Alert
      throw error;
    }
  },

  fetchCourtByLocation: async (locationId: string) => {
    // Lưu ý: Nhận vào locationId (string) thay vì cả object Location để gọn hơn
    set({ isLoading: true, error: null, currentCourts: [] }); // Reset list cũ trước khi load mới
    try {
      // Gọi service (bạn cần sửa service một chút để nhận ID, xem bước 2)
      const response = await manageCourtService.getAllCourtByLocationId(locationId);

      console.log("Courts data loaded:", response);

      // API trả về: { result: [...], ... }
      const list = response.result || [];

      set({
        currentCourts: list, // <-- LƯU VÀO currentCourts, KHÔNG GHI ĐÈ locations
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Fetch courts failed:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi tải danh sách sân con.",
      });
    }
  },

  // 3. Set lỗi thủ công
  setError: (error) => set({ error }),
}));

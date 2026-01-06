// src/store/useCourtStore.ts
import { create } from "zustand";
import { manageCourtService } from "../services/manageCourtService";
import { PromotionRequest } from "../services/manageCourtService";

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
  promotions?: any[];
}

// --- 2. ĐỊNH NGHĨA STATE CỦA STORE (Store Interface) ---
interface CourtStoreState {
  // State chứa dữ liệu
  locations: Location[]; // Danh sách các cơ sở
  currentCourts: any[];
  promotions: any[]; // Giả sử bạn có mảng này trong store để hiển thị danh sách khuyến mãi
  isLoading: boolean;
  error: string | null;

  // Actions (Hành động)
  fetchAll: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  addLocation: (data: Location) => Promise<void>;
  createPromotion: (data: PromotionRequest) => Promise<void>;
  getPromotion: (locationId: string) => Promise<void>;
  deletePromotion: (locationId: string) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
  fetchCourtByLocation: (locationId: string) => Promise<void>;
  addCourt: (locationId: string, name: string) => Promise<void>; // Thêm dòng này
  deleteCourt: (courtId: string) => Promise<void>;
  updateCourtStatus: (courtId: string, courtStatus: string) => Promise<void>;
  setError: (error: string | null) => void;
}

// --- 3. KHỞI TẠO STORE ---
export const useCourtStore = create<CourtStoreState>((set) => ({
  // Khởi tạo giá trị mặc định
  locations: [],
  currentCourts: [],
  promotions: [], // State lưu danh sách khuyến mãi
  isLoading: false,
  error: null,

  // --- ACTIONS ---

  // 1. Lấy danh sách sân từ API
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await manageCourtService.getLocation();
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

  // 1. Lấy danh sách sân từ API
  fetchLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await manageCourtService.getLocation();
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

  createPromotion: async (data: PromotionRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manageCourtService.createPromotion(data);

      set({ isLoading: false });
    } catch (error: any) {
      console.error("Create promotion failed:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Tạo khuyến mãi thất bại.",
      });
      throw error;
    }
  },

  getPromotion: async (locationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await manageCourtService.getPromotion(locationId);

      set({ isLoading: false });
    } catch (error: any) {
      console.error("Create promotion failed:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Tạo khuyến mãi thất bại.",
      });
      throw error;
    }
  },

   deletePromotion: async (promotionId: string) => {
    set({ isLoading: true, error: null });

    try {
      // 1. Gọi API xóa
      await manageCourtService.deletePromotion(promotionId);

      // 2. Cập nhật State:
      // SỬA LỖI: Phải filter trên danh sách 'promotions', không phải 'locations'
      set((state) => ({
        promotions: state.promotions.filter((item) => item.id !== promotionId),
        isLoading: false,
      }));
      
      // Mẹo: Nếu khuyến mãi nằm lồng trong location (ví dụ: location.promotions), 
      // thì cách tốt nhất và an toàn nhất là gọi lại fetchLocations() ở đây:
      // await get().fetchLocations(); 

    } catch (error: any) {
      console.error("Delete promotion failed:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi xóa khuyến mãi.",
      });
      throw error; // Ném lỗi ra để Component bắt được
    }
  },

  deleteLocation: async (locationId: string) => {
    // 1. Chỉ bật loading, KHÔNG được xóa locations: [] ở đây
    set({ isLoading: true, error: null });

    try {
      // 2. Gọi API xóa
      await manageCourtService.deleteLocation(locationId);

      // 3. Cập nhật State: Lọc  bỏ cái location vừa xóa khỏi danh sách hiện tại
      // Cách này giúp UI cập nhật ngay mà không cần gọi lại fetchLocations()
      set((state) => ({
        locations: state.locations.filter((item) => item.id !== locationId),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Delete location failed:", error);

      // 4. Nếu lỗi thì tắt loading và hiện thông báo
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi xóa địa điểm.",
      });

      // Ném lỗi ra để màn hình UI biết mà hiện Alert
      throw error;
    }
  },

  fetchCourtByLocation: async (locationId: string) => {
    // Lưu ý: Nhận vào locationId (string) thay vì cả object Location để gọn hơn
    set({ isLoading: true, error: null, currentCourts: [] }); // Reset list cũ trước khi load mới
    try {
      // Gọi service (bạn cần sửa service một chút để nhận ID, xem bước 2)
      const response = await manageCourtService.getAllCourtByLocationId(
        locationId
      );

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
        error:
          error.response?.data?.message || "Lỗi khi tải danh sách sân con.",
      });
    }
  },

  addCourt: async (locationId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const newCourt = await manageCourtService.addCourt(locationId, name);

      // Cập nhật UI ngay lập tức bằng cách thêm vào mảng hiện tại
      // Lưu ý: Kiểm tra cấu trúc trả về của API addCourt.
      // Nếu API trả về object sân vừa tạo thì dùng newCourt.
      // Nếu API trả về wrapper { result: {...} } thì dùng newCourt.result

      const createdItem = newCourt.result || newCourt;

      set((state) => ({
        currentCourts: [...state.currentCourts, createdItem],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Thêm sân thất bại.",
      });
      throw error;
    }
  },

  deleteCourt: async (courtId: string) => {
    // 1. Chỉ bật loading, KHÔNG được xóa locations: [] ở đây
    set({ isLoading: true, error: null });

    try {
      // 2. Gọi API xóa
      await manageCourtService.deleteCourt(courtId);

      // 3. Cập nhật State: Lọc  bỏ cái location vừa xóa khỏi danh sách hiện tại
      // Cách này giúp UI cập nhật ngay mà không cần gọi lại fetchLocations()
      set((state) => ({
        currentCourts: state.currentCourts.filter(
          (item) => item.id !== courtId
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Delete court failed:", error);

      // 4. Nếu lỗi thì tắt loading và hiện thông báo
      set({
        isLoading: false,
        error: error.response?.data?.message || "Lỗi khi xóa địa điểm.",
      });

      // Ném lỗi ra để màn hình UI biết mà hiện Alert
      throw error;
    }
  },

  updateCourtStatus: async (courtId: string, newStatus: string) => {
    // Không cần bật loading toàn màn hình (isLoading: true) để tránh nháy giao diện
    // Hoặc nếu muốn loading nhẹ thì xử lý riêng. Ở đây mình update ngầm (Optimistic UI)

    try {
      // 1. Gọi API
      await manageCourtService.updateCourtStatus(courtId, newStatus);

      // 2. Cập nhật State: Dùng map để sửa status của item tương ứng
      set((state) => ({
        currentCourts: state.currentCourts.map((item) =>
          // Nếu ID trùng thì copy item cũ và đè status mới lên
          // Lưu ý: ép kiểu toString() để so sánh an toàn
          item.id.toString() === courtId.toString()
            ? { ...item, status: newStatus }
            : item
        ),
      }));
    } catch (error: any) {
      console.error("Update court failed:", error);
      // Nếu lỗi thì hiện thông báo, không cần rollback state vì state chưa đổi nếu API lỗi
      set({
        error: error.response?.data?.message || "Lỗi khi cập nhật trạng thái.",
      });
      throw error;
    }
  },

  // 3. Set lỗi thủ công
  setError: (error) => set({ error }),
}));

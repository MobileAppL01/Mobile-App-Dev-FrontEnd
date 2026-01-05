// src/store/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService";
import { LoginRequest, RegisterRequest } from "../types/auth";
import { setAccessToken } from "../services/axiosInstance";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

interface AuthState {
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setHasSeenOnboarding: (status: boolean) => void;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      isAuthenticated: false,
      user: null,
      token: null, // Init token state
      isLoading: false,
      error: null,

      setHasSeenOnboarding: (status) => set({ hasSeenOnboarding: status }),

      setError: (error) => set({ error }),

      login: async (loginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(loginData);

          // Map backend response to frontend UserData
          const userRole = response.roles && response.roles.length > 0 ? response.roles[0] : "CLIENT";

          const userData: UserData = {
            id: response.id.toString(),
            name: response.username || response.email,
            email: response.email,
            role: userRole,
            phone: "",
            avatar: "https://i.pravatar.cc/300",
          };

          
         console.log("access token at store", response.token);
          setAccessToken(response.token);

          set({
            isAuthenticated: true,
            hasSeenOnboarding: true,
            user: userData,
            token: response.token,
            isLoading: false,
          });
        } catch (error: any) {
          console.log("Login failed:", error.message);
          set({
            isLoading: false,
            error: error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!"
          });
          throw error;
        }
      },

      register: async (registerData) => {
        set({ isLoading: true, error: null });
        try {
          if (registerData.role === 'OWNER') {
            await authService.registerOwner(registerData);
          } else {
            await authService.registerPlayer(registerData);
          }
          set({ isLoading: false });
        } catch (error: any) {
          console.error("Register failed:", error);
          set({
            isLoading: false,
            error: error.response?.data?.message || "Đăng ký thất bại!"
          });
          throw error;
        }
      },

      logout: () => {
        setAccessToken(null); // Xóa token ở axios
        set({
          isAuthenticated: false,
          hasSeenOnboarding: true,
          user: null,
          token: null,
          error: null
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Hàm này chạy ngay sau khi data được load từ AsyncStorage xong
        if (state?.token) {
          console.log("Rehydrated token:", state.token);
          setAccessToken(state.token); // Nạp token vào axios ngay lập tức
        }
      },
    }
  )
);

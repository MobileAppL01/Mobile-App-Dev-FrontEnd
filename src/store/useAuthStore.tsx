import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService";
import { LoginRequest, RegisterRequest, UserData } from "../types/auth"; // Import UserData
import { setAccessToken, setupAxios } from "../services/axiosInstance";

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
  updateUser: (data: Partial<UserData>) => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasSeenOnboarding: false,
      isAuthenticated: false,
      user: null,
      token: null, // Init token state
      isLoading: false,
      error: null,

      setHasSeenOnboarding: (status) => set({ hasSeenOnboarding: status }),

      setError: (error) => set({ error }),

      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

      fetchProfile: async () => {
        try {
          const data = await authService.getMyProfile();
          // Map backend response to frontend UserData
          // Note: getMyProfile returns User entity or DTO?
          // It returns User entity/dto from backend.
          // Let's assume it matches structure or needs mapping.
          // Backend `UserController.getMyProfile` returns `User`. 
          // `User` entity has `id`, `firstName`, `lastName`, `email`, `phone`, `role`.
          // We need to map it to `UserData`.

          const currentUser = get().user;
          let role = data.roles && data.roles.length > 0 ? data.roles[0] : (data.role || currentUser?.role || "CLIENT");

          // Normalize role to match RootNavigator expectations
          if (role === 'OWNER') role = 'ROLE_OWNER';
          if (role === 'ADMIN') role = 'ROLE_ADMIN';
          if (role === 'PLAYER') role = 'ROLE_PLAYER';

          const fullUserData: UserData = {
            id: data.id?.toString() || currentUser?.id || "",
            fullName: data.fullName || data.email,
            email: data.email,
            role: role,
            phone: data.phone || "",
            avatar: data.avatar || currentUser?.avatar || "https://i.pravatar.cc/300",
          };
          set({ user: fullUserData });
        } catch (error) {
          console.log("Fetch profile failed", error);
        }
      },

      login: async (loginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(loginData);

          // Map backend response to frontend UserData
          const userRole = response.roles && response.roles.length > 0 ? response.roles[0] : "CLIENT";

          const userData: UserData = {
            id: response.id.toString(),
            fullName: response.fullName || response.username || response.email,
            email: response.email,
            role: userRole,
            phone: response.phone || "",

            // Check if backend response actually includes avatar (even if type doesn't say so)
            // Otherwise it will be updated by fetchProfile below
            avatar: (response as any).avatar || "https://i.pravatar.cc/300",
          };

          setAccessToken(response.token);

          set({
            isAuthenticated: true,
            hasSeenOnboarding: true,
            user: userData,
            token: response.token,

            isLoading: false,
          });

          // Fetch full profile to ensure avatar and other details are up to date
          await get().fetchProfile();
        } catch (error: any) {
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
        if (state?.token) {
          setAccessToken(state.token);
        }
      },
    }
  )
);

// Setup Axios Interceptor for Auto Logout
setupAxios(() => {
  useAuthStore.getState().logout();
});

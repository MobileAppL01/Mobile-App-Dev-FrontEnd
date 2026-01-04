// src/store/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getHasSeenOnboarding } from "../storage/onboardingStorage";


interface UserData {
  id: string;
  name: string;
  email: string;
  role: string; // 👈 Khai báo role ở đây
  avatar?: string;
  phone :string;
  gender: string;
  dob: string;
}

interface AuthState {
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean; // Thêm cái này nếu muốn quản lý đăng nhập riêng
  user: UserData | null; // Lưu thông tin user (tên, email...)

  // Actions
  setHasSeenOnboarding: (status: boolean) => void;
  login: (userData: UserData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      isAuthenticated: false,
      user: null,

      setHasSeenOnboarding: (status) => set({ hasSeenOnboarding: status }),

      login: (userData) =>
        set({
          isAuthenticated: true,
          hasSeenOnboarding: true, // Thường login xong là coi như xong onboarding
          user: userData,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          hasSeenOnboarding: true,
          user: null,
        }),
    }),
    {
      name: "auth-storage", // Tên key trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Cấu hình lưu trữ
    }
  )
);

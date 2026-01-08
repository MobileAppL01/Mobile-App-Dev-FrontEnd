// App.tsx
import React, { useEffect } from 'react';
import { useAuthStore } from './src/store/useAuthStore';
import { setAccessToken } from './src/services/axiosInstance';
import * as Sentry from '@sentry/react-native';
import NotificationToast from './src/components/NotificationToast';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 1. Import biến navigationIntegration từ RootNavigator
import RootNavigator, { navigationIntegration } from './src/navigation/RootNavigator';

// --- CẤU HÌNH SENTRY ---
Sentry.init({
  dsn: 'https://8a45200ffcbcf76361a77cc8a44c9edc@o4510502094438400.ingest.de.sentry.io/4510667428331600', 

  // --- THÊM 3 DÒNG NÀY ---
  enableAutoSessionTracking: true, // Bắt buộc bật tính năng theo dõi Session
  release: "bookington@1.0.0",     // Đặt tên app + phiên bản (Tùy ý bạn)
  dist: "1",                       // Mã build (thường là 1, 2, 3...)
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    navigationIntegration, // Integration điều hướng
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],
});

function App() {
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user); 

  // GỘP CHUNG VÀO 1 useEffect DUY NHẤT
  useEffect(() => {
    // 1. Luôn cập nhật token cho Axios mỗi khi token đổi
    setAccessToken(token);

    // 2. Logic định danh User cho Sentry
    if (token && user) {
      // --- KHI CÓ USER (ĐÃ LOGIN) ---
      console.log("Sentry User Tracking: ", user.email);
      
      Sentry.setUser({
        id: user.id ? user.id.toString() : 'unknown_id',
        email: user.email, 
        username: user.fullName,
        ip_address: "{{auto}}",
        data: {
          role: user.role,
          phone: user.phone,
        },
      });

      // Breadcrumb giúp bạn biết user vừa login xong thì làm gì tiếp theo
      Sentry.addBreadcrumb({
        category: 'auth',
        message: `User ${user.email} logged in`,
        level: 'info',
      });

    } else {
      // --- KHI LOGOUT / CHƯA LOGIN ---
      console.log("Sentry User Tracking: Cleared");
      Sentry.setUser(null);
    }

  }, [token, user]); // Theo dõi cả token và user

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <NotificationToast />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
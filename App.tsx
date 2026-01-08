// App.tsx
import React, { useEffect } from 'react';
import { useAuthStore } from './src/store/useAuthStore';
import { setAccessToken } from './src/services/axiosInstance';
import * as Sentry from '@sentry/react-native';
import NotificationToast from './src/components/NotificationToast';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdModal } from './src/components/common/AdModal';
import { Platform } from 'react-native'; // Import Platform
import { authService } from './src/services/authService'; // Import authService

import Constants from 'expo-constants'; // Import Constants

// 1. Import biến navigationIntegration từ RootNavigator
import RootNavigator, { navigationIntegration } from './src/navigation/RootNavigator';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native';

// --- NOTIFICATIONS CONFIG ---
// Check execution environment
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  // Bỏ qua nếu là Expo Go (vì không hỗ trợ push notifications trên Android SDK 53+ trong Expo Go)
  if (isExpoGo) {
    console.log("Expo Go detected. Skipping push notification registration.");
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  const projectId = 'a703c044-9af5-46ed-bf0a-271050cfda85';

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log("Push Token:", token);
    return token;
  } catch (e) {
    console.log("Error getting push token", e);
  }
}

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

      // Register Push Token
      registerForPushNotificationsAsync().then(pushToken => {
        if (pushToken) {
          console.log("Updating push token to backend...");
          authService.updatePushToken(pushToken).catch(err => console.log("Update token failed", err));
        }
      });

    } else {
      // --- KHI LOGOUT / CHƯA LOGIN ---
      Sentry.setUser(null);
    }

  }, [token, user]); // Theo dõi cả token và user

  // Ad Logic
  const [isAdVisible, setIsAdVisible] = React.useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAdVisible(true);
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <NotificationToast />
      <AdModal visible={isAdVisible} onClose={() => setIsAdVisible(false)} />
    </SafeAreaProvider>
  );
}

const styles = {
  container: {
    flex: 1,
  }
};

export default Sentry.wrap(App);
// App.tsx
import React, { useEffect } from 'react';
import { useAuthStore } from './src/store/useAuthStore';
import { setAccessToken } from './src/services/axiosInstance';
import RootNavigator from './src/navigation/RootNavigator';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://e3d5a5e0239809626e5bd2c16bb3d457@o4510502094438400.ingest.de.sentry.io/4510502405996624',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

import NotificationToast from './src/components/NotificationToast';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    setAccessToken(token);
  }, [token]);

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <NotificationToast />
    </SafeAreaProvider>
  );
}

export default App;
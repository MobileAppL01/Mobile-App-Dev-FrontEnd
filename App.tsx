import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://e3d5a5e0239809626e5bd2c16bb3d457@o4510502094438400.ingest.de.sentry.io/4510502405996624',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function App() {
  return <RootNavigator />;
});
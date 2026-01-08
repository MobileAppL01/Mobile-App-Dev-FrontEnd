// src/navigation/RootNavigator.tsx
import React, { useEffect } from "react"; // <--- THÊM useEffect
import {
  NavigationContainer,
  useNavigationContainerRef, // <--- THÊM useNavigationContainerRef
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Sentry from "@sentry/react-native"; // <--- THÊM Sentry

import ClientTabs from "./ClientTabs";
import { useAuthStore } from "../store/useAuthStore";

// Import Screens (Giữ nguyên như cũ)
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreenFirst from "../screens/Onboarding/OnboardingScreenFirst";
import OnboardingScreenSecond from "../screens/Onboarding/OnboardingScreenSecond";
import OnboardingScreenThird from "../screens/Onboarding/OnboardingScreenThird";
import PreLogin from "../screens/Onboarding/PreLogin";
import SignUpScreen from "../screens/Authentication/SignUpScreen";
import LoginScreen from "../screens/Authentication/LoginScreen";
import RevenueScreen from "../screens/ManagingCourt/Revenue/RevenueScreen";
import CourtDetailScreen from "../screens/BookingCourt/CourtDetailScreen";
import ReviewScreen from "../screens/BookingCourt/ReviewScreen";
import OwnerTabs from "./OwnerTabs";
import BookingTimeSelectionScreen from "../screens/BookingCourt/BookingTimeSelectionScreen";
import BookingConfirmScreen from "../screens/BookingCourt/BookingConfirmScreen";
import PaymentQRScreen from "../screens/Payment/PaymentQRScreen";
import ForgotPasswordScreen from "../screens/Authentication/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/Authentication/ResetPasswordScreen";
import PaymentWebViewScreen from "../screens/Payment/PaymentWebViewScreen";
import AboutUsScreen from "../screens/Profile/AboutUsScreen";
import AdminTabs from "./AdminTabs";
export type RootStackParamList = {
  Splash: undefined;
  OnboardingFirst: undefined;
  OnboardingSecond: undefined;
  OnboardingThird: undefined;
  PreLogin: undefined;
  Login: undefined;
  SignUp: { method?: string } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  ManagerHome: undefined;
  ManagerRevenue: undefined;
  PaymentWebView: { paymentUrl: string; booking: any; totalPrice: number };
  OwnerTabs: undefined;
  ClientTabs: undefined;
  CourtDetail: { location: any };
  ReviewScreen: { locationId: string };
  BookingTimeSelection: { location: any };
  BookingConfirm: { bookingInfo: any };
  PaymentQR: { booking: any; totalPrice: number; bankInfo: any };
  AboutUs: undefined;
  AdminTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true, // Đo thời gian load màn hình đầu tiên
});
export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);
  const userRole = useAuthStore((state) => state.user?.role);

  // 2. Tạo ref cho Navigation Container
  const navigationRef = useNavigationContainerRef();

  // Đăng ký ref với Sentry integration
  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  console.log("userrole at Root\n", userRole);

  return (
    // 4. Gắn ref vào NavigationContainer
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          userRole === "ROLE_ADMIN" ? (
            // 🟢 TRƯỜNG HỢP 1: LÀ ADMIN
            <>
              <Stack.Screen name="AdminTabs" component={AdminTabs} />
              {/* Nếu Admin cần xem chi tiết sân hay các màn hình khác, hãy copy các Stack.Screen chung vào đây */}
            </>
          ) : userRole === "ROLE_OWNER" ? (
            <>
              <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
            </>
          ) : (
            <>
              <Stack.Screen name="ClientTabs" component={ClientTabs} />
              <Stack.Screen name="CourtDetail" component={CourtDetailScreen} />
              <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
              <Stack.Screen
                name="BookingTimeSelection"
                component={BookingTimeSelectionScreen}
              />
              <Stack.Screen
                name="BookingConfirm"
                component={BookingConfirmScreen}
              />
              <Stack.Screen name="PaymentQR" component={PaymentQRScreen} />
              <Stack.Screen
                name="PaymentWebView"
                component={PaymentWebViewScreen}
              />
              <Stack.Screen name="AboutUs" component={AboutUsScreen} />
            </>
          )
        ) : (
          // === NOT LOGGED IN ===
          <>
            {!hasSeenOnboarding && (
              <>
                <Stack.Screen
                  name="OnboardingFirst"
                  component={OnboardingScreenFirst}
                />
                <Stack.Screen
                  name="OnboardingSecond"
                  component={OnboardingScreenSecond}
                />
                <Stack.Screen
                  name="OnboardingThird"
                  component={OnboardingScreenThird}
                />
                <Stack.Screen name="Splash" component={SplashScreen} />
              </>
            )}
            <Stack.Screen name="PreLogin" component={PreLogin} />
            {hasSeenOnboarding && (
              <Stack.Screen name="Splash" component={SplashScreen} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />

            {/* Guest Access */}
            <Stack.Screen name="ClientTabs" component={ClientTabs} />
            <Stack.Screen name="CourtDetail" component={CourtDetailScreen} />
            <Stack.Screen
              name="BookingTimeSelection"
              component={BookingTimeSelectionScreen}
            />
            <Stack.Screen
              name="BookingConfirm"
              component={BookingConfirmScreen}
            />
            <Stack.Screen name="PaymentQR" component={PaymentQRScreen} />
            <Stack.Screen
              name="PaymentWebView"
              component={PaymentWebViewScreen}
            />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

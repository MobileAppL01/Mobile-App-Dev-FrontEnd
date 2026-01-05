// src/navigation/RootNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ClientTabs from "./ClientTabs";

import { useAuthStore } from "../store/useAuthStore";

// Import Screens
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreenFirst from "../screens/Onboarding/OnboardingScreenFirst";
import OnboardingScreenSecond from "../screens/Onboarding/OnboardingScreenSecond";
import OnboardingScreenThird from "../screens/Onboarding/OnboardingScreenThird";
import PreLogin from "../screens/Onboarding/PreLogin";
import SignUpScreen from "../screens/Authentication/SignUpScreen";
import LoginScreen from "../screens/Authentication/LoginScreen";
import RevenueScreen from "../screens/ManagingCourt/RevenueScreen";
import CourtDetailScreen from "../screens/BookingCourt/CourtDetailScreen";
import ReviewScreen from "../screens/BookingCourt/ReviewScreen";
import OwnerTabs from "./OwnerTabs";
import BookingTimeSelectionScreen from '../screens/BookingCourt/BookingTimeSelectionScreen';
import BookingConfirmScreen from '../screens/BookingCourt/BookingConfirmScreen';
import PaymentQRScreen from '../screens/Payment/PaymentQRScreen';

export type RootStackParamList = {
  Splash: undefined;
  OnboardingFirst: undefined;
  OnboardingSecond: undefined;
  OnboardingThird: undefined;
  PreLogin: undefined;
  Login: undefined;
  ManagerRevenue: undefined;
  OwnerTabs: undefined;
  SignUp: undefined;
  ClientTabs: undefined;
  CourtDetail: { location: any };
  ReviewScreen: { locationId: string };
  BookingTimeSelection: { location: any };
  BookingConfirm: { bookingInfo: any };
  PaymentQR: { booking: any; totalPrice: number; bankInfo: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);
  const userRole = useAuthStore((state) => state.user?.role);
  console.log("userrole at Root\n", userRole);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // === LOGGED IN ===
          userRole === "ROLE_OWNER" ? (
            <>
              <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
            </>
          ) : (
            <>
              <Stack.Screen name="ClientTabs" component={ClientTabs} />
              <Stack.Screen name="CourtDetail" component={CourtDetailScreen} />
              <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
              <Stack.Screen name="BookingTimeSelection" component={BookingTimeSelectionScreen} />
              <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
              <Stack.Screen name="PaymentQR" component={PaymentQRScreen} />
            </>
          )
        ) : (
          // === NOT LOGGED IN ===
          <>
            {!hasSeenOnboarding && (
              <>
                <Stack.Screen name="OnboardingFirst" component={OnboardingScreenFirst} />
                <Stack.Screen name="OnboardingSecond" component={OnboardingScreenSecond} />
                <Stack.Screen name="OnboardingThird" component={OnboardingScreenThird} />
              </>
            )}
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="PreLogin" component={PreLogin} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />

            {/* Guest Access */}
            <Stack.Screen name="ClientTabs" component={ClientTabs} />
            <Stack.Screen name="CourtDetail" component={CourtDetailScreen} />
            <Stack.Screen name="BookingTimeSelection" component={BookingTimeSelectionScreen} />
            <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
            <Stack.Screen name="PaymentQR" component={PaymentQRScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

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
import ManagerHomeScreen from "../screens/ManagingCourt/ManagerHomeScreen";
import RevenueScreen from "../screens/ManagingCourt/RevenueScreen";
import CourtDetailScreen from "../screens/BookingCourt/CourtDetailScreen";
import ReviewScreen from "../screens/BookingCourt/ReviewScreen";

export type RootStackParamList = {
  Splash: undefined;
  OnboardingFirst: undefined;
  OnboardingSecond: undefined;
  OnboardingThird: undefined;
  PreLogin: undefined;
  Home: undefined;
  SignUp: { method: "email" | "phone" };
  Login: undefined;
  ManagerHome: undefined;
  ManagerRevenue: undefined;
  ClientTabs: undefined;
  CourtDetail: { court: any };
  ReviewScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, hasSeenOnboarding, user } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // === LOGGED IN ===
          user?.role === "MANAGER" ? (
            <>
              <Stack.Screen name="ManagerHome" component={ManagerHomeScreen} />
              <Stack.Screen name="ManagerRevenue" component={RevenueScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="ClientTabs" component={ClientTabs} />
              <Stack.Screen name="CourtDetail" component={CourtDetailScreen} />
              <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
            </>
          )
        ) : (
          // === NOT LOGGED IN ===
          <>
            {/* Show Onboarding first if not seen */}
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
              </>
            )}

            {/* Then Splash */}
            <Stack.Screen name="Splash" component={SplashScreen} />

            <Stack.Screen name="PreLogin" component={PreLogin} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

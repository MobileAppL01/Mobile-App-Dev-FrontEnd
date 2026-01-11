// src/navigation/ManagerNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ManagerLocationsScreen from "../screens/ManagingCourt/Location/ManagerLocationScreen";
import ManagerCourtsScreen from "../screens/ManagingCourt/Court/ManagerCourtScreen";
import RevenueScreen from "../screens/ManagingCourt/Revenue/RevenueScreen";
import OwnerReviewManagerScreen from '../screens/ManagingCourt/OwnerReviewManagerScreen';
import AboutUsScreen from "../screens/Profile/AboutUsScreen";

export type ManagerStackParamList = {
  ManagerLocations: undefined;
  ManagerCourts: { cluster: any }; // Truyền object cluster sang màn chi tiết
  Revenue: { courtItem: any };
  OwnerReviewManager: { locationId: number; locationName: string };
  AboutUs: undefined;
};

const Stack = createNativeStackNavigator<ManagerStackParamList>();

const ManagerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ManagerLocations"
        component={ManagerLocationsScreen}
      />
      <Stack.Screen name="ManagerCourts" component={ManagerCourtsScreen} />
      <Stack.Screen name="Revenue" component={RevenueScreen} />
      <Stack.Screen name="OwnerReviewManager" component={OwnerReviewManagerScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
    </Stack.Navigator>
  );
};

export default ManagerNavigator;

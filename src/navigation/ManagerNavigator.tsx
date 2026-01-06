// src/navigation/ManagerNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ManagerLocationsScreen from "../screens/ManagingCourt/Location/ManagerLocationScreen";
import ManagerCourtsScreen from "../screens/ManagingCourt/Court/ManagerCourtScreen";
import RevenueScreen from "../screens/ManagingCourt/Revenue/RevenueScreen";

export type ManagerStackParamList = {
  ManagerLocations: undefined;
  ManagerCourts: { cluster: any }; // Truyền object cluster sang màn chi tiết
  Revenue: { courtItem: any };
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
    </Stack.Navigator>
  );
};

export default ManagerNavigator;

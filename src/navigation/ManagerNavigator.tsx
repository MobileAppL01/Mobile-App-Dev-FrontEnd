import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManagerLocationsScreen from '../screens/ManagingCourt/ManagerLocationScreen';
import ManagerCourtsScreen from '../screens/ManagingCourt/ManagerCourtScreen';
import OwnerReviewManagerScreen from '../screens/ManagingCourt/OwnerReviewManagerScreen';

export type ManagerStackParamList = {
  ManagerLocations: undefined;
  ManagerCourts: { cluster: any }; // Truyền object cluster sang màn chi tiết
  OwnerReviewManager: { locationId: number; locationName: string };
};

const Stack = createNativeStackNavigator<ManagerStackParamList>();

const ManagerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManagerLocations" component={ManagerLocationsScreen} />
      <Stack.Screen name="ManagerCourts" component={ManagerCourtsScreen} />
      <Stack.Screen name="OwnerReviewManager" component={OwnerReviewManagerScreen} />
    </Stack.Navigator>
  );
};

export default ManagerNavigator;
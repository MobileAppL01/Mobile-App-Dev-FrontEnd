import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import ManagerHomeScreen from '../screens/ManagingCourt/ManagerHomeScreen';
import RevenueScreen from '../screens/ManagingCourt/RevenueScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import ManagerNavigator from './ManagerNavigator';

const NotificationScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Màn hình Thông báo</Text>
  </View>
);

const CameraScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Màn hình Camera Giám sát</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const OwnerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B9AFF', // Màu xanh chủ đạo
        tabBarInactiveTintColor: '#5E5E5E', // Màu xám khi không active
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          // Đổ bóng (Shadow)
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Sân của tôi') {
            // Icon toà nhà/doanh nghiệp
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Thống kê') {
            // Icon biểu đồ
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Thông báo') {
            // Icon chuông
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Thông Tin') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Render Icon
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Sân của tôi" component={ManagerNavigator} />
      <Tab.Screen name="Thống kê" component={RevenueScreen} />
      <Tab.Screen name="Thông báo" component={NotificationScreen} />
      <Tab.Screen name="Thông tin" component={UserProfileScreen} />
    </Tab.Navigator>
  );
};

export default OwnerTabs;
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import ManagerHomeScreen from '../screens/ManagingCourt/ManagerHomeScreen';
import RevenueScreen from '../screens/ManagingCourt/Revenue/RevenueScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import ManagerNavigator from './ManagerNavigator';
import OwnerNotificationScreen from '../screens/ManagingCourt/OwnerNotificationScreen';
import { useInboxStore } from '../store/useInboxStore';

import ManagerBookingScreen from '../screens/ManagingCourt/ManagerBookingScreen';

const Tab = createBottomTabNavigator();

const OwnerTabs = () => {
  // ...
  // Get unread count
  const unreadCount = useInboxStore(state => state.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B9AFF',
        tabBarInactiveTintColor: '#5E5E5E',
        tabBarStyle: {
          // ... same styles
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
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
          // ... same icon logic
          let iconName: any;

          if (route.name === 'Sân của tôi') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Lịch đặt') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Thống kê') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Thông báo') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Thông Tin') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Sân của tôi" component={ManagerNavigator} />
      <Tab.Screen name="Lịch đặt" component={ManagerBookingScreen} />
      <Tab.Screen name="Thống kê" component={RevenueScreen} />
      <Tab.Screen
        name="Thông báo"
        component={OwnerNotificationScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined
        }}
      />
      <Tab.Screen name="Thông Tin" component={UserProfileScreen} />
    </Tab.Navigator>
  );
};

export default OwnerTabs;
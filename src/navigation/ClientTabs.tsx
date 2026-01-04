import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

// Import Icons
import { HomeIcon, NotificationIcon, HistoryIcon, InfoIcon } from '../components/CustomIcons';

// Import Screens
import HomeScreen from '../screens/BookingCourt/HomeScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import BookingHistoryScreen from '../screens/BookingHistory/BookingHistory';

// --- Placeholder Screens ---
const NotificationScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Màn hình Thông Báo</Text>
  </View>
);

const HistoryScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Màn hình Lịch Sử</Text>
  </View>
);

const InfoScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Màn hình Thông Tin (Profile)</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const ClientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B9AFF', // Blue active
        tabBarInactiveTintColor: '#5E5E5E', // Grey inactive (matching SVG default)
        tabBarStyle: {
          height: 85,
          paddingBottom: 10,
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
          marginTop: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Trang Chủ') {
            return <HomeIcon color={color} size={24} />;
          } else if (route.name === 'Thông Báo') {
            return <NotificationIcon color={color} size={24} />;
          } else if (route.name === 'Lịch Sử') {
            return <HistoryIcon color={color} size={24} />;
          } else if (route.name === 'Thông Tin') {
            return <InfoIcon color={color} size={24} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Trang Chủ" component={HomeScreen} />
      <Tab.Screen name="Thông Báo" component={NotificationScreen} />
      <Tab.Screen name="Lịch Sử" component={BookingHistoryScreen} />
      <Tab.Screen name="Thông Tin" component={UserProfileScreen} />
    </Tab.Navigator>
  );
};

export default ClientTabs;
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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


const Tab = createBottomTabNavigator();

const ClientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B9AFF',
        tabBarInactiveTintColor: '#5E5E5E',
        tabBarStyle: {
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
          let iconName;
          if (route.name === 'Trang Chủ') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Thông Báo') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Lịch Sử') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Thông Tin') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName as any} size={24} color={color} />;
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
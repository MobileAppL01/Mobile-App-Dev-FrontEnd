import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInboxStore } from '../store/useInboxStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Screens
import HomeScreen from '../screens/BookingCourt/HomeScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import BookingHistoryScreen from '../screens/BookingHistory/BookingHistory';
import NotificationScreen from '../screens/Notification/NotificationScreen';

const Tab = createBottomTabNavigator();

const ClientTabs = () => {
  const unreadCount = useInboxStore(state => state.unreadCount);
  const fetchNotifications = useInboxStore(state => state.fetchNotifications);

  useEffect(() => {
    fetchNotifications();
    // Optional: Polling every minute?
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
  }, []);

  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B9AFF',
        tabBarInactiveTintColor: '#5E5E5E',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
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
          paddingBottom: insets.bottom > 0 ? 0 : 5, // Adjust text if needed
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
      <Tab.Screen
        name="Thông Báo"
        component={NotificationScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EF4444', fontSize: 10, minWidth: 16, height: 16 }
        }}
      />
      <Tab.Screen name="Lịch Sử" component={BookingHistoryScreen} />
      <Tab.Screen name="Thông Tin" component={UserProfileScreen} />
    </Tab.Navigator>
  );
};

export default ClientTabs;
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// import AdminUserListScreen from '../screens/Admin/AdminUserListScreen';
// import AdminCourtListScreen from '../screens/Admin/AdminCourtListScreen';
import UserProfileScreen from '../screens/Profile/UserProfileScreen';
import AdminUserListScreen from '../screens/Admin/AdminUserListScreen';

// --- SỬA 1: Định nghĩa kiểu cho Props của Placeholder ---
// Component trong Navigator nhận prop 'route' chứa params
const PlaceholderScreen = ({ route }: { route: any }) => {
  const name = route.params?.name || 'Màn hình';
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Màn hình {name}</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
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
          // --- SỬA 2: Khai báo kiểu 'any' cho iconName để tránh lỗi string literal ---
          let iconName: any = 'help-circle'; 

          if (route.name === 'Người dùng') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Tất cả sân') {
            iconName = focused ? 'layers' : 'layers-outline';
          } else if (route.name === 'Thông Tin') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Người dùng" 
        component={AdminUserListScreen} 
      />


      <Tab.Screen 
        name="Thông Tin" 
        component={UserProfileScreen} 
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
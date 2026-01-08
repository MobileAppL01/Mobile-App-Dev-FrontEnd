import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Header } from '../../components/Header';

// Link API lấy danh sách user (Thường backend chuẩn sẽ là /users)
const API_URL = 'https://bookington-app.mangobush-e7ff5393.canadacentral.azurecontainerapps.io/api/v1'; 

const AdminUserListScreen = () => {
  // 👇 Lấy Token trực tiếp từ Store thay vì AsyncStorage thủ công
  const token = useAuthStore((state) => state.token);
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Hàm gọi API
  const fetchUsers = async () => {
    // Nếu chưa có token (ví dụ chưa login hoặc store chưa load xong), dừng lại
    if (!token) {
        // console.log("Chờ token...");
        return;
    }

    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`, // Sử dụng token từ store
          'Content-Type': 'application/json',
        },
      });

      setUsers(response.data);
      filterData(response.data, searchText, filterRole);
    } catch (error) {
      console.error("Fetch user error:", error);
      // Kiểm tra nếu lỗi 403/401 thì có thể do token hết hạn hoặc không có quyền
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 👇 useEffect sẽ chạy lại mỗi khi biến 'token' thay đổi
  // Điều này đảm bảo API chỉ gọi khi Token đã sẵn sàng
  useEffect(() => {
    fetchUsers();
  }, [token]); 

  // Xử lý Filter và Search
  const filterData = (dataList, search, role) => {
    let result = dataList;

    // 1. Lọc theo Role
    if (role !== 'ALL') {
      result = result.filter(user => user.role === role);
    }

    // 2. Lọc theo Search Text
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(lowerSearch)) ||
        (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
        (user.phone && user.phone.includes(lowerSearch))
      );
    }

    setFilteredUsers(result);
  };

  // Khi thay đổi search hoặc role tab
  useEffect(() => {
    filterData(users, searchText, filterRole);
  }, [searchText, filterRole, users]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const renderUserItem = ({ item }) => {
    let roleColor = '#6c757d'; 
    
    if (item.role === 'ADMIN') {
      roleColor = '#dc3545';
    } else if (item.role === 'OWNER') {
      roleColor = '#3B9AFF';
    } else if (item.role === 'PLAYER') {
      roleColor = '#28a745';
    }

    const displayName = item.fullName ? item.fullName : (item.email ? item.email.split('@')[0] : "User");

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: roleColor }]}>
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>{displayName}</Text>
            <Text style={styles.emailText}>{item.email} - {item.id}</Text>
            
            <View style={styles.row}>
                <Ionicons name="call-outline" size={14} color="#666" style={{marginRight: 4}} />
                <Text style={styles.phoneText}>{item.phone || 'Chưa có SĐT'}</Text>
            </View>
          </View>

          <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}> 
            <Text style={[styles.roleText, { color: roleColor }]}>{item.role}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header/>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên, email, số điện thoại..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        {['ALL', 'OWNER', 'PLAYER', 'ADMIN'].map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.filterTab,
              filterRole === role && styles.filterTabActive
            ]}
            onPress={() => setFilterRole(role)}
          >
            <Text style={[
              styles.filterText,
              filterRole === role && styles.filterTextActive
            ]}>
              {role === 'ALL' ? 'Tất cả' : role}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B9AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
                <Ionicons name="search-outline" size={50} color="#ccc"/>
                <Text style={{color: '#888', marginTop: 10}}>Không tìm thấy kết quả</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 10,
  },
  filterTabActive: {
    backgroundColor: '#3B9AFF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  phoneText: {
    fontSize: 13,
    color: '#888',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start', 
    marginLeft: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default AdminUserListScreen;
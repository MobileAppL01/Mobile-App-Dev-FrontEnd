import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { Header } from '../../components/Header';
import { adminService } from '../../services/adminService';
import { useNotificationStore } from '../../store/useNotificationStore';
import { SwipeListView } from 'react-native-swipe-list-view';

const AdminUserListScreen = () => {
  const token = useAuthStore((state) => state.token);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const showNotification = useNotificationStore(state => state.showNotification);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const fetchUsers = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data || []);
      filterData(data || [], searchText, filterRole);
    } catch (error) {
      console.error("Fetch user error:", error);
      if (error && error.response && error.response.status === 403) {
        showNotification("Bạn không có quyền truy cập hoặc phiên đã hết hạn", "error");
      } else {
        showNotification("Không thể tải danh sách người dùng", "error");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (token) {
        await fetchProfile();
        fetchUsers();
      }
    };
    init();
  }, [token]);

  // Xử lý Filter và Search
  const filterData = (dataList, search, role) => {
    let result = dataList;

    if (role !== 'ALL') {
      result = result.filter(user => user.role === role);
    }

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

  useEffect(() => {
    filterData(users, searchText, filterRole);
  }, [searchText, filterRole, users]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const confirmDelete = (user, rowMap) => {
    // Close row first
    if (rowMap[user.id]) {
      rowMap[user.id].closeRow();
    }

    if (user.role === 'ADMIN') {
      Alert.alert("Không thể xóa", "Bạn không thể xóa tài khoản Admin.");
      return;
    }

    const isOwner = user.role === 'OWNER';
    const warningMessage = isOwner
      ? `LƯU Ý: Nếu chủ sân này đang có sân bãi hoạt động, bạn sẽ KHÔNG THỂ xóa cho đến khi họ xóa hết dữ liệu sân.\n\nBạn có chắc chắn muốn thử xóa?`
      : `Bạn có chắc chắn muốn xóa người dùng ${user.fullName || user.email}? Hành động này không thể hoàn tác.`;

    Alert.alert(
      "Xác nhận xóa",
      warningMessage,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await adminService.deleteUser(user.id);
              showNotification("Đã xóa người dùng thành công", "success");
              onRefresh(); // Refresh list
            } catch (error) {
              console.error("Delete user error:", error);
              const msg = error.response?.data?.message || "";

              if (msg.includes("foreign key constraint") || msg.includes("constraint")) {
                Alert.alert(
                  "Không thể xóa",
                  "Người dùng này đang có dữ liệu ràng buộc (Sân cầu, Cơ sở, v.v). Vui lòng yêu cầu họ xóa dữ liệu trước hoặc xóa thủ công các dữ liệu liên quan."
                );
              } else {
                showNotification("Xóa người dùng thất bại: " + (msg || "Lỗi không xác định"), "error");
              }
            }
          }
        }
      ]
    );
  };

  const handleEdit = (user, rowMap) => {
    if (rowMap[user.id]) rowMap[user.id].closeRow();
    Alert.alert("Tính năng đang phát triển", "Chức năng chỉnh sửa thông tin người dùng sẽ sớm được cập nhật.");
  };

  const renderUserItem = ({ item }) => {
    let roleColor = '#6B7280'; // Default Gray
    let roleBg = '#F3F4F6';

    if (item.role === 'ADMIN') {
      roleColor = '#EF4444'; // Red
      roleBg = '#FEE2E2';
    } else if (item.role === 'OWNER') {
      roleColor = '#4F46E5'; // Indigo
      roleBg = '#EEF2FF';
    } else if (item.role === 'PLAYER') {
      roleColor = '#059669'; // Emerald Green
      roleBg = '#D1FAE5';
    }

    const displayName = item.fullName ? item.fullName : (item.email ? item.email.split('@')[0] : "User");

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: roleBg }]}>
              <Text style={[styles.avatarText, { color: roleColor }]}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardRight}>
          <View style={styles.headerRow}>
            <Text style={styles.nameText}>{displayName}</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleBg }]}>
              <Text style={[styles.roleText, { color: roleColor }]}>{item.role}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
            <Text style={styles.emailText} numberOfLines={1}>{item.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
            <Text style={styles.phoneText}>{item.phone || 'Chưa cập nhật'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => handleEdit(data.item, rowMap)}
      >
        <Ionicons name="create-outline" size={24} color="white" />
        <Text style={styles.backTextWhite}>Sửa</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => confirmDelete(data.item, rowMap)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
        <Text style={styles.backTextWhite}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: 'white', zIndex: 10 }}>
        <Header />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.searchSection}>
          <Text style={styles.screenTitle}>Quản lý người dùng</Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm tên, email, số điện thoại..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
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
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3B9AFF" />
          </View>
        ) : (
          <SwipeListView
            data={filteredUsers}
            renderItem={renderUserItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-150}
            disableRightSwipe
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="search-outline" size={50} color="#E5E7EB" />
                <Text style={{ color: '#9CA3AF', marginTop: 10 }}>Không tìm thấy kết quả</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  searchSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    zIndex: 5,
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    alignSelf: 'center',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  filterTabActive: {
    backgroundColor: '#3B9AFF',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    height: 90, // Fixed height for smooth swipe
  },
  cardLeft: {
    marginRight: 16,
  },
  cardRight: {
    flex: 1,
    justifyContent: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  emailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  phoneText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  // Swipe Handlers
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 15,
    marginBottom: 12, // Match card margin
    borderRadius: 16,
    overflow: 'hidden',
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: '#3B82F6', // Blue
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#EF4444', // Red
    right: 0,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  backTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 2,
  },
});

export default AdminUserListScreen;
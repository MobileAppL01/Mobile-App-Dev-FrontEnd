import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ManagerStackParamList } from "../../../navigation/ManagerNavigator";
import { styles } from "./ManageLocationScreen.styles";
import { useCourtStore } from "../../../store/useCourtStore";
import { Header } from "../../../components/Header";

// IMPORT CÁC COMPONENT CON
import LocationFormModal from "./LocationFormModal";
import PromotionFormModal from "./PromotionFormModal";
import LocationItem from "./LocationItem"; // Import component vừa tạo
import { manageCourtService } from "../../../services/manageCourtService"; // Import service để gọi API
const ManagerLocationsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ManagerStackParamList>>();

  const {
    locations,
    fetchLocations,
    isLoading,
    addLocation,
    deleteLocation,
    createPromotion,
  } = useCourtStore();

  // State Modal Visibility
  const [modalVisible, setModalVisible] = useState(false);
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // State Selection Data
  const [editingCluster, setEditingCluster] = useState<any>(null);
  const [selectedClusterForPromo, setSelectedClusterForPromo] =
    useState<any>(null);
  const [updateSignal, setUpdateSignal] = useState<string>("");
  useEffect(() => {
    fetchLocations();
  }, []);

  // --- LOGIC XỬ LÝ LOCATION ---

  const handleOpenAddLocation = () => {
    setEditingCluster(null);
    setModalVisible(true);
  };

  const handleOpenEditLocation = (item: any) => {
    setEditingCluster(item);
    setModalVisible(true);
  };

  const handleSubmitLocation = async (data: any) => {
    if (editingCluster) {
      Alert.alert("Thông báo", "Chức năng cập nhật đang phát triển");
      // Logic Update gọi ở đây
    } else {
      try {
        await addLocation(data);
        Alert.alert("Thành công", "Đã thêm cụm sân mới!");
        setModalVisible(false);
      } catch (err) {
        // Store đã log lỗi
      }
    }
  };

  const confirmDelete = (item: any) => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc chắn muốn xóa "${item.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLocation(item.id);
          } catch (e) { }
        },
      },
    ]);
  };

  // --- LOGIC XỬ LÝ PROMOTION ---

  const handleOpenPromo = (item: any) => {
    setSelectedClusterForPromo(item);
    setPromoModalVisible(true);
  };

  const handleSubmitPromo = async (data: any) => {
    try {
      await createPromotion({
        locationId: selectedClusterForPromo.id,
        code: data.code,
        discountType: "PERCENT",
        discountValue: data.discountValue,
        startDate: data.startDate,
        endDate: data.endDate,
        description: "Khuyến mãi từ App Owner",
      });
      Alert.alert("Thành công", "Đã tạo khuyến mãi!");

      // 2. BẮN TÍN HIỆU CẬP NHẬT
      // Kết hợp ID và Date.now() để đảm bảo chuỗi luôn thay đổi, kích hoạt useEffect
      setUpdateSignal(`${selectedClusterForPromo.id}-${Date.now()}`);
      setPromoModalVisible(false);
    } catch (error) {
      // Store đã log lỗi
    }
  };

  // --- UI RENDER ---

  // Hàm chuyển trang
  const handleNavigateDetail = (item: any) => {
    navigation.navigate("ManagerCourts", { cluster: item });
  };

  // Hàm xem đánh giá
  const handleViewReviews = (item: any) => {
    // Navigate is typed with StackParamList so it should work if OwnerReviewManager is in it
    (navigation as any).navigate('OwnerReviewManager', { locationId: item.id, locationName: item.name });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Tìm tên cụm sân..."
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleOpenAddLocation}
        >
          <Ionicons name="add-circle-outline" size={28} color="#3B9AFF" />
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {isLoading && !locations.length ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B9AFF" />
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item: any) => item.id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchLocations} />
          }
          // Sử dụng LocationItem Component
          renderItem={({ item }) => (
            <LocationItem
              item={item}
              onPress={() => handleNavigateDetail(item)}
              onLongPress={handleOpenEditLocation}
              onDelete={confirmDelete}
              onOpenPromo={handleOpenPromo}
              refreshTrigger={updateSignal}
              onViewReviews={handleViewReviews}
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: "#999" }}>Chưa có cụm sân nào</Text>
            </View>
          }
        />
      )}

      {/* --- CÁC MODAL COMPONENT --- */}

      <LocationFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitLocation}
        initialData={editingCluster}
      />

      <PromotionFormModal
        visible={promoModalVisible}
        onClose={() => setPromoModalVisible(false)}
        onSubmit={handleSubmitPromo}
        clusterName={selectedClusterForPromo?.name}
      />
    </SafeAreaView>
  );
};

export default ManagerLocationsScreen;

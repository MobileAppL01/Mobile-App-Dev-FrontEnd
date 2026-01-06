import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ManagerStackParamList } from "../../../navigation/ManagerNavigator";

import { useCourtStore } from "../../../store/useCourtStore";
import { styles } from "./ManagerCourtScreen.styles";
import { Header } from "../../../components/Header"; // Or your custom header path
import { manageCourtService } from "../../../services/manageCourtService";

// IMPORT COMPONENTS
import CourtFormModal from "./CourtFormModal";
import CourtItem from "./CourtItem";

type ManagerCourtsNavigationProp = NativeStackNavigationProp<ManagerStackParamList>;

const ManagerCourtsScreen = () => {
  const route = useRoute<RouteProp<ManagerStackParamList, "ManagerCourts">>();
  const navigation = useNavigation<ManagerCourtsNavigationProp>();
  const { cluster } = route.params;

  // State to store all bookings for this location
  const [bookings, setBookings] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    currentCourts,
    fetchCourtByLocation,
    addCourt,
    deleteCourt,
    updateCourtStatus,
    isLoading,
  } = useCourtStore();

  // --- 1. API FUNCTION TO FETCH BOOKINGS ---
  const fetchBookings = useCallback(async () => {
    if (!cluster?.id) return;
    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      const res = await manageCourtService.getBookingsByLocationAndDate(
        cluster.id,
        today
      );

      console.log("booking result", res.result);
      if (res && res.result) {
        setBookings(res.result);
      }
    } catch (error) {
      console.log("Lỗi fetch booking:", error);
    }
  }, [cluster]);

  // --- 2. INITIAL FETCH ---
  useEffect(() => {
    if (cluster?.id) {
      // Fetch both Courts and Bookings
      fetchCourtByLocation(cluster.id);
      fetchBookings();
    }
  }, [cluster, fetchBookings]);

  // --- NAVIGATION ---
  const handleNavigateRevenue = (item: any) => {
    navigation.navigate("Revenue", { courtItem: item });
  };

  // --- LOGIC FUNCTIONS (CRUD) ---
  const handleSaveCourt = async (courtName: string) => {
    try {
      await addCourt(cluster.id, courtName);
      Alert.alert("Thành công", "Đã thêm sân mới!");
      setModalVisible(false);
    } catch (error) {
      // Store handles error logging
    }
  };

  const confirmDelete = (item: any) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa "${item.name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCourt(item.id);
            } catch (error) {}
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (item: any, value: boolean) => {
    const newStatus = value ? "ACTIVE" : "MAINTENANCE";
    try {
      await updateCourtStatus(item.id, newStatus);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái lúc này");
    }
  };

  // --- 3. RENDER ITEM FUNCTION ---
  // This separates logic to filter bookings specific to each court
  const renderCourtItem = ({ item }: { item: any }) => {
    // Filter the big 'bookings' list to find ones matching this court's name
    const courtBookings = bookings.filter((b) => b.courtName === item.name);

    return (
      <CourtItem
        item={item}
        bookings={courtBookings} // Pass the filtered bookings to the child
        onDelete={confirmDelete}
        onToggleStatus={handleToggleStatus}
        onPress={handleNavigateRevenue}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.subHeaderTitle}>{cluster.name}</Text>
          <Text style={styles.subHeaderSubtitle}>
            {currentCourts?.length || 0} sân đang hoạt động
          </Text>
        </View>
      </View>

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
            placeholder={`Tìm trong ${cluster.name}...`}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#3B9AFF" />
        </TouchableOpacity>
      </View>

      {/* List Sân */}
      {isLoading && currentCourts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B9AFF" />
        </View>
      ) : (
        <FlatList
          data={currentCourts}
          keyExtractor={(item: any) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                fetchCourtByLocation(cluster.id);
                fetchBookings(); // Refresh bookings on pull-down
              }}
            />
          }
          // Use the custom render function defined above
          renderItem={renderCourtItem} 
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: "#999" }}>Cụm này chưa có sân nào</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal Form */}
      <CourtFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSaveCourt}
        clusterName={cluster.name}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
};

export default ManagerCourtsScreen;
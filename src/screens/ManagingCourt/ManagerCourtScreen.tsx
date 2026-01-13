// src/screens/Manager/ManagerCourtsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  Switch, // Import Switch
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { ManagerStackParamList } from "../../navigation/ManagerNavigator";

import { useCourtStore } from "../../store/useCourtStore";
import { useNotificationStore } from "../../store/useNotificationStore";

type ManagerCourtsRouteProp = RouteProp<ManagerStackParamList, "ManagerCourts">;

const ManagerCourtsScreen = () => {
  const route = useRoute<ManagerCourtsRouteProp>();
  const navigation = useNavigation();
  const { cluster } = route.params;

  // Lấy đầy đủ các actions từ Store
  const {
    currentCourts,
    fetchCourtByLocation,
    addCourt,
    deleteCourt,
    updateCourtStatus,
    isLoading,
  } = useCourtStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [newCourtName, setNewCourtName] = useState("");

  // Fetch dữ liệu khi vào màn hình
  useEffect(() => {
    if (cluster?.id) {
      fetchCourtByLocation(cluster.id);
    }
  }, [cluster]);

  // --- XỬ LÝ LƯU (THÊM MỚI) ---
  const handleSave = async () => {
    if (!newCourtName.trim()) {
      useNotificationStore.getState().showNotification("Vui lòng nhập tên sân", "warning");
      return;
    }

    try {
      await addCourt(cluster.id, newCourtName);
      useNotificationStore.getState().showNotification("Đã thêm sân mới!", "success");
      setModalVisible(false);
      setNewCourtName("");
    } catch (error: any) {
      useNotificationStore.getState().showNotification(error.response?.data?.message || "Thêm sân thất bại", "error");
    }
  };

  // --- XỬ LÝ XÓA ---
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
              // Gọi hàm deleteCourt từ store (cần truyền ID sân)
              await deleteCourt(item.id);
              useNotificationStore.getState().showNotification("Đã xóa sân!", "success");
            } catch (error: any) {
              useNotificationStore.getState().showNotification(error.response?.data?.message || "Xóa thất bại", "error");
            }
          },
        },
      ]
    );
  };

  // --- XỬ LÝ ĐỔI TRẠNG THÁI (SWITCH) ---
  const handleToggleStatus = async (item: any, value: boolean) => {
    const newStatus = value ? "ACTIVE" : "MAINTENANCE";
    try {
      await updateCourtStatus(item.id, newStatus);
      useNotificationStore.getState().showNotification("Cập nhật trạng thái thành công", "success");
    } catch (error: any) {
      useNotificationStore.getState().showNotification("Không thể cập nhật trạng thái lúc này", "error");
    }
  };

  // --- RENDER ITEM ---
  const renderCourtItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Icon Cầu Lông bên trái */}
      <View style={styles.courtIconContainer}>
        <MaterialCommunityIcons name="badminton" size={40} color="#3B9AFF" />
      </View>

      {/* Nội dung ở giữa */}
      <View style={styles.cardContent}>
        {/* Tên sân và Badge trạng thái */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "ACTIVE"
                ? { backgroundColor: "#2ecc71" }
                : { backgroundColor: "#f1c40f" }, // Vàng cam cho bảo trì
            ]}
          >
            <Text style={styles.statusText}>
              {item.status === "ACTIVE" ? "HOẠT ĐỘNG" : "BẢO TRÌ"}
            </Text>
          </View>
        </View>

        {/* Dòng Switch trạng thái */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Trạng thái:</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={item.status === "ACTIVE" ? "#3B9AFF" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(value) => handleToggleStatus(item, value)}
            value={item.status === "ACTIVE"}
          />
        </View>
      </View>

      {/* Nút Thùng Rác (Delete) bên phải */}
      <TouchableOpacity
        style={styles.trashIconBtn}
        onPress={() => confirmDelete(item)}
      >
        <Ionicons name="trash-outline" size={22} color="#FF4757" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Custom */}
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

      {/* Search Bar & Add Button */}
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
          onPress={() => (navigation as any).navigate("OwnerReviewManager", { locationId: cluster.id, locationName: cluster.name })}
        >
          <Ionicons name="star-half-outline" size={28} color="#FFA500" />
        </TouchableOpacity>

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
          renderItem={renderCourtItem}
          keyExtractor={(item: any, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => fetchCourtByLocation(cluster.id)}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: "#999" }}>Cụm này chưa có sân nào</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 15 }}
        />
      )}

      {/* --- MODAL THÊM SÂN --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalKeyboardContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Thêm Sân Mới</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="black" />
                  </TouchableOpacity>
                </View>

                {/* Modal Body */}
                <View>
                  <View style={styles.infoBox}>
                    <Text style={{ color: "#666", fontSize: 13 }}>
                      Đang thêm vào cơ sở:
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 15,
                        color: "#3B9AFF",
                      }}
                    >
                      {cluster.name}
                    </Text>
                  </View>

                  <Text style={styles.label}>
                    Tên sân <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={newCourtName}
                    onChangeText={setNewCourtName}
                    placeholder="Ví dụ: Sân 3, Sân VIP..."
                    autoFocus={true}
                  />

                  <Text style={styles.label}>Trạng thái mặc định</Text>
                  <View style={styles.statusBadgePreview}>
                    <Text style={{ color: "#2ecc71", fontWeight: "bold" }}>
                      HOẠT ĐỘNG
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.saveBtnText}>Lưu Sân</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" }, // Removed paddingHorizontal
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 10,
    paddingHorizontal: 15, // Added padding
  },
  backButton: { padding: 5, marginRight: 10 },
  subHeaderTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  subHeaderSubtitle: { fontSize: 12, color: "#666" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 15, // Added padding
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
    backgroundColor: "#FAFAFA",
  },
  searchInput: { flex: 1 },
  iconBtn: { marginLeft: 10 },

  // CARD STYLES
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
    padding: 10,
    alignItems: "center",
  },
  courtIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { color: "white", fontSize: 10, fontWeight: "bold" },

  // Switch Styles
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  switchLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },

  // Trash Icon
  trashIconBtn: {
    padding: 10,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  // MODAL STYLES
  modalKeyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },
  saveBtn: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  infoBox: {
    backgroundColor: "#F5F7FA",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3B9AFF",
  },
  statusBadgePreview: {
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
});

export default ManagerCourtsScreen;
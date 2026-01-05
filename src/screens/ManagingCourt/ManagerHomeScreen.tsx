import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView, // Import mới
  Platform, // Import mới để check iOS/Android
  Keyboard, // Import để dismiss bàn phím
  TouchableWithoutFeedback, // Import để bấm ra ngoài tắt phím
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useCourtStore } from "../../store/useCourtStore";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";

const { width, height } = Dimensions.get("window");

const ManagerHomeScreen = () => {
  const {
    locations,
    currentCourts,
    fetchLocations,
    fetchCourtByLocation,
    isLoading,
  } = useCourtStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);

  // --- STATE FORM (Cập nhật đầy đủ theo yêu cầu) ---
  const [courtName, setCourtName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState(""); // Mới
  const [price, setPrice] = useState("");
  const [openTime, setOpenTime] = useState("05:00:00"); // Mới (Default)
  const [closeTime, setCloseTime] = useState("22:00:00"); // Mới (Default)

  useEffect(() => {
    fetchLocations();
  }, []);

  const onRefresh = useCallback(() => {
    fetchLocations();
  }, []);

  // --- RESET FORM ---
  const resetForm = () => {
    setCourtName("");
    setAddress("");
    setDescription("");
    setPrice("");
    setOpenTime("05:00:00");
    setCloseTime("22:00:00");
  };

  // --- LOGIC SAVE ---
  const handleSave = async () => {
    if (!courtName || !price || !address) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên, Địa chỉ và Giá tiền");
      return;
    }

    if (selectedCluster) {
      Alert.alert("Thông báo", "Chức năng thêm sân con đang phát triển");
    } else {
      try {
        // Gọi API addLocation với đầy đủ trường dữ liệu
        await addLocation({
          name: courtName,
          address: address,
          description: description || "Sân đẹp thoáng mát",
          pricePerHour: Number(price),
          openTime: openTime,
          closeTime: closeTime,
          image: "string", // Hoặc URL ảnh mặc định
          courts: [],
        });

        Alert.alert("Thành công", "Đã thêm cụm sân mới!");
        setModalVisible(false);
        resetForm();
      } catch (err) {
        // Lỗi đã được xử lý trong store
      }
    }
  };

  const handlePressCluster = (item: any) => {
    setSelectedCluster(item); // Set UI sang màn hình chi tiết
    fetchCourtByLocation(item.id); // <-- GỌI API LẤY DANH SÁCH SÂN CON NGAY
  };

  // --- RENDER CLUSTER ITEM ---
  const renderClusterItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.clusterCard}
      onPress={() => handlePressCluster(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri:
            item.image && item.image !== "string"
              ? item.image
              : "https://via.placeholder.com/150",
        }}
        style={styles.clusterImage}
      />
      <View style={styles.clusterContent}>
        <Text style={styles.clusterTitle}>{item.name}</Text>
        <Text style={styles.clusterAddress} numberOfLines={1}>
          <Ionicons name="location-outline" size={14} color="#666" />{" "}
          {item.address}
        </Text>
        <View style={styles.clusterInfoRow}>
          <View style={styles.infoTag}>
            <Text style={styles.infoTagText}>
              {item.courtCount !== undefined
                ? item.courtCount
                : item.courts?.length || 0}{" "}
              Sân
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: "#666" }}>
            {item.openTime?.substring(0, 5)} - {item.closeTime?.substring(0, 5)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // --- RENDER COURT ITEM ---
  const renderCourtItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.courtIconContainer}>
        <MaterialCommunityIcons name="badminton" size={40} color="#3B9AFF" />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "ACTIVE"
                ? { backgroundColor: "#2ecc71" }
                : { backgroundColor: "#e74c3c" },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={{ color: "#888", fontSize: 12, fontStyle: "italic" }}>
          Chưa có dữ liệu lịch đặt
        </Text>
      </View>
    </View>
  );

  const handleBack = () => {
    setSelectedCluster(null);
  };

  // --- LOADING ---
  if (isLoading && !locations.length) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder={
              selectedCluster
                ? `Tìm trong ${selectedCluster.name}...`
                : "Tìm tên cụm sân..."
            }
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            if (selectedCluster) {
              setCourtName("");
              setPrice("");
            } else {
              resetForm();
            }
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={28} color="#3B9AFF" />
        </TouchableOpacity>
      </View>

      {selectedCluster && (
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.subHeaderTitle}>{selectedCluster.name}</Text>
            <Text style={styles.subHeaderSubtitle}>
              {selectedCluster.courts?.length || 0} sân đang hoạt động
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={selectedCluster ? currentCourts : locations} // <-- DÙNG currentCourts KHI ĐANG Ở CHI TIẾT
        renderItem={selectedCluster ? renderCourtItem : renderClusterItem}
        keyExtractor={(item: any, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              if (selectedCluster) {
                fetchCourtByLocation(selectedCluster.id); // Refresh list sân con
              } else {
                fetchLocations(); // Refresh list cụm sân
              }
            }}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text style={{ color: "#999" }}>
              {selectedCluster
                ? "Cụm này chưa có sân nào"
                : "Chưa có cụm sân nào"}
            </Text>
          </View>
        }
      />

      {/* --- MODAL UPDATED: KEYBOARD AVOIDING --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* KeyboardAvoidingView bao bọc toàn bộ overlay */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalKeyboardContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* Header Modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedCluster ? "Thêm Sân Mới" : "Thêm Cụm Sân"}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="black" />
                  </TouchableOpacity>
                </View>

                {/* Nội dung Form cuộn được */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {/* --- CÁC TRƯỜNG INPUT --- */}

                  <Text style={styles.label}>
                    Tên cơ sở <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={courtName}
                    onChangeText={setCourtName}
                    placeholder="Ví dụ: Sân Long Thành"
                  />

                  {!selectedCluster && (
                    <>
                      <Text style={styles.label}>
                        Địa chỉ <Text style={{ color: "red" }}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Ví dụ: Long Thành, Đồng Nai"
                      />

                      <Text style={styles.label}>Mô tả</Text>
                      <TextInput
                        style={[
                          styles.input,
                          { height: 80, textAlignVertical: "top" },
                        ]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Mô tả về sân (đẹp, rộng, thoáng...)"
                        multiline={true}
                      />
                    </>
                  )}

                  <Text style={styles.label}>
                    Giá tiền mỗi giờ (VNĐ){" "}
                    <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="Ví dụ: 100"
                    keyboardType="numeric"
                  />

                  {!selectedCluster && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ width: "48%" }}>
                        <Text style={styles.label}>Giờ mở cửa</Text>
                        <TextInput
                          style={styles.input}
                          value={openTime}
                          onChangeText={setOpenTime}
                          placeholder="05:00:00"
                        />
                      </View>
                      <View style={{ width: "48%" }}>
                        <Text style={styles.label}>Giờ đóng cửa</Text>
                        <TextInput
                          style={styles.input}
                          value={closeTime}
                          onChangeText={setCloseTime}
                          placeholder="22:00:00"
                        />
                      </View>
                    </View>
                  )}

                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Lưu Thông Tin</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 15 },
  header: { alignItems: "center", marginVertical: 15 },
  welcomeText: { fontSize: 16, color: "#555" },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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

  // Sub Header
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { padding: 5, marginRight: 10 },
  subHeaderTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  subHeaderSubtitle: { fontSize: 12, color: "#666" },

  // Cluster Item
  clusterCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  clusterImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#eee",
  },
  clusterContent: { flex: 1, justifyContent: "center" },
  clusterTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  clusterAddress: { fontSize: 13, color: "#666", marginBottom: 8 },
  clusterInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoTagText: { color: "#3B9AFF", fontSize: 11, fontWeight: "700" },

  // Court Item
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
  moreBtn: { padding: 5 },

  // --- MODAL STYLES UPDATED ---
  modalKeyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", // Canh giữa theo chiều dọc
    alignItems: "center", // Canh giữa theo chiều ngang
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%", // Giới hạn chiều cao modal để không bị tràn
    // Shadow cho đẹp
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
    marginTop: 12,
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
});

export default ManagerHomeScreen;

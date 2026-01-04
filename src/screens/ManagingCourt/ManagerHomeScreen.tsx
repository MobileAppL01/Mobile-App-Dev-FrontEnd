import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
import { useAuthStore } from "../../store/useAuthStore";

// --- Mock Data ---
const MOCK_COURTS = [
  {
    id: "1",
    name: "Sân 1",
    status: "Đã thanh toán",
    time: "17:00 đến 19:00",
    slots: ["11:15", "12:00", "12:15", "12:45"],
  },
  {
    id: "2",
    name: "Sân 2",
    status: "Trống",
    time: "",
    slots: ["08:00", "09:00", "10:00"],
  },
];

const ManagerHomeScreen = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    // Thêm xác nhận trước khi đăng xuất để tăng trải nghiệm UX
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        onPress: () => logout(),
        style: "destructive", // Style màu đỏ trên iOS
      },
    ]);
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [courts, setCourts] = useState(MOCK_COURTS);

  // State cho Form thêm sân
  const [courtName, setCourtName] = useState("");
  const [price, setPrice] = useState("");
  const [newSlot, setNewSlot] = useState("19:00");

  // --- Component: Court Item (Card) ---
  const renderCourtItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri: "https://img.freepik.com/free-photo/badminton-court_1339-5095.jpg",
        }} // Placeholder
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {item.time ? (
          <View style={styles.blueTag}>
            <Text style={styles.blueTagText}>
              Lý Quang đang chơi từ {item.time}
            </Text>
          </View>
        ) : null}

        <View style={styles.slotContainer}>
          {item.slots.map((slot: string, index: number) => (
            <View
              key={index}
              style={[
                styles.slotBadge,
                index % 2 === 0 ? styles.slotGreen : styles.slotGray,
              ]}
            >
              <Text style={styles.slotText}>{slot}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.moreBtn}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#555" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Chào mừng bạn đến với{" "}
          <Text style={{ fontWeight: "bold", color: "#333" }}>BOOKINGTON</Text>
        </Text>
      </View>

      {/* Search & Add Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={{ marginRight: 8 }}
          />
          <TextInput placeholder="Nhập tên cụm..." style={styles.searchInput} />
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="filter" size={24} color="#3B9AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#3B9AFF" />
        </TouchableOpacity>
      </View>

      {/* List Sân */}
      <FlatList
        data={courts}
        renderItem={renderCourtItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* --- MODAL THÊM/SỬA SÂN --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 15,
              }}
            >
              <Text style={styles.modalTitle}>Thông tin sân</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Input: Số sân */}
              <Text style={styles.label}>Số sân</Text>
              <TextInput
                style={styles.input}
                value={courtName}
                onChangeText={setCourtName}
                placeholder="1"
              />

              {/* Input: Giá tiền */}
              <Text style={styles.label}>Giá tiền mỗi ca</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="100,000 VND"
                keyboardType="numeric"
              />

              {/* Input: Thêm ca */}
              <Text style={styles.label}>Thêm ca</Text>
              <View style={styles.addSlotRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={newSlot}
                  placeholder="19:00"
                />
                <TouchableOpacity style={{ marginLeft: 10 }}>
                  <Ionicons name="add-circle-outline" size={28} color="#aaa" />
                </TouchableOpacity>
              </View>

              {/* Mock Slots Grid */}
              <View style={styles.slotGrid}>
                {[
                  "11:15",
                  "11:30",
                  "11:45",
                  "12:00",
                  "12:15",
                  "12:30",
                  "12:45",
                  "13:00",
                ].map((t, i) => (
                  <View
                    key={i}
                    style={[
                      styles.slotBadge,
                      i % 2 !== 0 ? styles.slotGray : styles.slotGreen,
                      { marginBottom: 8 },
                    ]}
                  >
                    <Text style={styles.slotText}>{t}</Text>
                  </View>
                ))}
              </View>

              {/* Upload Image */}
              <Text style={styles.label}>Tải hình ảnh</Text>
              <View style={styles.uploadBox}>
                <Ionicons name="image-outline" size={40} color="#555" />
              </View>

              {/* Buttons */}
              <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn}>
                <Text style={styles.saveBtnText}>Xóa sân</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 15 },
  header: { alignItems: "center", marginVertical: 15 },
  welcomeText: { fontSize: 16, color: "#555" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  },
  searchInput: { flex: 1 },
  iconBtn: { marginLeft: 10 },

  // Card Styles
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
    padding: 10,
  },
  cardImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  statusBadge: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: { color: "white", fontSize: 10, fontWeight: "bold" },
  blueTag: {
    backgroundColor: "#3B9AFF",
    borderRadius: 5,
    padding: 4,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  blueTagText: { color: "white", fontSize: 10 },
  slotContainer: { flexDirection: "row", flexWrap: "wrap" },
  moreBtn: { justifyContent: "flex-end", paddingBottom: 5 },

  // Slot Styles
  slotBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 4,
    marginTop: 4,
  },
  slotGreen: { backgroundColor: "#2ecc71" },
  slotGray: { backgroundColor: "#ddd" },
  slotText: { color: "white", fontSize: 10, fontWeight: "bold" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 5, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  addSlotRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  uploadBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  deleteBtn: {
    backgroundColor: "#ff4757",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  // --- Style cho Nút Đăng xuất ---
  logoutButton: {
    flexDirection: "row", // Xếp icon và chữ nằm ngang
    backgroundColor: "#FF4757", // Màu đỏ cà chua (Tomato red) đẹp mắt
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30, // Bo tròn dạng viên thuốc
    alignItems: "center",

    // Đổ bóng (Shadow) cho nút nổi lên
    shadowColor: "#FF4757",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8, // Đổ bóng cho Android
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8, // Khoảng cách giữa Icon và Chữ
  },
});

export default ManagerHomeScreen;

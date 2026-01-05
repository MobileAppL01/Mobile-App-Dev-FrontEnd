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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler"; // Thêm cái này
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ManagerStackParamList } from "../../navigation/ManagerNavigator";
import { styles } from "./ManageLocationScreen.styles";
import { useCourtStore } from "../../store/useCourtStore";
import { Header } from "../../components/Header";

const { width } = Dimensions.get("window");

const ManagerLocationsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ManagerStackParamList>>();

  const [modalVisible, setModalVisible] = useState(false);
  const {
    locations,
    fetchLocations,
    isLoading,
    addLocation,
    deleteLocation,
    createPromotion,
  } = useCourtStore();
  // State để biết đang thêm mới hay đang sửa (nếu null là thêm mới)
  const [editingCluster, setEditingCluster] = useState<any>(null);

  // --- FORM STATE ---
  const [courtName, setCourtName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [openTime, setOpenTime] = useState("05:00:00");
  const [closeTime, setCloseTime] = useState("22:00:00");

  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [selectedClusterForPromo, setSelectedClusterForPromo] =
    useState<any>(null);

  // State form khuyến mãi
  const [promoCode, setPromoCode] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("2026-01-05");
  const [endDate, setEndDate] = useState("2026-01-10");

  useEffect(() => {
    fetchLocations();
  }, []);

  // --- RESET FORM ---
  const resetForm = () => {
    setEditingCluster(null);
    setCourtName("");
    setAddress("");
    setDescription("");
    setPrice("");
    setOpenTime("05:00:00");
    setCloseTime("22:00:00");
  };

  // --- ĐIỀN DATA VÀO FORM KHI SỬA ---
  const openEditModal = (item: any) => {
    setEditingCluster(item);
    setCourtName(item.name);
    setAddress(item.address);
    setDescription(item.description || "");
    setPrice(item.pricePerHour ? item.pricePerHour.toString() : "");
    setOpenTime(item.openTime || "05:00:00");
    setCloseTime(item.closeTime || "22:00:00");
    setModalVisible(true);
  };

  // --- LOGIC SAVE ---
  const handleSave = async () => {
    if (!courtName || !price || !address) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên, Địa chỉ và Giá tiền");
      return;
    }

    if (editingCluster) {
      // --- LOGIC CẬP NHẬT (UPDATE) ---
      // Hiện tại bạn chưa có API update trong store, đây là nơi gọi nó
      Alert.alert("Thông báo", "Chức năng cập nhật đang phát triển");
      // Sau khi update xong: setModalVisible(false); resetForm();
    } else {
      // --- LOGIC THÊM MỚI (CREATE) ---
      try {
        await addLocation({
          name: courtName,
          address: address,
          description: description || "Sân đẹp thoáng mát",
          pricePerHour: Number(price),
          openTime: openTime,
          closeTime: closeTime,
          image: "string",
          courts: [],
        });
        Alert.alert("Thành công", "Đã thêm cụm sân mới!");
        setModalVisible(false);
        resetForm();
      } catch (err) {
        // Lỗi đã xử lý ở store
      }
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
              await deleteLocation(item.id);
              // Không cần Alert thành công cũng được vì UI sẽ tự biến mất (do filter trong store)
            } catch (error) {
              // Lỗi đã xử lý trong store
            }
          },
        },
      ]
    );
  };

  const openPromoModal = (item: any) => {
    setSelectedClusterForPromo(item);
    setPromoCode("");
    setDiscountValue("");
    setPromoModalVisible(true);
  };

  // 3. Hàm Lưu Khuyến Mãi
  const handleSavePromotion = async () => {
    if (!promoCode || !discountValue) {
      Alert.alert("Lỗi", "Vui lòng nhập Mã và Giá trị giảm");
      return;
    }
    try {
      await createPromotion({
        locationId: selectedClusterForPromo.id,
        code: promoCode,
        discountType: "PERCENT",
        discountValue: Number(discountValue),
        startDate: startDate,
        endDate: endDate,
        description: "Khuyến mãi từ App Owner",
      });
      Alert.alert("Thành công", "Đã tạo khuyến mãi!");
      setPromoModalVisible(false);
    } catch (error) {
      // Store đã log lỗi
    }
  };

  const renderRightActions = (progress: any, dragX: any, item: any) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction} // Style định nghĩa bên dưới
        onPress={() => confirmDelete(item)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={30} color="white" />
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 10 }}>
            Xóa
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // --- CHUYỂN MÀN HÌNH ---
  const handlePressCluster = (item: any) => {
    navigation.navigate("ManagerCourts", { cluster: item });
  };

  // --- RENDER ITEM (Cập nhật mới) ---
  const renderClusterItem = ({ item }: { item: any }) => (
    <Swipeable
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item)
      }
      containerStyle={{ marginBottom: 15 }} // Chuyển margin bottom ra ngoài này
    >
      <TouchableOpacity
        style={[styles.clusterCard, { marginBottom: 0 }]} // Bỏ margin bottom ở card gốc
        onPress={() => handlePressCluster(item)}
        onLongPress={() => openEditModal(item)}
        activeOpacity={0.9}
      >
        {/* Ảnh bên trái (Giữ nguyên) */}
        <Image
          source={{
            uri:
              item.image && item.image !== "string"
                ? item.image
                : "https://via.placeholder.com/150",
          }}
          style={styles.clusterImage}
        />

        {/* Nội dung ở giữa (Giữ nguyên) */}
        <View style={styles.clusterContent}>
          <Text style={styles.clusterTitle}>{item.name}</Text>
          <Text style={styles.clusterAddress} numberOfLines={1}>
            <Ionicons name="location-outline" size={14} color="#666" />{" "}
            {item.address}
          </Text>
          <View style={styles.clusterInfoRow}>
            <View style={styles.infoTag}>
              <Text style={styles.infoTagText}>
                {item.courtCount ?? (item.courts?.length || 0)} Sân
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: "#666" }}>
              {item.openTime?.substring(0, 5)} -{" "}
              {item.closeTime?.substring(0, 5)}
            </Text>
          </View>
        </View>

        {/* --- THAY ĐỔI Ở ĐÂY: ICON DẤU CỘNG (Mở Modal Khuyến Mãi) --- */}
        <TouchableOpacity
          style={styles.trashIconBtn} // Bạn có thể giữ class này hoặc đổi tên style
          onPress={() => openPromoModal(item)}
        >
          {/* Đổi icon thành add-circle màu xanh */}
          <Ionicons name="add-circle" size={32} color="#3B9AFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
  );

  if (isLoading && !locations.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B9AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Search & Add Bar */}
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
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={28} color="#3B9AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={locations}
        renderItem={renderClusterItem}
        keyExtractor={(item: any, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchLocations} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: "#999" }}>Chưa có cụm sân nào</Text>
          </View>
        }
      />

      {/* --- MODAL FORM --- */}
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
                  <Text style={styles.modalTitle}>
                    {editingCluster ? "Chỉnh sửa Cụm Sân" : "Thêm Cụm Sân"}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="black" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.label}>
                    Tên cơ sở <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={courtName}
                    onChangeText={setCourtName}
                    placeholder="Ví dụ: Sân Long Thành"
                  />

                  <Text style={styles.label}>
                    Địa chỉ <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Ví dụ: Đồng Nai"
                  />

                  <Text style={styles.label}>Mô tả</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { height: 80, textAlignVertical: "top" },
                    ]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />

                  <Text style={styles.label}>
                    Giá tiền mỗi giờ <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                  />

                  {/* --- HÀNG GIỜ MỞ/ĐÓNG CỬA --- */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ width: "48%" }}>
                      <Text style={styles.label}>Mở cửa</Text>
                      <TextInput
                        style={styles.input}
                        value={openTime}
                        onChangeText={setOpenTime}
                        placeholder="05:00:00"
                      />
                    </View>
                    <View style={{ width: "48%" }}>
                      <Text style={styles.label}>Đóng cửa</Text>
                      <TextInput
                        style={styles.input}
                        value={closeTime}
                        onChangeText={setCloseTime}
                        placeholder="22:00:00"
                      />
                    </View>
                  </View>

                  {/* Nút Lưu */}
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>
                      {editingCluster ? "Cập Nhật" : "Lưu Thông Tin"}
                    </Text>
                  </TouchableOpacity>

                  {/* --- NÚT THÙNG RÁC (Chỉ hiện khi đang sửa) --- */}
                  {editingCluster && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={confirmDelete}
                    >
                      <Ionicons name="trash-outline" size={20} color="white" />
                      <Text style={styles.deleteBtnText}>Xóa Cụm Sân</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODAL TẠO KHUYẾN MÃI (MỚI) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={promoModalVisible}
        onRequestClose={() => setPromoModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalKeyboardContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Tạo Khuyến Mãi</Text>
                  <TouchableOpacity onPress={() => setPromoModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="black" />
                  </TouchableOpacity>
                </View>

                <Text style={{ marginBottom: 10, color: "#666" }}>
                  Áp dụng cho:{" "}
                  <Text style={{ fontWeight: "bold", color: "#3B9AFF" }}>
                    {selectedClusterForPromo?.name}
                  </Text>
                </Text>

                <ScrollView>
                  <Text style={styles.label}>Mã Code</Text>
                  <TextInput
                    style={styles.input}
                    value={promoCode}
                    onChangeText={setPromoCode}
                    placeholder="VD: TET2026"
                    autoCapitalize="characters"
                  />

                  <Text style={styles.label}>Giảm giá (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    placeholder="VD: 20"
                    keyboardType="numeric"
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ width: "48%" }}>
                      <Text style={styles.label}>Bắt đầu</Text>
                      <TextInput
                        style={styles.input}
                        value={startDate}
                        onChangeText={setStartDate}
                      />
                    </View>
                    <View style={{ width: "48%" }}>
                      <Text style={styles.label}>Kết thúc</Text>
                      <TextInput
                        style={styles.input}
                        value={endDate}
                        onChangeText={setEndDate}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSavePromotion}
                  >
                    <Text style={styles.saveBtnText}>Tạo Mã</Text>
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

export default ManagerLocationsScreen;

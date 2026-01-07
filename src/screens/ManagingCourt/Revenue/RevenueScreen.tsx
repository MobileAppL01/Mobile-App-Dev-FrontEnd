import React, { useState, useEffect, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRoute, RouteProp } from "@react-navigation/native";
import { ManagerStackParamList } from "../../../navigation/ManagerNavigator";
import { useAuthStore } from "../../../store/useAuthStore";
import { useCourtStore } from "../../../store/useCourtStore";
import * as Sentry from "@sentry/react-native"; // <--- THÊM DÒNG NÀY

// IMPORT STYLES ĐÃ TÁCH
import { styles } from "./RevenueScreen.styles";

// Interfaces
interface BookingData {
  id: number;
  courtName: string;
  locationName: string;
  playerName: string;
  playerPhone: string;
  startHours: number[];
  startTimeSlot: string | null;
  endTimeSlot: string | null;
  totalPrice: number;
  status: "PENDING" | "SUCCESS" | "CANCELLED" | "COMPLETED";
  bookingDate: string;
  paymentMethod: string;
}

type RevenueScreenRouteProp = RouteProp<ManagerStackParamList, "Revenue">;

const RevenueScreen = () => {
  const route = useRoute<RevenueScreenRouteProp>();
  const { courtItem } = route.params || {};

  const { locations, fetchLocations } = useCourtStore();
  const { token } = useAuthStore();

  const [selectedLocation, setSelectedLocation] = useState<any>(
    courtItem || null
  );
  const [modalVisible, setModalVisible] = useState(false);

  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);

  // --- STATE DATE PICKER ---
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false); // Dùng để toggle

  // --- 1. INITIAL FETCH LOCATIONS ---
  useEffect(() => {
    if (locations.length === 0) {
      fetchLocations();
    }
  }, []);

  useEffect(() => {
    if (!selectedLocation && locations.length > 0) {
      setSelectedLocation(locations[0]);
    }
  }, [locations]);

  // --- 2. FETCH REVENUE API ---
  // --- 2. FETCH REVENUE API ---
  const fetchRevenue = async (currentLoc: any, selectedDate: Date) => {
    if (!currentLoc?.id) return;
    setLoading(true);

    // Định dạng ngày và URL
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const locationId = currentLoc.id;
    const url = `https://bookington-app.mangobush-e7ff5393.canadacentral.azurecontainerapps.io/api/v1/owner/bookings?locationId=${locationId}&date=${formattedDate}`;

    try {
      console.log("Fetching Revenue:", url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.result) {
        setBookings(response.data.result);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Revenue API Error:", error);

      // --- THÊM SENTRY REPORT TẠI ĐÂY ---
      Sentry.captureException(error, {
        extra: {
          screen: "RevenueScreen",
          locationId: locationId,
          locationName: currentLoc?.name,
          dateQuery: formattedDate,
          apiUrl: url,
          userToken: token ? "Token exist" : "No token",
        },
      });
      // ----------------------------------

      setBookings([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (selectedLocation) {
      fetchRevenue(selectedLocation, date);
    }
  }, [date, selectedLocation]);

  // --- 3. LOGIC DATE PICKER (BẬT/TẮT) ---

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    // Trên Android: Sau khi chọn xong hoặc hủy, picker tự đóng -> ta set false
    // Trên iOS: Picker là dạng view, ta giữ nguyên hoặc đóng tùy logic
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
      // Nếu muốn iOS chọn xong đóng luôn thì mở comment dòng dưới:
      // if (Platform.OS === "ios") setShowDatePicker(false);
    }
  };

  // --- HELPERS ---
  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [bookings]);

  const handleSelectLocation = (loc: any) => {
    setSelectedLocation(loc);
    setModalVisible(false);
  };

  const formatTime = (hours: number[]) => {
    if (!hours || hours.length === 0) return "N/A";
    const start = hours[0];
    return `${start}:00 - ${start + 1}:00`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount * 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#f1c40f";
      case "SUCCESS":
      case "COMPLETED":
        return "#2ecc71";
      case "CANCELLED":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ thanh toán";
      case "SUCCESS":
        return "Đã thanh toán";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // --- RENDER ITEMS ---
  const renderBookingItem = ({ item }: { item: BookingData }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons
          name="person-outline"
          size={18}
          color="black"
          style={styles.icon}
        />
        <View>
          <Text style={styles.cardTextBold}>{item.playerName}</Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            {item.playerPhone}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Ionicons
          name="tennisball-outline"
          size={18}
          color="#3B9AFF"
          style={styles.icon}
        />
        <Text style={styles.cardText}>Sân: {item.courtName}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons
          name="time-outline"
          size={18}
          color="#e67e22"
          style={styles.icon}
        />
        <Text style={styles.cardText}>
          {item.bookingDate} | {formatTime(item.startHours)}
        </Text>
      </View>
      <View style={styles.row}>
        <Ionicons
          name="cash-outline"
          size={18}
          color="black"
          style={styles.icon}
        />
        <Text
          style={[styles.cardText, { color: "#e74c3c", fontWeight: "bold" }]}
        >
          {formatCurrency(item.totalPrice)}
        </Text>
        <Text style={{ fontSize: 12, color: "#999", marginLeft: 5 }}>
          ({item.paymentMethod})
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      >
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blueHeader}>
        <Text style={styles.headerText}>
          Quản lý doanh thu hiệu quả - Chính xác!
        </Text>
        <View style={{ padding: 20, backgroundColor: "#ffebee" }}>
          <Button
            title="Bắn thử lỗi lên Sentry!"
            color="red"
            onPress={() => {
              // Cách 1: Gửi một lỗi JS thuần túy
              try {
                throw new Error("Test Sentry: Lỗi này từ Revenue");
              } catch (error) {
                Sentry.captureException(error);
                alert("Đã gửi lỗi lên Sentry xong!");
              }
            }}
          />
        </View>
      </View>

      <View style={styles.body}>
        {/* Title & Location Selector */}
        <View style={styles.titleContainer}>
          <Text style={styles.welcomeText}>
            Doanh thu của <Text style={{ fontWeight: "bold" }}>BOOKINGTON</Text>
          </Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.courtTitle}>
              {selectedLocation?.name || "Chọn cơ sở"}
            </Text>
            <Ionicons
              name="caret-down-circle"
              size={20}
              color="#3B9AFF"
              style={{ marginTop: 5, marginLeft: 5 }}
            />
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={toggleDatePicker} // Bật/Tắt DatePicker
          >
            <Ionicons name="calendar" size={20} color="#3B9AFF" />
            <Text
              style={{
                marginLeft: 10,
                color: "#333",
                flex: 1,
                fontWeight: "500",
              }}
            >
              {date.toLocaleDateString("vi-VN")}
            </Text>
            {/* Đổi icon mũi tên để biểu thị trạng thái đóng/mở */}
            <Ionicons
              name={showDatePicker ? "chevron-up" : "chevron-down"}
              size={18}
              color="#555"
            />
          </TouchableOpacity>

          <TouchableOpacity style={{ marginLeft: 15 }}>
            <Ionicons name="filter" size={28} color="#3B9AFF" />
          </TouchableOpacity>
        </View>

        {/* DATE PICKER CONDITIONAL RENDERING 
            Trên iOS: Render dạng Spinner bên trong View (Dropdown)
            Trên Android: Render bình thường (Nó tự mở Popup Dialog)
        */}
        {showDatePicker && (
          <View
            style={
              Platform.OS === "ios" ? styles.iosDatePickerContainer : undefined
            }
          >
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              // iOS dùng spinner cho dễ nhìn dạng dropdown
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
              textColor="black"
            />
            {/* Nút đóng cho iOS nếu cần */}
            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={{
                  padding: 10,
                  borderTopWidth: 1,
                  borderColor: "#eee",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#3B9AFF", fontWeight: "bold" }}>
                  Đóng
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* LIST BOOKINGS */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B9AFF" />
            <Text style={styles.loadingText}>
              Đang tải dữ liệu {selectedLocation?.name}...
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 160 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Không có lượt đặt sân nào.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerTitle}>Tổng doanh thu:</Text>
          <Text style={styles.footerAmount}>
            {formatCurrency(totalRevenue)}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerDate}>{selectedLocation?.name}</Text>
          <Text style={styles.footerIncrease}>
            {bookings.length} lượt khách
          </Text>
        </View>
      </View>

      {/* MODAL LOCATION */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn cơ sở</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={locations}
              keyExtractor={(item, index) =>
                item?.id ? item.id.toString() : index.toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedLocation?.id === item.id &&
                      styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelectLocation(item)}
                >
                  <Ionicons
                    name="business"
                    size={20}
                    color={
                      selectedLocation?.id === item.id ? "#3B9AFF" : "#555"
                    }
                  />
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedLocation?.id === item.id &&
                        styles.modalItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedLocation?.id === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#3B9AFF"
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default RevenueScreen;

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  RefreshControl,
  ActivityIndicator, Button
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Giả sử bạn dùng cái này để lưu token
import * as Sentry from "@sentry/react-native"; // <--- THÊM DÒNG NÀY
// Import styles từ file riêng
import styles from "./BookingHistory.styles";
import { bookingService } from "../../services/bookingService";

export default function BookingHistoryScreen() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // State lưu dữ liệu đã phân loại
  // State lưu dữ liệu (Client-side Pagination)
  const [allUpcoming, setAllUpcoming] = useState([]);
  const [allHistory, setAllHistory] = useState([]);

  const [displayedUpcoming, setDisplayedUpcoming] = useState([]);
  const [displayedHistory, setDisplayedHistory] = useState([]);

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // --- HELPER FUNCTIONS (Xử lý dữ liệu) ---

  // 1. Format tiền tệ (VD: 200000 -> 200.000 đ)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // 2. Format ngày (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // 3. Format giờ từ mảng số (VD: [10, 11] -> 10:00 - 12:00)
  const formatTimeRange = (hoursArray) => {
    if (!hoursArray || hoursArray.length === 0) return "";
    // Sắp xếp để đảm bảo đúng thứ tự
    const sortedHours = [...hoursArray].sort((a, b) => a - b);
    const start = sortedHours[0];
    const end = sortedHours[sortedHours.length - 1] + 1; // Giả sử mỗi slot là 1 tiếng
    return `${start}:00 - ${end}:00`;
  };

  // 4. Hàm lấy màu badge dựa trên status
  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "#4CAF50"; // Xanh lá
      case "CANCELLED":
        return "#F44336"; // Đỏ
      case "PENDING":
        return "#FF9800"; // Cam
      case "CONFIRMED":
        return "#2196F3"; // Xanh dương
      default:
        return "#9E9E9E";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
      case "CANCELED":
      case "REJECTED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // --- API CALL ---
  // --- API CALL ---
  const fetchBookingHistory = async () => {
    try {
      const data = await bookingService.getAllPlayerHistory(); // Fetch ALL data

      if (data && Array.isArray(data)) {
        const upcoming = [];
        const history = [];

        // Lấy ngày hiện tại và đưa về 00:00:00 để so sánh chính xác
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        data.forEach((item) => {
          // 1. Format dữ liệu hiển thị
          const formattedItem = {
            ...item,
            displayTime: formatTimeRange(item.startHours),
            displayDate: formatDate(item.bookingDate),
            displayPrice: formatCurrency(item.totalPrice),
          };

          // 2. Parse ngày đặt sân (bookingDate string "YYYY-MM-DD" -> Date Object)
          const [year, month, day] = item.bookingDate.split("-").map(Number);
          const bookingDate = new Date(year, month - 1, day);

          // --- LOGIC PHÂN LOẠI ---
          const isPastDate = bookingDate < today;
          const isCompletedStatus = [
            "COMPLETED",
            "CANCELLED",
            "REJECTED",
          ].includes(item.status);

          if (isPastDate || isCompletedStatus) {
            history.push(formattedItem);
          } else {
            upcoming.push(formattedItem);
          }
        });

        // Sắp xếp
        upcoming.sort(
          (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)
        );
        history.sort(
          (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
        );

        // Store ALL data
        setAllUpcoming(upcoming);
        setAllHistory(history);

        // Initial Display (Page 1)
        setDisplayedUpcoming(upcoming.slice(0, ITEMS_PER_PAGE));
        setDisplayedHistory(history.slice(0, ITEMS_PER_PAGE));

        setUpcomingPage(1);
        setHistoryPage(1);

      } else {
        console.log("Không lấy được dữ liệu hoặc dữ liệu rỗng");
      }
    } catch (error) {
      console.error("Lỗi fetch history tại màn hình:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBookingHistory();
  }, []);

  const loadMoreUpcoming = () => {
    const nextCount = (upcomingPage + 1) * ITEMS_PER_PAGE;
    if (displayedUpcoming.length < allUpcoming.length) {
      setDisplayedUpcoming(allUpcoming.slice(0, nextCount));
      setUpcomingPage(prev => prev + 1);
    }
  };

  const loadMoreHistory = () => {
    const nextCount = (historyPage + 1) * ITEMS_PER_PAGE;
    if (displayedHistory.length < allHistory.length) {
      setDisplayedHistory(allHistory.slice(0, nextCount));
      setHistoryPage(prev => prev + 1);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookingHistory();
  }, []);

  // Xác định dữ liệu cần render
  const displayData =
    activeTab === "upcoming" ? displayedUpcoming : displayedHistory;

  const renderBookingItem = ({ item }) => (
    <View style={styles.card}>
      {/* Header Card */}
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="location-sharp" size={20} color="#3B82F6" />
        </View>

        <View style={styles.headerTextContainer}>
          {/* courtName làm tiêu đề chính, locationName làm phụ */}
          <Text style={styles.placeName} numberOfLines={1}>
            {item.courtName} - {item.locationName}
          </Text>
          <Text style={styles.addressName} numberOfLines={1}>
            {item.locationAddress}
          </Text>
        </View>

        {/* Badge trạng thái */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {/* Body Card */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconWidth}>
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={20}
              color="#333"
            />
          </View>
          <Text style={styles.infoText}>{item.displayDate}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconWidth}>
            <Ionicons name="time-outline" size={20} color="#333" />
          </View>
          <Text style={styles.infoText}>{item.displayTime}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconWidth}>
            <FontAwesome5 name="dollar-sign" size={18} color="#333" />
          </View>
          <Text style={styles.infoText}>{item.displayPrice}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Lịch sử đặt sân</Text>
        <Text style={styles.headerSubtitle}>
          Quản lý danh sách đặt sân của bạn
        </Text>
      </View>

      {/* TAB SWITCHER */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "upcoming" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("upcoming")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" && styles.activeTabText,
              ]}
            >
              Lịch hẹn ({allUpcoming.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "history" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("history")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "history" && styles.activeTabText,
              ]}
            >
              Lịch sử ({allHistory.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#42A5F5" />
        </View>
      ) : (
        <FlatList
          data={displayData}
          renderItem={renderBookingItem}
          keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={activeTab === "upcoming" ? loadMoreUpcoming : loadMoreHistory}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            const currentList = activeTab === "upcoming" ? displayedUpcoming : displayedHistory;
            const totalList = activeTab === "upcoming" ? allUpcoming : allHistory;
            if (currentList.length < totalList.length) {
              return <ActivityIndicator size="small" color="#42A5F5" style={{ margin: 10 }} />;
            }
            return null;
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

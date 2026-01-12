import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
} from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { bookingService } from "../../services/bookingService";

const { width } = Dimensions.get("window");

const RevenueScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      // Fetch Stats
      const stats = await bookingService.getRevenueStatistics(month, year);
      setRevenueStats(stats);

      // Fetch Bookings (For the whole month or just recent? The UI suggests a list. Let's fetch for the month)
      // Note: Backend getBookings supports filtering by date (specific day) but not range yet unless we update backend.
      // Assuming getOwnerBookings returns list. We might need to filter client side or just show all recent.
      // For now, let's fetch list without filters to see some data, or filter by 'CONFIRMED' status if desired.
      const bookingsData = await bookingService.getOwnerBookings();
      // Filter bookings for this month? Or just show what API returns.
      // Let's rely on API.
      setBookings(bookingsData);

    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu doanh thu");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã thanh toán"; // Changed to Đã thanh toán as per context of Revenue
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "REJECTED":
        return "Bị từ chối";
      default:
        return status;
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Thông tin người đặt */}
      <View style={styles.row}>
        <Ionicons
          name="person-outline"
          size={18}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.cardTextBold}>{item.courtName || "Sân cầu lông"}</Text>
      </View>

      {/* Ngày giờ */}
      <View style={styles.row}>
        <Ionicons
          name="calendar-outline"
          size={18}
          color="#e67e22"
          style={styles.icon}
        />
        <Text style={styles.cardText}>
          {item.bookingDate} | {item.startTime ? item.startTime.substring(0, 5) : '00:00'} - {item.endTime ? item.endTime.substring(0, 5) : '00:00'}
        </Text>
      </View>

      {/* Giá tiền */}
      <View style={styles.row}>
        <Ionicons
          name="card-outline"
          size={18}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.cardText}>{formatCurrency(item.totalPrice)}</Text>
      </View>

      {/* Badge Thanh toán */}
      <View style={[styles.statusBadge, item.status !== 'CONFIRMED' && { backgroundColor: '#f1c40f' }]}>
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.body}>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.datePicker}>
            <Ionicons name="search" size={20} color="black" />
            <Text style={{ marginLeft: 10, color: "#555", flex: 1 }}>
              Tháng {selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
            </Text>
            <Ionicons name="calendar-outline" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 15 }} onPress={fetchData}>
            <Ionicons name="refresh" size={28} color="#3B9AFF" />
          </TouchableOpacity>
        </View>

        {/* Danh sách Booking */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B9AFF" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
            contentContainerStyle={{ paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>Không có dữ liệu</Text>}
          />
        )}
      </View>

      {/* Footer: Tổng doanh thu */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerTitle}>Tổng doanh thu:</Text>
          <Text style={styles.footerAmount}>
            {revenueStats ? formatCurrency(revenueStats.totalRevenue) : '0 đ'}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerDate}>Tháng {selectedDate.getMonth() + 1}</Text>
          <Text style={styles.footerIncrease}>
            {bookings.length} đơn đặt
          </Text>
        </View>

        {/* Pagination (Mock) */}
        <View style={styles.pagination}>
          {/* Simple Pagination Mock */}
          <View style={[styles.pageBtn, styles.activePage]}>
            <Text style={{ fontWeight: "bold" }}>1</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  blueHeader: {
    backgroundColor: "#3B9AFF",
    paddingVertical: 10,
    alignItems: "center",
  },
  headerText: { color: "white", fontSize: 12, fontWeight: "600" },
  body: { flex: 1, paddingHorizontal: 15 },

  titleContainer: { alignItems: "center", marginTop: 10, marginBottom: 15 },
  welcomeText: { fontSize: 14, color: "#555" },
  courtTitle: { fontSize: 24, fontWeight: "bold", marginTop: 5 },

  filterBar: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  datePicker: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  // Card Styles
  card: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "white",
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { marginRight: 10, width: 20 },
  cardTextBold: { fontSize: 15, fontWeight: "bold" },
  cardText: { fontSize: 14, color: "#333" },
  statusBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#2ecc71",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: "white", fontSize: 10, fontWeight: "bold" },

  // Footer Styles
  footer: {
    position: "absolute",
    bottom: 0,
    width: width,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#333",
    padding: 20,
    paddingTop: 15,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  footerTitle: { fontSize: 20, fontWeight: "400" },
  footerAmount: { fontSize: 20, fontWeight: "bold" },
  footerDate: { fontSize: 14, color: "#333" },
  footerIncrease: { fontSize: 14, color: "#2ecc71", fontWeight: "bold" },

  pagination: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  pageBtn: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3,
  },
  activePage: { borderWidth: 2, borderColor: "black" },
});

export default RevenueScreen;

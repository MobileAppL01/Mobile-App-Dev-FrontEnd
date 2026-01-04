import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// --- Mock Data: Lịch sử đặt sân ---
const BOOKINGS = [
  {
    id: "1",
    name: "Ly Thanh Nhat Quang",
    date: "17 tháng 12 năm 2025",
    time: "10:00 đến 12:00",
    price: "100,000 VNĐ",
  },
  {
    id: "2",
    name: "Nguyen Van A",
    date: "17 tháng 12 năm 2025",
    time: "13:00 đến 14:00",
    price: "100,000 VNĐ",
  },
  {
    id: "3",
    name: "Tran Thi B",
    date: "17 tháng 12 năm 2025",
    time: "15:00 đến 17:00",
    price: "100,000 VNĐ",
  },
  {
    id: "4",
    name: "Le Van C",
    date: "17 tháng 12 năm 2025",
    time: "18:00 đến 20:00",
    price: "100,000 VNĐ",
  },
];

const RevenueScreen = () => {
  const [selectedDate, setSelectedDate] = useState("Chọn ngày/ tháng");

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
        <Text style={styles.cardTextBold}>{item.name}</Text>
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
          {item.date} | Từ {item.time}
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
        <Text style={styles.cardText}>{item.price}</Text>
      </View>

      {/* Badge Thanh toán */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Đã thanh toán</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Banner */}
      <View style={styles.blueHeader}>
        <Text style={styles.headerText}>
          Find and book your badminton court easily - Anytime, Anywhere!
        </Text>
      </View>

      <View style={styles.body}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.welcomeText}>
            Chào mừng bạn đến với{" "}
            <Text style={{ fontWeight: "bold" }}>BOOKINGTON</Text>
          </Text>
          <Text style={styles.courtTitle}>Sân số 1</Text>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.datePicker}>
            <Ionicons name="search" size={20} color="black" />
            <Text style={{ marginLeft: 10, color: "#555", flex: 1 }}>
              {selectedDate}
            </Text>
            <Ionicons name="calendar-outline" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 15 }}>
            <Ionicons name="filter" size={28} color="#3B9AFF" />
          </TouchableOpacity>
        </View>

        {/* Danh sách Booking */}
        <FlatList
          data={BOOKINGS}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 150 }} // Padding bottom để không bị Footer che
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Footer: Tổng doanh thu */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerTitle}>Tổng doanh thu:</Text>
          <Text style={styles.footerAmount}>1,200,000 VNĐ</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerDate}>Ngày 17/12/2025</Text>
          <Text style={styles.footerIncrease}>
            + 500,000 VNĐ/ <Text style={{ fontSize: 12 }}>16-12</Text>
          </Text>
        </View>

        {/* Pagination (Mock) */}
        <View style={styles.pagination}>
          <View style={[styles.pageBtn, { backgroundColor: "#ccc" }]}>
            <Ionicons name="chevron-back" size={16} />
          </View>
          <View style={[styles.pageBtn, styles.activePage]}>
            <Text style={{ fontWeight: "bold" }}>1</Text>
          </View>
          <View style={styles.pageBtn}>
            <Text>2</Text>
          </View>
          <View style={[styles.pageBtn, { borderWidth: 0 }]}>
            <Text>...</Text>
          </View>
          <View style={styles.pageBtn}>
            <Text>9</Text>
          </View>
          <View style={styles.pageBtn}>
            <Text>10</Text>
          </View>
          <View style={styles.pageBtn}>
            <Ionicons name="chevron-forward" size={16} />
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

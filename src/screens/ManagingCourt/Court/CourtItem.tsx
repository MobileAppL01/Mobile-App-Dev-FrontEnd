import React, { useMemo } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { styles } from "./ManagerCourtScreen.styles";

interface CourtItemProps {
  item: any;
  bookings: any[]; // <--- Nhận thêm prop bookings
  onDelete: (item: any) => void;
  onToggleStatus: (item: any, value: boolean) => void;
  onPress: (item: any) => void;
}

const CourtItem: React.FC<CourtItemProps> = ({
  item,
  bookings = [], // Default empty array
  onDelete,
  onToggleStatus,
  onPress,
}) => {
  
  // 1. Logic Tính toán Slots và Trạng thái hiện tại
  const { displaySlots, currentBooking } = useMemo(() => {
    const currentHour = new Date().getHours(); // Lấy giờ hiện tại (0-23)
    
    // Tạo mảng các giờ mở cửa (Ví dụ từ 5h sáng đến 22h tối)
    // Bạn có thể lấy item.openTime để dynamic hơn
    const hours = Array.from({ length: 20 }, (_, i) => i + 6); // Tạo mảng [6, 7, ..., 15] (hiển thị 10 slot từ 6h sáng)

    const slots = hours.map((hour) => {
      // Kiểm tra xem giờ này có nằm trong booking nào không
      // API startHours là mảng [6], nghĩa là đặt 6h-7h
      const isBooked = bookings.some((b) => b.startHours.includes(hour));
      
      return {
        time: `${hour}:00`,
        status: isBooked ? "booked" : "available",
      };
    });

    // Tìm booking đang diễn ra NGAY LÚC NÀY
    const activeBooking = bookings.find((b) => b.startHours.includes(currentHour));

    return { displaySlots: slots, currentBooking: activeBooking };
  }, [bookings]); // Chỉ tính lại khi bookings thay đổi


  // 2. Render từng ô giờ
  const renderTimeSlot = (slot: any, index: number) => {
    // Màu xanh lá (#00C157) cho available, Xám (#D1D1D1) cho booked
    const backgroundColor = slot.status === "available" ? "#00C157" : "#D1D1D1";

    // Chỉ hiển thị tối đa 8 slot

    return (
      <View key={index} style={[styles.slotItem, { backgroundColor }]}>
        <Text style={styles.slotText}>{slot.time}</Text>
      </View>
    );
  };

  // 3. Render nút xóa (Swipe)
  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => onDelete(item)}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
          <Ionicons name="trash-outline" size={28} color="white" />
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 10 }}>
            Xóa
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} containerStyle={{ marginBottom: 12 }}>
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.9}
        onPress={() => onPress(item)}
      >
        <View style={styles.cardInner}>
          {/* --- CỘT TRÁI: HÌNH ẢNH --- */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: item.image || "https://img.freepik.com/free-photo/badminton-court-shuttlecock_1150-17937.jpg",
              }}
              style={styles.courtImage}
            />
            <View style={styles.imageOverlayIcons}>
              <View style={styles.iconCircle}>
                <Ionicons name="heart-outline" size={14} color="#0091ff" />
              </View>
              <View style={styles.iconCircle}>
                <Ionicons name="location-sharp" size={14} color="#0091ff" />
              </View>
            </View>
          </View>

          {/* --- CỘT PHẢI: THÔNG TIN --- */}
          <View style={styles.contentContainer}>
            
            {/* Header: Tên Sân + Toggle */}
            <View style={styles.headerRow}>
              <Text style={styles.courtName}>{item.name}</Text>
              <View style={styles.statusContainer}>
                <Text
                  style={[
                    styles.statusText,
                    { color: item.status === "ACTIVE" ? "#2ecc71" : "#f1c40f" },
                  ]}
                >
                  {item.status === "ACTIVE" ? "Hoạt động" : "Bảo trì"}
                </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={item.status === "ACTIVE" ? "#3B9AFF" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(value) => onToggleStatus(item, value)}
                  value={item.status === "ACTIVE"}
                  style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                />
              </View>
            </View>

            {/* Banner: Hiển thị người đang chơi (NẾU CÓ) */}
            {currentBooking ? (
              <View style={styles.currentBookingBanner}>
                <Text style={styles.currentBookingText} numberOfLines={1}>
                  {currentBooking.playerName} đang chơi ({currentBooking.startHours[0]}:00 - {currentBooking.startHours[0] + 1}:00)
                </Text>
              </View>
            ) : (
               // Nếu không có ai chơi, có thể hiện text placeholder hoặc ẩn đi
               <View style={[styles.currentBookingBanner, { backgroundColor: '#f0f0f0' }]}>
                 <Text style={[styles.currentBookingText, { color: '#888' }]}>
                   Hiện tại sân trống
                 </Text>
               </View>
            )}

            {/* Grid hiển thị các khung giờ (Slot) */}
            <View style={styles.slotsContainer}>
              {displaySlots.map((slot, index) => renderTimeSlot(slot, index))}
            </View>

            <TouchableOpacity style={styles.footerRow}>
              <MaterialCommunityIcons name="dots-vertical" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default CourtItem;
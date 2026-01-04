import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    ScrollView, 
    StatusBar,
    Alert
} from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- Component con InfoField (Đã cập nhật logic xử lý Date) ---
interface InfoFieldProps {
  label: string;
  value: string | number | Date | null | undefined;
  flex?: number;
}

const InfoField = ({ label, value, flex }: InfoFieldProps) => {
  const getDisplayValue = () => {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) {
      return value.toLocaleDateString("vi-VN"); 
    }
    return String(value);
  };

  return (
    <View style={[styles.inputGroup, flex ? { flex } : undefined]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>{getDisplayValue()}</Text>
      </View>
    </View>
  );
};
// -----------------------------------------------------------

export default function UserProfileScreen() {
    const { user, logout } = useAuthStore();

    const displayUser = {
        name: user?.name || "Jang Wonyoung",
        email: user?.email || "congchuabongbong@gmail.com",
        avatar: user?.avatar || "https://i.pinimg.com/736x/8f/1c/a6/8f1ca60b37fb571052ba91136b668f4e.jpg", 
        phone: user?.phone || "080123123123",
        displayPhone: "+84 898889901",
        gender: user?.gender || "Nữ",
        dob: user?.dob || "31/08/2004",
        bookings: 100, 
        points: 1250   
    };

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            { text: "Đăng xuất", onPress: logout, style: "destructive" }
        ]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#42A5F5" />

            {/* --- THAY ĐỔI LỚN: Đưa tất cả vào trong ScrollView --- */}
            <ScrollView 
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                bounces={false} // Tắt hiệu ứng nảy để header dính chặt trên cùng
            >
                {/* --- HEADER (Giờ nằm trong ScrollView) --- */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Image source={{ uri: displayUser.avatar }} style={styles.avatar} />
                        
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
                            <Text style={styles.headerName}>{displayUser.name}</Text>
                            <Text style={styles.headerPhone}>{displayUser.displayPhone}</Text>
                            
                            <View style={styles.vipBadge}>
                                <Text style={styles.vipText}>Thành viên vip</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* --- BODY CONTENT (Bọc trong View để căn lề 2 bên) --- */}
                <View style={styles.bodyContent}>
                    
                    {/* --- STATS CARD (Sẽ đè lên Header nhờ marginTop âm) --- */}
                    <View style={styles.statsCard}>
                        {/* Cột 1: Lượt đặt */}
                        <View style={styles.statItem}>
                            <View style={[styles.iconCircle, { backgroundColor: "#E3F2FD" }]}>
                                <Ionicons name="trophy" size={24} color="#2196F3" />
                            </View>
                            <View>
                                <Text style={styles.statLabel}>Tổng số lần đặt</Text>
                                <Text style={styles.statValue}>{displayUser.bookings}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Cột 2: Điểm */}
                        <View style={styles.statItem}>
                            <View style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}>
                                <MaterialCommunityIcons name="medal-outline" size={24} color="#FF9800" />
                            </View>
                            <View>
                                <Text style={styles.statLabel}>Điểm tích lũy</Text>
                                <Text style={styles.statValue}>{displayUser.points}</Text>
                            </View>
                        </View>
                    </View>

                    {/* --- FORM INFO --- */}
                    <View style={styles.formCard}>
                        <InfoField label="Họ và tên" value={displayUser.name} />
                        <InfoField label="Email" value={displayUser.email} />
                        <InfoField label="Số điện thoại" value={displayUser.phone} />
                        
                        <View style={styles.row}>
                            <InfoField label="Giới tính" value={displayUser.gender} flex={0.45} />
                            <View style={{ width: 15 }} />
                            <InfoField label="Ngày sinh" value={displayUser.dob} flex={0.55} />
                        </View>
                    </View>

                    {/* --- ACTIONS --- */}
                    <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
                        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>

                </View> 
                {/* Kết thúc bodyContent */}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    // HEADER Styles
    header: {
        backgroundColor: "#42A5F5",
        height: 200, // Tăng chiều cao một chút để chứa đủ nội dung
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingTop: 60, // Padding cho Status Bar
        paddingHorizontal: 20,
        // Quan trọng: Để ZIndex thấp hơn card (mặc định trong DOM order là vậy nhưng set cho chắc)
        zIndex: 1, 
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "white",
        marginRight: 15,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 5,
    },
    headerName: {
        color: "rgba(255,255,255,0.95)",
        fontSize: 14,
        fontWeight: '600'
    },
    headerPhone: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
        marginBottom: 6,
    },
    vipBadge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        alignSelf: "flex-start",
    },
    vipText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },

    // BODY Styles
    // Container bao bọc phần dưới để tạo padding 2 bên
    bodyContent: {
        paddingHorizontal: 20,
    },
    
    // STATS CARD Styles
    statsCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        marginTop: -40, // --- KEY: Kỹ thuật Margin âm hoạt động tốt khi nằm cùng ScrollView ---
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5, // Android shadow
        marginBottom: 20,
        zIndex: 10, // Đảm bảo nổi lên trên header
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
    },
    statValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    divider: {
        width: 1,
        height: "70%",
        backgroundColor: "#EEE",
        marginHorizontal: 10,
    },

    // FORM Styles
    formCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    inputGroup: {
        marginBottom: 15,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    label: {
        fontSize: 14,
        color: "#333",
        fontWeight: "600",
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: "#E0E0E0", 
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    inputText: {
        color: "#333",
        fontSize: 15,
        fontWeight: "500",
    },

    // BUTTONS Styles
    saveButton: {
        backgroundColor: "#64B5F6",
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
        marginBottom: 15,
        shadowColor: "#64B5F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    logoutButton: {
        backgroundColor: "white",
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 30,
    },
    logoutText: {
        color: "#333", 
        fontSize: 16,
        fontWeight: "bold",
    },
});
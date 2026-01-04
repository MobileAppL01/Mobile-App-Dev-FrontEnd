import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    FlatList, 
    StatusBar,
    SafeAreaView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function BookingHistoryScreen() {
    // State để quản lý tab đang chọn: 'upcoming' (Lịch hẹn) hoặc 'history' (Đã đặt)
    const [activeTab, setActiveTab] = useState('upcoming');

    // Dữ liệu mẫu cho Lịch hẹn (Sắp tới)
    const upcomingBookings = [
        {
            id: '1',
            placeName: 'Sân cầu lông Hoàng Hoa',
            address: 'Thám quận Tân Bình',
            date: '4/11/2025',
            time: '14:00 - 16:00',
            price: '200.000 đ',
            status: 'upcoming'
        },
        {
            id: '2',
            placeName: 'Sân cầu lông Khánh Hội',
            address: 'Quận 4',
            date: '5/11/2025',
            time: '18:00 - 20:00',
            price: '250.000 đ',
            status: 'upcoming'
        }
    ];

    // Dữ liệu mẫu cho Đã đặt (Lịch sử)
    const historyBookings = [
        {
            id: '3',
            placeName: 'Sân cầu lông Hoàng Hoa',
            address: 'Thám quận Tân Bình',
            date: '4/11/2025',
            time: '14:00 - 16:00',
            price: '200.000 đ',
            status: 'completed'
        },
        {
            id: '4',
            placeName: 'Sân cầu lông Viettel',
            address: 'Cách Mạng Tháng 8',
            date: '1/11/2025',
            time: '09:00 - 11:00',
            price: '180.000 đ',
            status: 'completed'
        },
        {
            id: '5',
            placeName: 'Sân cầu lông 19/5',
            address: 'Bình Thạnh',
            date: '20/10/2025',
            time: '17:00 - 19:00',
            price: '200.000 đ',
            status: 'completed'
        },
        {
            id: '6',
            placeName: 'Sân cầu lông ABC',
            address: 'Gò Vấp',
            date: '15/10/2025',
            time: '06:00 - 08:00',
            price: '150.000 đ',
            status: 'completed'
        }
    ];

    // Xác định dữ liệu cần render dựa trên tab
    const displayData = activeTab === 'upcoming' ? upcomingBookings : historyBookings;

    // Component render từng Item trong danh sách
    const renderBookingItem = ({ item }) => (
        <View style={styles.card}>
            {/* Header của Card: Icon + Tên sân + Badge (nếu có) */}
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="location-sharp" size={24} color="#000" />
                </View>
                
                <View style={styles.headerTextContainer}>
                    <Text style={styles.placeName} numberOfLines={1}>
                        {item.placeName}
                    </Text>
                    <Text style={styles.addressName} numberOfLines={1}>
                        {item.address}
                    </Text>
                </View>

                {/* Badge trạng thái chỉ hiện bên tab Lịch sử */}
                {item.status === 'completed' && (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Hoàn thành</Text>
                    </View>
                )}
            </View>

            {/* Thông tin chi tiết: Ngày, Giờ, Giá */}
            <View style={styles.cardBody}>
                {/* Ngày */}
                <View style={styles.infoRow}>
                    <View style={styles.infoIconWidth}>
                        <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#333" />
                    </View>
                    <Text style={styles.infoText}>{item.date}</Text>
                </View>

                {/* Giờ */}
                <View style={styles.infoRow}>
                    <View style={styles.infoIconWidth}>
                        <Ionicons name="time-outline" size={20} color="#333" />
                    </View>
                    <Text style={styles.infoText}>{item.time}</Text>
                </View>

                {/* Giá tiền */}
                <View style={styles.infoRow}>
                    <View style={styles.infoIconWidth}>
                        <FontAwesome5 name="dollar-sign" size={18} color="#333" />
                    </View>
                    <Text style={styles.infoText}>{item.price}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#42A5F5" />
            
            {/* --- HEADER --- */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Lịch sử đặt sân</Text>
                <Text style={styles.headerSubtitle}>Xem và quản lí lịch đặt sân của bạn</Text>
            </View>

            {/* --- TAB SWITCHER --- */}
            <View style={styles.tabContainer}>
                <View style={styles.tabWrapper}>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'upcoming' && styles.activeTab]}
                        onPress={() => setActiveTab('upcoming')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                            Lịch hẹn ({upcomingBookings.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'history' && styles.activeTab]}
                        onPress={() => setActiveTab('history')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                            Đã đặt ({historyBookings.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- BOOKING LIST --- */}
            <FlatList
                data={displayData}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                // Hiển thị khi danh sách trống
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    // --- Styles cho Header ---
    headerContainer: {
        backgroundColor: '#42A5F5',
        paddingTop: 50, // Padding cho tai thỏ
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },

    // --- Styles cho Tab Switcher ---
    tabContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    tabWrapper: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#333', // Viền đen mỏng giống design
        width: '90%',
        padding: 2,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    activeTab: {
        backgroundColor: '#64B5F6', // Màu xanh khi active
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },

    // --- Styles cho Card ---
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        // Shadow effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EEEEEE'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#2196F3', // Nền xanh đậm cho icon location
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 5,
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    addressName: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        backgroundColor: '#64B5F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // --- Styles cho phần Body của Card (Ngày, Giờ, Giá) ---
    cardBody: {
        paddingLeft: 5, // Căn chỉnh một chút
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIconWidth: {
        width: 30, // Cố định chiều rộng icon để text thẳng hàng
        alignItems: 'flex-start',
    },
    infoText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    
    // --- Empty State ---
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});
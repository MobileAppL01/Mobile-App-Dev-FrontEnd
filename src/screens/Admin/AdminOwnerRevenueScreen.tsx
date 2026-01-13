import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminService } from '../../services/adminService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RevenueStats {
    totalRevenue: number;
    totalBookings: number;
    canceledBookings: number;
    completedBookings: number;
    pendingBookings: number;
}

interface LocationRevenueStats {
    locationId: number;
    locationName: string;
    locationAddress: string;
    totalRevenue: number;
}

const AdminOwnerRevenueScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { ownerId, ownerName } = route.params;

    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const [locationStats, setLocationStats] = useState<LocationRevenueStats[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);

    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        fetchStats();
    }, [date]);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const [res, locRes] = await Promise.all([
                adminService.getOwnerRevenue(ownerId, month, year),
                adminService.getOwnerLocationRevenue(ownerId, month, year),
                // adminService.getOwnerBookings(ownerId, month, year) // Endpoint not available in backend
            ]);

            if (res && res.result) {
                setStats(res.result);
            }
            if (locRes && locRes.result) {
                setLocationStats(locRes.result);
            }
            // setBookings([]); // Default to empty as backend doesn't support fetching bookings for admin yet

        } catch (error) {
            console.log('Error fetching stats:', error);
            Alert.alert('Lỗi', 'Không thể tải thống kê');
        } finally {
            setIsLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const StatCard = ({ title, value, color, icon }: any) => (
        <View style={[styles.card, { borderLeftColor: color }]}>
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={[styles.cardValue, { color }]}>{value}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Doanh thu & Thống kê</Text>
                    <Text style={styles.headerSubtitle}>Owner: {ownerName}</Text>
                </View>
            </View>

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Ngày {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}</Text>
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.filterButton}>
                    <Text style={styles.filterButtonText}>Chọn ngày</Text>
                    <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                />
            )}

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B9AFF" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.totalRevenueCard}>
                        <Text style={styles.totalRevenueLabel}>Tổng Doanh Thu</Text>
                        <Text style={styles.totalRevenueValue}>
                            {stats?.totalRevenue?.toLocaleString('vi-VN')} VND
                        </Text>
                    </View>

                    <View style={styles.grid}>
                        <StatCard
                            title="Tổng đơn"
                            value={stats?.totalBookings}
                            color="#3B9AFF"
                            icon="list"
                        />
                        <StatCard
                            title="Đã xác nhận"
                            value={(stats?.totalBookings || 0) - ((stats?.pendingBookings || 0) + (stats?.completedBookings || 0) + (stats?.canceledBookings || 0))}
                            color="#2ecc71"
                            icon="checkmark-done-circle" // Updated icon
                        />

                        <StatCard
                            title="Chờ xác nhận"
                            value={stats?.pendingBookings}
                            color="#FF9800"
                            icon="time"
                        />
                        <StatCard
                            title="Đã hủy"
                            value={stats?.canceledBookings}
                            color="#F44336"
                            icon="close-circle"
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Chi tiết doanh thu theo cơ sở</Text>
                    {locationStats.length === 0 ? (
                        <Text style={styles.emptyText}>Chưa có dữ liệu doanh thu cơ sở trong tháng này.</Text>
                    ) : (
                        locationStats.map((item) => (
                            <View key={item.locationId} style={styles.courtItem}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={styles.courtName}>{item.locationName}</Text>
                                    <Text style={styles.locationName}>{item.locationAddress}</Text>
                                </View>
                                <Text style={styles.courtRevenue}>{item.totalRevenue.toLocaleString('vi-VN')} đ</Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 10,
        marginHorizontal: 16,
        borderRadius: 12,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    filterButton: {
        backgroundColor: '#3B9AFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    totalRevenueCard: {
        backgroundColor: '#3B9AFF',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#3B9AFF',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 5,
    },
    totalRevenueLabel: {
        color: '#fff',
        fontSize: 16,
        opacity: 0.9,
        marginBottom: 8,
    },
    totalRevenueValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardContent: {

    },
    cardTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 12,
    },
    courtItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
    },
    courtName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    locationName: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    courtRevenue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 10,
        fontStyle: 'italic',
    },
    bookingItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    bookingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    bookingId: {
        fontWeight: 'bold',
        color: '#333'
    },
    bookingStatus: {
        fontWeight: 'bold',
        fontSize: 12
    },
    bookingText: {
        color: '#666',
        fontSize: 13,
        marginBottom: 2
    },
    bookingMethod: {
        fontSize: 12,
        color: '#3B9AFF',
        fontWeight: '600',
        marginTop: 4
    },
    bookingPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 4
    }
});

export default AdminOwnerRevenueScreen;

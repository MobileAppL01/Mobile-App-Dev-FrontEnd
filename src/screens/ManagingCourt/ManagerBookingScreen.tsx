import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { bookingService } from '../../services/bookingService';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BookingItem {
    id: number;
    courtName: string;
    locationName: string;
    playerName: string;
    playerPhone: string;
    bookingDate: string;
    startTimeSlot: number;
    endTimeSlot: number;
    startHours?: number[];
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED';
    paymentMethod: string;
}

const ManagerBookingScreen = () => {
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuthStore();

    // Date Filter State
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const showNotification = useNotificationStore(state => state.showNotification);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedDate) {
                // Returns YYYY-MM-DD
                params.date = selectedDate.toISOString().split('T')[0];
            }

            const data = await bookingService.getOwnerBookings(params);

            // Sort: Pending first, then date descending
            const sorted = data.sort((a: BookingItem, b: BookingItem) => {
                if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
                if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
                return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
            });
            setBookings(sorted);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            showNotification("Không thể tải danh sách đặt sân", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [selectedDate]); // Refetch when date changes

    const onDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleUpdateStatus = async (id: number, status: 'CONFIRMED' | 'REJECTED') => {
        try {
            await bookingService.updateBookingStatus(id, status);
            showNotification(`Đã ${status === 'CONFIRMED' ? 'duyệt' : 'từ chối'} lịch đặt.`, "success");
            fetchBookings();
        } catch (error: any) {
            console.error("Error updating booking:", error);
            showNotification(error.response?.data?.message || "Không thể cập nhật trạng thái", "error");
        }
    };

    const renderItem = ({ item }: { item: BookingItem }) => {
        const isPending = item.status === 'PENDING';

        const formatTime = (slot: number) => {
            return `${slot}:00`;
        };

        const getTimeDisplay = () => {
            if (item.startHours && item.startHours.length > 0) {
                return item.startHours.map(h => `${h}:00`).join(', ');
            }
            return `${formatTime(item.startTimeSlot)} - ${formatTime(item.endTimeSlot)}`;
        };

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'PENDING': return '#F59E0B'; // Orange
                case 'CONFIRMED': return '#10B981'; // Green
                case 'COMPLETED': return '#3B82F6'; // Blue
                case 'CANCELLED': return '#EF4444'; // Red
                case 'REJECTED': return '#6B7280'; // Gray
                default: return '#6B7280';
            }
        };

        const getStatusText = (status: string) => {
            switch (status) {
                case 'PENDING': return 'Chờ duyệt';
                case 'CONFIRMED': return 'Đã duyệt';
                case 'COMPLETED': return 'Hoàn thành';
                case 'CANCELLED': return 'Đã hủy';
                case 'REJECTED': return 'Từ chối';
                default: return status;
            }
        };

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.courtName}>{item.courtName}</Text>
                        <Text style={styles.locationName}>{item.locationName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={16} color="#666" style={styles.icon} />
                        <Text style={styles.infoText}>{item.playerName}</Text>
                        {/* Phone might be hidden for privacy or shown if needed */}
                        <Text style={[styles.infoText, { marginLeft: 10, color: '#999' }]}>{item.playerPhone}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="calendar-outline" size={16} color="#666" style={styles.icon} />
                        <Text style={styles.infoText}>{item.bookingDate}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="time-outline" size={16} color="#666" style={styles.icon} />
                        <Text style={styles.infoText}>{getTimeDisplay()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="cash-outline" size={16} color="#666" style={styles.icon} />
                        <Text style={styles.priceText}>{item.totalPrice.toLocaleString('vi-VN')} đ</Text>
                        <Text style={[styles.infoText, { marginLeft: 10, fontSize: 12 }]}>({item.paymentMethod})</Text>
                    </View>
                </View>

                {isPending && (
                    <View style={styles.actionFooter}>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnReject]}
                            onPress={() => handleUpdateStatus(item.id, 'REJECTED')}
                        >
                            <Text style={[styles.btnText, { color: '#EF4444' }]}>Từ chối</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnConfirm]}
                            onPress={() => handleUpdateStatus(item.id, 'CONFIRMED')}
                        >
                            <Text style={[styles.btnText, { color: 'white' }]}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header />
            <View style={styles.headerTitleContainer}>
                <Text style={styles.screenTitle}>Quản lý lịch đặt</Text>
            </View>

            {/* Date Filter Section */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => {
                        if (Platform.OS === 'android') {
                            setShowDatePicker(true);
                        } else {
                            setShowDatePicker(!showDatePicker);
                        }
                    }}
                >
                    <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    <Text style={styles.filterText}>
                        {selectedDate
                            ? `Ngày: ${selectedDate.toLocaleDateString('vi-VN')}`
                            : "Tất cả lịch sử"
                        }
                    </Text>
                </TouchableOpacity>

                {selectedDate && (
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setSelectedDate(null)}
                    >
                        <Ionicons name="close-circle" size={20} color="#666" />
                        <Text style={[styles.filterText, { color: '#666', marginLeft: 4 }]}>Xóa lọc</Text>
                    </TouchableOpacity>
                )}
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))} // Allow future bookings? Yes.
                />
            )}

            <FlatList
                data={bookings}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchBookings} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Chưa có lịch đặt nào</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerTitleContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    // Filter Styles
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        gap: 12
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        gap: 6
    },
    filterText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500'
    },
    clearButton: {
        padding: 8,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    courtName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    locationName: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    cardBody: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 20,
        marginRight: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    actionFooter: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    btn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnReject: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    btnConfirm: {
        backgroundColor: COLORS.primary,
    },
    btnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
    }
});

export default ManagerBookingScreen;

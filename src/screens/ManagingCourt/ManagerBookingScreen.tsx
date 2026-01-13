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
    status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED' | 'REJECTED';
    paymentMethod: string;
}

const ManagerBookingScreen = () => {
    // const [bookings, setBookings] = useState<BookingItem[]>([]); // Removed, using displayedBookings
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuthStore();

    // Date Filter State
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const showNotification = useNotificationStore(state => state.showNotification);

    const [allBookings, setAllBookings] = useState<BookingItem[]>([]);
    const [displayedBookings, setDisplayedBookings] = useState<BookingItem[]>([]);
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    const fetchBookings = async (isRefresh = false) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedDate) {
                // Returns YYYY-MM-DD
                params.date = selectedDate.toISOString().split('T')[0];
            }

            const data = await bookingService.getOwnerBookings(params);

            // Backend returns array of all bookings
            const newBookings: BookingItem[] = data || [];

            // Store ALL
            setAllBookings(newBookings);

            // Initial Display
            setDisplayedBookings(newBookings.slice(0, LIMIT));
            setPage(1);

        } catch (error) {
            console.error("Error fetching bookings:", error);
            showNotification("Không thể tải danh sách đặt sân", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(true);
    }, [selectedDate]);

    const handleLoadMore = () => {
        const nextCount = (page + 1) * LIMIT;
        if (displayedBookings.length < allBookings.length) {
            setDisplayedBookings(allBookings.slice(0, nextCount));
            setPage(prev => prev + 1);
        }
    };

    const onDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
            // fetchBookings will be triggered by useEffect
        }
    };

    const handleUpdateStatus = async (id: number, status: 'CONFIRMED' | 'CANCELED') => {
        try {
            await bookingService.updateBookingStatus(id, status);
            showNotification(`Đã ${status === 'CONFIRMED' ? 'duyệt' : 'từ chối'} lịch đặt.`, "success");
            // Refresh purely to update status - or just update local state
            // Updating local state is better UX
            const updateStatus = (list: BookingItem[]) => list.map(b => b.id === id ? { ...b, status: status } : b);

            setAllBookings(prev => updateStatus(prev));
            setDisplayedBookings(prev => updateStatus(prev));
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

        const getStatusText = (status: string, paymentMethod: string) => {
            switch (status) {
                case 'PENDING': return 'Chờ xác nhận';
                case 'CONFIRMED':
                    if (paymentMethod === 'VNPAY' || paymentMethod === 'PAY_OS') {
                        return 'Đã thanh toán'; // Paid
                    }
                    return 'Chờ thanh toán'; // Pending Payment
                case 'COMPLETED': return 'Hoàn thành';
                case 'CANCELED':
                case 'CANCELLED':
                case 'REJECTED': return 'Đã hủy';
                case 'EXPIRED': return 'Hết hạn';
                default: return status;
            }
        };

        const getStatusColor = (status: string, paymentMethod: string) => {
            switch (status) {
                case 'PENDING': return '#F59E0B'; // Orange
                case 'CONFIRMED':
                    if (paymentMethod === 'VNPAY' || paymentMethod === 'PAY_OS') {
                        return '#10B981'; // Green
                    }
                    return '#F59E0B'; // Yellow/Orange for Pending Payment
                case 'COMPLETED': return '#3B82F6'; // Blue
                case 'CANCELED':
                case 'CANCELLED':
                case 'REJECTED': return '#EF4444'; // Red
                case 'EXPIRED': return '#6B7280'; // Gray
                default: return '#6B7280';
            }
        };

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.courtName}>{item.courtName}</Text>
                        <Text style={styles.locationName}>{item.locationName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, item.paymentMethod) }]}>
                        <Text style={styles.statusText}>{getStatusText(item.status, item.paymentMethod)}</Text>
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
                            onPress={() => handleUpdateStatus(item.id, 'CANCELED')}
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
                        onPress={() => {
                            setSelectedDate(null);
                        }}
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
                data={displayedBookings}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={() => fetchBookings(true)} colors={[COLORS.primary]} />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    displayedBookings.length < allBookings.length ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
                    ) : null
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

import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Alert,
    FlatList,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { courtService } from '../../services/courtService';
import { bookingService } from '../../services/bookingService';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const SPACING = 12;
const SLOT_WIDTH = (width - 32 - (COLUMN_COUNT - 1) * SPACING) / COLUMN_COUNT;

// Configure hours: 05:00 to 22:00
const START_HOUR = 5;
const END_HOUR = 22;
const TIME_SLOTS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export default function BookingTimeSelectionScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { location } = (route.params as any) || {};

    const [courts, setCourts] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availabilityMap, setAvailabilityMap] = useState<Record<number, number[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

    // Exactly 7 days for the fixed view
    const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    }), []);

    // Reload data when screen focuses (to update availability if a booking happened)
    useFocusEffect(
        React.useCallback(() => {
            if (location?.id) {
                loadData();
            }
        }, [location?.id, selectedDate])
    );

    // Initial load (kept for redundancy or first mount)
    useEffect(() => {
        // Handled by useFocusEffect
    }, []);

    // When courts load, auto-select first court if none selected
    useEffect(() => {
        if (courts.length > 0 && selectedCourtId === null) {
            setSelectedCourtId(courts[0].id);
        }
    }, [courts]);

    const formatDateISO = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateDisplay = (date: Date) => {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        return `${d < 10 ? '0' + d : d}/${m < 10 ? '0' + m : m}/${y}`;
    };

    const loadData = async () => {
        setIsLoading(true);
        // Reset ONLY availability map, keep selected slots if possible? 
        // No, switching date resets slots usually.
        setSelectedSlots([]);
        setAvailabilityMap({});

        try {
            const courtsData = await courtService.getCourtsByLocationId(location.id);
            setCourts(courtsData);

            // Pre-select first court if needed
            if (!selectedCourtId && courtsData.length > 0) {
                setSelectedCourtId(courtsData[0].id);
            }

            const dateStr = formatDateISO(selectedDate);
            const map: Record<number, number[]> = {};

            await Promise.all(courtsData.map(async (court: any) => {
                try {
                    const availData = await bookingService.getCourtAvailability(court.id, dateStr);
                    map[court.id] = availData ? (availData.availableSlots || []) : [];
                } catch (err) {
                    // console.warn(`Failed to fetch availability for court ${court.id}`, err);
                    map[court.id] = [];
                }
            }));
            setAvailabilityMap(map);

        } catch (error) {
            console.error("Load data error", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu sân. Vui lòng kiểm tra kết nối.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSlot = (slot: number) => {
        if (!selectedCourtId) return;

        const availableSlots = availabilityMap[selectedCourtId] || [];
        if (!availableSlots.includes(slot)) return;

        let newSlots = [...selectedSlots];
        if (newSlots.includes(slot)) {
            newSlots = newSlots.filter(s => s !== slot);
        } else {
            newSlots.push(slot);
        }
        setSelectedSlots(newSlots);
    };

    const handleNext = () => {
        if (!selectedCourtId || selectedSlots.length === 0) {
            Alert.alert("Chưa chọn giờ", "Vui lòng chọn ít nhất một khung giờ để tiếp tục.");
            return;
        }

        const sortedSlots = selectedSlots.sort((a, b) => a - b);
        const courtInfo = courts.find(c => c.id === selectedCourtId);

        const price = location?.pricePerHour || 50000;
        const total = sortedSlots.length * price;

        const bookingInfo = {
            location,
            court: courtInfo,
            dateISO: formatDateISO(selectedDate),
            displayDate: formatDateDisplay(selectedDate),
            slots: sortedSlots,
            pricePerHour: price,
            totalPrice: total
        };

        navigation.navigate("BookingConfirm", { bookingInfo });
    };

    const renderDateItem = (date: Date, index: number) => {
        const isSelected = formatDateISO(date) === formatDateISO(selectedDate);
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayName = dayNames[date.getDay()];
        const dayNum = date.getDate();

        return (
            <TouchableOpacity
                key={index}
                style={[styles.dateItem, isSelected && styles.dateItemActive]}
                onPress={() => setSelectedDate(date)}
                activeOpacity={0.8}
            >
                <Text style={[styles.dateDayText, isSelected && styles.textActive]}>{dayName}</Text>
                <Text style={[styles.dateNumText, isSelected && styles.textActive]}>{dayNum}</Text>
            </TouchableOpacity>
        );
    };

    const renderCourtTab = (court: any) => {
        const isSelected = selectedCourtId === court.id;
        return (
            <TouchableOpacity
                key={court.id}
                style={[styles.courtTab, isSelected && styles.courtTabActive]}
                onPress={() => {
                    setSelectedCourtId(court.id);
                    setSelectedSlots([]); // Clear slots when switching court
                }}
            >
                <Text style={[styles.courtTabText, isSelected && styles.courtTabTextActive]}>{court.name}</Text>
            </TouchableOpacity>
        );
    };

    const renderTimeSlot = ({ item: hour }: { item: number }) => {
        if (!selectedCourtId) return null;

        const availableSlots = availabilityMap[selectedCourtId] || [];
        const isAvailable = availableSlots.includes(hour);
        const isSelected = selectedSlots.includes(hour);

        let cellStyle = styles.slotCellAvailable;
        let textStyle = styles.slotTextAvailable;

        if (!isAvailable) {
            cellStyle = styles.slotCellBooked;
            textStyle = styles.slotTextBooked;
        }
        if (isSelected) {
            cellStyle = styles.slotCellSelected;
            textStyle = styles.slotTextSelected;
        }

        return (
            <TouchableOpacity
                style={[styles.slotCell, cellStyle]}
                onPress={() => toggleSlot(hour)}
                disabled={!isAvailable}
                activeOpacity={0.7}
            >
                <Text style={textStyle}>{hour}:00</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={26} color="#111827" />
                </TouchableOpacity>
                <View style={styles.headerTitles}>
                    <Text style={styles.headerTitle}>Đặt Sân</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{location?.name}</Text>
                </View>
                <View style={styles.placeholderIcon} />
            </View>

            {/* Content Container */}
            <View style={{ flex: 1 }}>
                {/* 1. Date Strip */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>1. Chọn Ngày</Text>
                    <View style={styles.dateStripContainer}>
                        {days.map(renderDateItem)}
                    </View>
                </View>

                {/* 2. Court Tabs */}
                <View style={[styles.sectionContainer, { paddingBottom: 0 }]}>
                    <Text style={styles.sectionTitle}>2. Chọn Sân</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.courtListContent}
                    >
                        {courts.map(renderCourtTab)}
                    </ScrollView>
                </View>

                {/* 3. Time Grid */}
                <View style={[styles.sectionContainer, { flex: 1 }]}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionTitle}>3. Chọn Giờ</Text>
                        <View style={styles.legendMini}>
                            <View style={[styles.dot, styles.dotAvailable]} /><Text style={styles.legendText}>Trống</Text>
                            <View style={[styles.dot, styles.dotBooked]} /><Text style={styles.legendText}>Đã đặt</Text>
                            <View style={[styles.dot, styles.dotSelected]} /><Text style={styles.legendText}>Chọn</Text>
                        </View>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : (
                        <FlatList
                            data={TIME_SLOTS}
                            renderItem={renderTimeSlot}
                            keyExtractor={item => item.toString()}
                            numColumns={COLUMN_COUNT}
                            columnWrapperStyle={{ gap: SPACING }}
                            contentContainerStyle={{ gap: SPACING, paddingVertical: 12 }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Tạm tính:</Text>
                    <Text style={styles.footerPrice}>
                        {(selectedSlots.length * (location?.pricePerHour || 50000)).toLocaleString('vi-VN')}đ
                    </Text>
                    <Text style={styles.footerSub}>({selectedSlots.length} giờ)</Text>
                </View>

                <TouchableOpacity
                    style={[styles.btnNext, selectedSlots.length === 0 && styles.btnDisabled]}
                    onPress={handleNext}
                    disabled={selectedSlots.length === 0}
                >
                    <Text style={styles.btnNextText}>Tiếp tục</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6'
    },
    headerTitles: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 16
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827'
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2
    },
    placeholderIcon: { width: 40 },

    // Sections
    sectionContainer: {
        padding: 16,
        backgroundColor: 'white',
        marginBottom: 8
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 12,
        textTransform: 'uppercase'
    },

    // Date Strip
    dateStripContainer: {
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'space-between'
    },
    dateItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#F3F4F6'
    },
    dateItemActive: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#3B82F6'
    },
    dateDayText: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '600'
    },
    dateNumText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#374151'
    },
    textActive: {
        color: '#3B82F6'
    },

    // Court Tabs
    courtListContent: {
        gap: 12,
        paddingBottom: 16
    },
    courtTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    courtTabActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6'
    },
    courtTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563'
    },
    courtTabTextActive: {
        color: 'white'
    },

    // Time Grid
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    legendMini: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    legendText: {
        fontSize: 10,
        color: '#6B7280'
    },
    dot: { width: 8, height: 8, borderRadius: 2 },
    dotAvailable: { backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB' },
    dotBooked: { backgroundColor: '#E5E7EB' },
    dotSelected: { backgroundColor: '#3B82F6' },

    loadingContainer: {
        padding: 40,
        alignItems: 'center'
    },
    slotCell: {
        width: SLOT_WIDTH,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
    },
    slotCellAvailable: {
        backgroundColor: 'white',
        borderColor: '#D1D5DB'
    },
    slotCellBooked: {
        backgroundColor: '#E5E7EB',
        borderColor: '#E5E7EB'
    },
    slotCellSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6'
    },
    slotTextAvailable: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151'
    },
    slotTextBooked: {
        fontSize: 14,
        color: '#9CA3AF',
        textDecorationLine: 'line-through'
    },
    slotTextSelected: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white'
    },

    // Footer
    footer: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 24 : 12
    },
    footerInfo: { justifyContent: 'center' },
    footerLabel: { fontSize: 12, color: '#6B7280' },
    footerPrice: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    footerSub: { fontSize: 12, color: '#9CA3AF' },
    btnNext: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 8,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    btnDisabled: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
        elevation: 0
    },
    btnNextText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15
    }
});

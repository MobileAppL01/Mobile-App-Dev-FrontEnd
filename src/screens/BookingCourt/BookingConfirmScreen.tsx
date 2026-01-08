import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';

import { bookingService } from '../../services/bookingService';

const { width } = Dimensions.get('window');

export default function BookingConfirmScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { bookingInfo } = (route.params as any) || {};

    // Get user from store
    const user = useAuthStore(state => state.user);
    const fetchProfile = useAuthStore(state => state.fetchProfile);

    const [name, setName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'VNPAY'>('CASH');
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch latest profile when entering screen
    React.useEffect(() => {
        fetchProfile();
    }, []);

    // Sync local state when user store updates
    React.useEffect(() => {
        if (user) {
            setName(user.fullName || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    if (!bookingInfo) return null;

    const { location, court, displayDate, dateISO, slots, totalPrice, pricePerHour } = bookingInfo;

    const formatSlots = () => {
        if (slots.length === 0) return "";
        const min = Math.min(...slots);
        const max = Math.max(...slots) + 1;
        const isContiguous = slots.length === (max - min);
        if (isContiguous) {
            return `${min}:00 - ${max}:00`;
        }
        return slots.map((s: number) => `${s}h`).join(', ');
    };

    const handleConfirm = async () => {
        if (!name || !phone) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập tên và số điện thoại để nhà sân liên hệ.");
            return;
        }

        // --- Confirmation Popup ---
        Alert.alert(
            "Xác nhận đặt sân",
            "Bạn có chắc chắn muốn đặt sân không?\nLưu ý: Bạn sẽ không thể hủy sau khi đã xác nhận.",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    onPress: processBooking
                }
            ]
        );
    };

    const [promotions, setPromotions] = useState<any[]>([]);
    const [selectedPromotion, setSelectedPromotion] = useState<any | null>(null);

    // Fetch promotions (Mock)
    React.useEffect(() => {
        // Simulate API call
        const loadPromos = async () => {
            // In real integration: const res = await promotionService.getByCourt(court.id);
            // Mock data:
            setPromotions([
                { id: 1, code: 'NEWUSER', discountType: 'PERCENT', value: 10, description: 'Giảm 10% khách mới' },
                { id: 2, code: 'VNPAY20', discountType: 'AMOUNT', value: 20000, description: 'Giảm 20k khi thanh toán VNPAY' }
            ]);
        };
        loadPromos();
    }, [court.id]);

    // Calculate Final Total
    const finalTotal = React.useMemo(() => {
        let total = totalPrice;
        if (selectedPromotion) {
            if (selectedPromotion.discountType === 'PERCENT') {
                total = total - (total * selectedPromotion.value / 100);
            } else if (selectedPromotion.discountType === 'AMOUNT') {
                total = total - selectedPromotion.value;
            }
        }
        return Math.max(0, total);
    }, [totalPrice, selectedPromotion]);


    const processBooking = async () => {
        setIsProcessing(true);
        try {
            const bookingPayload = {
                courtId: court.id,
                bookingDate: dateISO,
                startHours: slots,
                paymentMethod,
                promotionId: selectedPromotion?.id, // Add promotion ID
                finalPrice: finalTotal // Send final price if backend requires validation
            };
            // Create booking PENDING
            const bookingResult = await bookingService.createBooking(bookingPayload);

            if (bookingResult) {
                // Send Local Notification
                if (bookingResult.id) {
                    try {
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Đặt sân thành công! 🏸",
                                body: `Bạn đã đặt sân ${court.name} vào ngày ${displayDate}. Chúc bạn chơi vui vẻ!`,
                                sound: true
                            },
                            trigger: null, // Send immediately
                        });
                    } catch (err) {
                        // Ignore notification error
                    }
                }

                if (paymentMethod === 'CASH') {
                    // Method: Deposit 50% of FINAL TOTAL
                    const depositAmount = finalTotal * 0.5;
                    navigation.replace("PaymentQR", {
                        booking: bookingResult,
                        totalPrice: depositAmount,
                        bankInfo: {
                            bankId: "MB",
                            accountNo: "0335624796",
                            accountName: "NGUYEN DINH PHONG",
                            content: `COC 50% DON ${bookingResult.id}`
                        }
                    });
                } else {
                    // Method: VNPAY (Active / Full Payment)
                    const fakeUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?amount=${finalTotal}&orderInfo=Booking_${bookingResult.id}`;

                    navigation.replace("PaymentWebView", {
                        paymentUrl: "",
                        booking: bookingResult,
                        totalPrice: finalTotal
                    });
                }
            } else {
                Alert.alert("Lỗi", "Đặt sân thất bại. Vui lòng thử lại.");
            }
        } catch (e: any) {
            console.error("Booking Error Details:", e.response?.data || e.message);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo đơn. " + (e.response?.data?.message || ""));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xác nhận đặt sân</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Ticket Visual */}
                    <View style={styles.ticketContainer}>
                        {/* Upper Section (Main Info) */}
                        <View style={styles.ticketUpper}>
                            <View style={styles.clubInfoRow}>
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons name="badminton" size={24} color="#F59E0B" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.clubName}>{location.name}</Text>
                                    <Text style={styles.clubAddress} numberOfLines={1}>{location.address}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.detailRow}>
                                <View>
                                    <Text style={styles.label}>Ngày</Text>
                                    <Text style={styles.value}>{displayDate}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.label}>Giờ</Text>
                                    <Text style={styles.value}>{formatSlots()}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <View>
                                    <Text style={styles.label}>Sân</Text>
                                    <Text style={styles.value}>{court.name}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.label}>Thời lượng</Text>
                                    <Text style={styles.value}>{slots.length} tiếng</Text>
                                </View>
                            </View>
                        </View>

                        {/* Dashed Line */}
                        <View style={styles.dashedLineContainer}>
                            <View style={styles.halfCircleLeft} />
                            <View style={styles.dashedLine} />
                            <View style={styles.halfCircleRight} />
                        </View>

                        {/* Lower Section (Price) */}
                        <View style={styles.ticketLower}>
                            <View style={styles.detailRow}>
                                <Text style={styles.priceLabel}>Đơn giá</Text>
                                <Text style={styles.priceValue}>{pricePerHour?.toLocaleString('vi-VN')}đ/h</Text>
                            </View>
                            <View style={[styles.detailRow, { marginTop: 10 }]}>
                                <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
                                <Text style={styles.totalValue}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
                            </View>
                        </View>
                    </View>

                    {/* Information Form */}
                    <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Tên của bạn <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập họ và tên"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Số điện thoại <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập số điện thoại"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Ghi chú</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Ghi chú thêm cho chủ sân..."
                                multiline
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>
                    </View>

                    {/* Promotion Section */}
                    <Text style={styles.sectionTitle}>Khuyến mãi</Text>
                    <View style={styles.formCard}>
                        {promotions.length === 0 ? (
                            <Text style={{ fontStyle: 'italic', color: '#999' }}>Không có khuyến mãi cho sân này.</Text>
                        ) : (
                            promotions.map((promo) => {
                                const isSelected = selectedPromotion?.id === promo.id;
                                return (
                                    <TouchableOpacity
                                        key={promo.id}
                                        style={[
                                            styles.promoItem,
                                            isSelected && styles.promoItemActive
                                        ]}
                                        onPress={() => setSelectedPromotion(isSelected ? null : promo)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialCommunityIcons
                                                name={isSelected ? "ticket-confirmation" : "ticket-outline"}
                                                size={24}
                                                color={isSelected ? "#EF4444" : "#6B7280"}
                                            />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={[styles.promoCode, isSelected && { color: '#EF4444' }]}>
                                                    {promo.code}
                                                </Text>
                                                <Text style={styles.promoDesc}>{promo.description}</Text>
                                            </View>
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={20} color="#EF4444" />}
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>

                    {/* Payment Method */}
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <View style={styles.columnGap}>
                        <TouchableOpacity
                            style={[styles.paymentCard, paymentMethod === 'CASH' && styles.paymentCardActive]}
                            onPress={() => setPaymentMethod('CASH')}
                        >
                            <View style={styles.paymentMethodHeader}>
                                <MaterialCommunityIcons name="bank-transfer-out" size={24} color={paymentMethod === 'CASH' ? '#3B9AFF' : '#6B7280'} />
                                <Text style={[styles.paymentText, paymentMethod === 'CASH' && styles.paymentTextActive]}>Thanh toán trực tiếp (Cọc 50%)</Text>
                            </View>
                            <Text style={styles.paymentSubtext}>Chuyển khoản cọc {(totalPrice * 0.5).toLocaleString('vi-VN')}đ, thanh toán phần còn lại tại sân.</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.paymentCard, paymentMethod === 'VNPAY' && styles.paymentCardActive]}
                            onPress={() => setPaymentMethod('VNPAY')}
                        >
                            <View style={styles.paymentMethodHeader}>
                                <MaterialCommunityIcons name="credit-card-outline" size={24} color={paymentMethod === 'VNPAY' ? '#3B9AFF' : '#6B7280'} />
                                <Text style={[styles.paymentText, paymentMethod === 'VNPAY' && styles.paymentTextActive]}>Thanh toán ngân hàng (VNPAY)</Text>
                            </View>
                            <Text style={styles.paymentSubtext}>Thanh toán toàn bộ {totalPrice.toLocaleString('vi-VN')}đ qua cổng thanh toán.</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Bar */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerTotalLabel}>Thành tiền</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                        {selectedPromotion && (
                            <Text style={{ textDecorationLine: 'line-through', color: '#999', fontSize: 14, marginBottom: 2 }}>
                                {totalPrice.toLocaleString('vi-VN')}đ
                            </Text>
                        )}
                        <Text style={styles.footerTotalValue}>{finalTotal.toLocaleString('vi-VN')}đ</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.confirmButton, isProcessing && { opacity: 0.7 }]}
                    onPress={handleConfirm}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.confirmButtonText}>XÁC NHẬN</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 12,
        marginTop: 20,
        marginLeft: 4
    },
    // Ticket Styles
    ticketContainer: {
        backgroundColor: 'transparent',
    },
    ticketUpper: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    ticketLower: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        padding: 20,
    },
    dashedLineContainer: {
        height: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        zIndex: 10
    },
    halfCircleLeft: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F3F4F6', // match screen bg
        marginLeft: -10,
    },
    halfCircleRight: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F3F4F6', // match screen bg
        marginRight: -10,
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 1,
        backgroundColor: 'white'
    },
    // Inside Ticket
    clubInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    clubName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827'
    },
    clubAddress: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center'
    },
    label: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937'
    },
    priceLabel: {
        fontSize: 14,
        color: '#6B7280'
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151'
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937'
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F59E0B'
    },
    // Form
    formCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#111827'
    },
    // Payment
    columnGap: {
        flexDirection: 'column',
        gap: 12
    },
    paymentCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    paymentCardActive: {
        borderColor: '#3B9AFF',
        backgroundColor: '#EFF6FF'
    },
    paymentMethodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    paymentText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 10
    },
    paymentTextActive: {
        color: '#3B9AFF'
    },
    paymentSubtext: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 34 // Align with text above (24 icon + 10 margin)
    },
    // Footer
    footer: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    footerTotalLabel: {
        fontSize: 12,
        color: '#6B7280'
    },
    footerTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937'
    },
    confirmButton: {
        backgroundColor: '#3B9AFF',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    promoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 8,
        marginTop: 4,
        backgroundColor: '#F9FAFB'
    },
    promoItemActive: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2'
    },
    promoCode: {
        fontWeight: 'bold',
        color: '#374151',
        fontSize: 14
    },
    promoDesc: {
        fontSize: 12,
        color: '#6B7280'
    }
});

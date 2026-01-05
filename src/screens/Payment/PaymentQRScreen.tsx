import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Dimensions,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

// Dummy/Hardcoded QR image for "VNPAY/Bank Transfer"
// In a real app, you would generate this based on payment URL or use a dynamic QR service.
const QR_IMAGE_URL = "https://img.vietqr.io/image/MB-0335624796-compact2.png"; // Custom QR Link

export default function PaymentQRScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { booking, totalPrice, bankInfo } = (route.params as any) || {};

    const viewShotRef = useRef(null);
    const [isSharing, setIsSharing] = useState(false);

    // If needed parameters are missing, dummy data for safe render
    const safeBankInfo = bankInfo || {
        bankId: "MB",
        accountNo: "0000000000",
        accountName: "UNKNOWN",
        content: `Booking ${booking?.id}`
    };

    const qrUrl = `${QR_IMAGE_URL}?amount=${totalPrice}&addInfo=${safeBankInfo.content}&accountName=${encodeURIComponent(safeBankInfo.accountName)}`;

    const handleConfirmPaid = () => {
        // Technically we should check payment status from backend.
        // For simplicity, we assume user paid.
        Alert.alert(
            "Thanh toán hoàn tất",
            "Cảm ơn bạn đã đặt sân. Chúc bạn có những giờ phút vui vẻ!",
            [{
                text: "Về trang chủ",
                onPress: () => navigation.navigate("ClientTabs")
            }]
        );
    };

    const handleSaveInvoice = async () => {
        try {
            setIsSharing(true);
            const uri = await captureRef(viewShotRef, {
                format: "png",
                quality: 0.8,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert("Đã lưu", "Đã lưu ảnh hóa đơn vào thư viện.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Lỗi", "Không thể lưu hóa đơn.");
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán QR</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Invoice View to Capture */}
                <View
                    style={styles.invoiceContainer}
                    ref={viewShotRef}
                    collapsable={false}
                >
                    <Text style={styles.invoiceTitle}>HÓA ĐƠN ĐẶT SÂN</Text>
                    <Text style={styles.invoiceId}>#{booking?.id}</Text>

                    <View style={styles.qrWrapper}>
                        <Image
                            source={{ uri: qrUrl }}
                            style={styles.qrImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.instruction}>
                        Quét mã QR để thanh toán
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Ngân hàng</Text>
                        <Text style={styles.value}>MB Bank</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Chủ tài khoản</Text>
                        <Text style={styles.value}>{safeBankInfo.accountName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Số tài khoản</Text>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.valueHighlight}>{safeBankInfo.accountNo}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nội dung</Text>
                        <Text style={styles.value}>{safeBankInfo.content}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Số tiền</Text>
                        <Text style={styles.totalValue}>{totalPrice?.toLocaleString('vi-VN')}đ</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.outlineButton} onPress={handleSaveInvoice}>
                        <Ionicons name="share-outline" size={20} color="#3B82F6" />
                        <Text style={styles.outlineButtonText}>Lưu/Chia sẻ Hóa đơn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPaid}>
                        <Text style={styles.confirmButtonText}>TÔI ĐÃ CHUYỂN KHOẢN</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937'
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center'
    },
    invoiceContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 24
    },
    invoiceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        letterSpacing: 1
    },
    invoiceId: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20
    },
    qrWrapper: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        // shadow
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    instruction: {
        marginTop: 16,
        color: '#6B7280',
        textAlign: 'center'
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center'
    },
    label: {
        color: '#6B7280',
        fontSize: 14
    },
    value: {
        color: '#1F2937',
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'right',
        flex: 1,
        marginLeft: 16
    },
    valueHighlight: {
        color: '#3B82F6',
        fontWeight: 'bold',
        fontSize: 16
    },
    totalValue: {
        color: '#EF4444',
        fontWeight: 'bold',
        fontSize: 18
    },
    actions: {
        width: '100%',
        gap: 12
    },
    outlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3B82F6',
        gap: 8,
        backgroundColor: 'white'
    },
    outlineButtonText: {
        color: '#3B82F6',
        fontWeight: '600'
    },
    confirmButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});

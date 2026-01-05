import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const PaymentWebViewScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { paymentUrl, booking } = (route.params as any) || {};
    const [isLoading, setIsLoading] = useState(true);

    // QR Code generation logic (Unified from PaymentQRScreen)
    const QR_BASE = "https://img.vietqr.io/image/MB-0335624796-compact2.png";
    const amount = (route.params as any)?.totalPrice || 0;
    const content = `Thanh toan don ${booking?.id || '000'}`;
    const qrUrl = `${QR_BASE}?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=NGUYEN%20DINH%20PHONG`;

    // Mock HTML if no real URL provided (for demonstration)
    const mockPaymentHtml = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f4f4f4; }
            .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; width: 90%; max-width: 400px; }
            h1 { color: #005BAA; margin-bottom: 10px; } 
            .qr-container { margin: 20px 0; }
            .qr-img { width: 200px; height: 200px; border: 1px solid #ddd; border-radius: 8px; }
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border: none; border-radius: 5px; color: white; font-weight: bold; cursor: pointer; font-size: 16px; }
            .btn-success { background-color: #28a745; }
            .btn-fail { background-color: #dc3545; }
            .info { margin-bottom: 20px; color: #555; }
            .note { font-size: 12px; color: #888; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Cổng thanh toán VNPAY</h1>
            <div class="info">
              <p>Đơn hàng: <strong>#${booking?.id || '000'}</strong></p>
              <p>Số tiền: <strong>${amount.toLocaleString('vi-VN')} VND</strong></p>
            </div>
            
            <div class="qr-container">
                <img src="${qrUrl}" class="qr-img" alt="Payment QR" />
                <p class="note">Quét mã để thanh toán nhanh (Mô phỏng)</p>
            </div>

            <p>Vui lòng chọn kết quả thanh toán giả lập:</p>
            <button class="btn btn-success" onclick="window.location.href='http://successtest.com'">Giả lập Thành Công</button>
            <button class="btn btn-fail" onclick="window.location.href='http://failtest.com'">Giả lập Thất Bại</button>
          </div>
        </body>
      </html>
    `;

    const handleNavigationStateChange = (navState: any) => {
        const { url } = navState;

        // Logic to detect success/fail based on return URL
        // Real VNPAY returns to vnp_ReturnUrl defined in backend
        if (url.includes('successtest.com') || url.includes('vnp_ResponseCode=00')) {
            navigation.replace('PaymentQR', {
                booking,
                totalPrice: (route.params as any)?.totalPrice,
                isSuccess: true // Pass flag to QR screen to show success directly? Or custom screen?
                // Actually, if Web payment success, we usually show "Success" screen, not QR.
                // But for now let's reuse a simple Alert and navigate home.
            });
            Alert.alert("Thanh toán thành công", "Bạn đã thanh toán toàn bộ tiền sân.");
            navigation.navigate("ClientTabs");
        } else if (url.includes('failtest.com')) {
            Alert.alert("Thanh toán thất bại", "Giao dịch đã bị hủy hoặc lỗi.");
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán trực tuyến</Text>
                <View style={{ width: 40 }} />
            </View>

            <WebView
                source={paymentUrl ? { uri: paymentUrl } : { html: mockPaymentHtml }}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onNavigationStateChange={handleNavigationStateChange}
                style={{ flex: 1 }}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
    }
});

export default PaymentWebViewScreen;

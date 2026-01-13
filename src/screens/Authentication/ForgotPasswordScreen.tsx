import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { COLORS, SIZES, COMMON_STYLES, AUTH_STYLES } from "../../constants/theme";
import LogoDark from "../../assets/logos/logo_dark.svg";
import { authService } from "../../services/authService";

type ForgotPasswordProps = StackScreenProps<RootStackParamList, "ForgotPassword">;

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordProps) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const showNotification = useNotificationStore(state => state.showNotification);

    const handleSendOtp = async () => {
        if (!email) {
            showNotification("Vui lòng nhập email!", "error");
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email);
            showNotification("Mã OTP đã được gửi đến email của bạn.", "success");
            navigation.navigate("VerifyOtp", { email });
        } catch (err: any) {
            console.error(err);
            // Mock success for now if API is not real
            // showNotification("Mã OTP đã được gửi (Mock)", "success");
            // navigation.navigate("VerifyOtp", { email });

            let msg = "Gửi OTP thất bại. Vui lòng thử lại.";
            if (err.response) {
                const { data, status } = err.response;
                if (data?.message) {
                    msg = data.message;
                } else if (status === 404) {
                    msg = "Email không tồn tại trong hệ thống!";
                } else if (status === 400) {
                    msg = "Yêu cầu không hợp lệ!";
                } else if (status >= 500) {
                    msg = "Lỗi hệ thống (500). Vui lòng thử lại sau.";
                }
            } else if (err.request) {
                msg = "Không thể kết nối đến máy chủ.";
            }
            showNotification(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={COMMON_STYLES.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={COMMON_STYLES.container}
            >
                <ScrollView
                    contentContainerStyle={COMMON_STYLES.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={COMMON_STYLES.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
                        </TouchableOpacity>

                        <LogoDark width={300} height={120} />
                        <View style={{ width: 28 }} />
                    </View>

                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>
                            Điền email để <Text style={{ color: COLORS.primary }}>lấy lại mật khẩu</Text>
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={COMMON_STYLES.label}>Địa chỉ email</Text>
                            <TextInput
                                style={COMMON_STYLES.input}
                                placeholder="Bob.Smith@gmail.com"
                                placeholderTextColor={COLORS.placeholder}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={[COMMON_STYLES.button, loading && { opacity: 0.7 }]}
                            onPress={handleSendOtp}
                            disabled={loading}
                        >
                            <Text style={COMMON_STYLES.buttonText}>
                                {loading ? "Đang gửi..." : "Gửi mã OTP"}
                            </Text>
                        </TouchableOpacity>

                        <View style={COMMON_STYLES.footer}>
                            <Text style={COMMON_STYLES.footerText}>Chưa có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("SignUp", { method: "email" })}>
                                <Text style={COMMON_STYLES.linkText}>Đăng ký</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[COMMON_STYLES.footer, { marginTop: 10 }]}>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={[COMMON_STYLES.linkText, { fontSize: 16 }]}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    <View style={AUTH_STYLES.footerImageContainer}>
                        <Image
                            source={require("../../assets/images/bottom_image_2.png")}
                            style={AUTH_STYLES.footerImage}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backButton: {
        padding: 5,
    },
    contentContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: SIZES.h2,
        fontWeight: "bold",
        color: COLORS.black,
        textAlign: "center",
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
});

export default ForgotPasswordScreen;

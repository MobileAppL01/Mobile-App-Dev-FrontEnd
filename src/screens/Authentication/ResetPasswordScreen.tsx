import React, { useState, useRef, useEffect } from "react";
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

type ResetPasswordProps = StackScreenProps<RootStackParamList, "ResetPassword">;

const ResetPasswordScreen = ({ navigation, route }: ResetPasswordProps) => {
    const { email } = route.params;
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const otpInputs = useRef<Array<TextInput | null>>([]);
    const showNotification = useNotificationStore(state => state.showNotification);
    const [timer, setTimer] = useState(300); // 5 minutes

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleResetPassword = async () => {
        const otpValue = otp.join("");
        if (otpValue.length < 6) {
            showNotification("Vui lòng nhập đủ mã OTP (6 số)", "error");
            return;
        }
        if (!password || !confirmPassword) {
            showNotification("Vui lòng nhập mật khẩu mới", "error");
            return;
        }
        if (password !== confirmPassword) {
            showNotification("Mật khẩu không khớp", "error");
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({ email, otp: otpValue, newPassword: password });
            showNotification("Đổi mật khẩu thành công! Vui lòng đăng nhập.", "success");
            navigation.navigate("Login");
        } catch (err: any) {
            console.error(err);
            let msg = "Đổi mật khẩu thất bại.";
            if (err.response) {
                const { data, status } = err.response;
                if (data?.message) {
                    msg = data.message;
                } else if (status === 400) {
                    msg = "Mã OTP không chính xác hoặc đã hết hạn!";
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

    const handleResendOtp = async () => {
        try {
            await authService.forgotPassword(email);
            setTimer(300);
            showNotification("Đã gửi lại mã OTP", "success");
        } catch (err) {
            showNotification("Gửi lại thất bại", "error");
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
                        <Text style={styles.title}>Nhập mã OTP</Text>

                        <Text style={styles.subtitle}>
                            Mã xác thực được gửi đến {email}.
                        </Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { otpInputs.current[index] = ref; }}
                                    style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                                    value={digit}
                                    onChangeText={(val) => handleOtpChange(val, index)}
                                    onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        <View style={styles.timerContainer}>
                            <Text style={{ color: COLORS.placeholder }}>Gửi lại mã OTP sau </Text>
                            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{formatTime(timer)}</Text>
                        </View>

                        {timer === 0 && (
                            <TouchableOpacity onPress={handleResendOtp} style={{ alignItems: 'center', marginBottom: 20 }}>
                                <Text style={[COMMON_STYLES.linkText, { textDecorationLine: 'underline' }]}>Gửi lại ngay</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={COMMON_STYLES.label}>Mật khẩu mới</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[COMMON_STYLES.input, styles.passwordInput]}
                                    placeholder="********"
                                    placeholderTextColor={COLORS.placeholder}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye" : "eye-off"}
                                        size={24}
                                        color={COLORS.placeholder}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={COMMON_STYLES.label}>Xác nhận mật khẩu</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[COMMON_STYLES.input, styles.passwordInput]}
                                    placeholder="********"
                                    placeholderTextColor={COLORS.placeholder}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? "eye" : "eye-off"}
                                        size={24}
                                        color={COLORS.placeholder}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[COMMON_STYLES.button, loading && { opacity: 0.7 }]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            <Text style={COMMON_STYLES.buttonText}>
                                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                            </Text>
                        </TouchableOpacity>

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
        fontSize: SIZES.h1,
        fontWeight: "bold",
        color: COLORS.black,
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.placeholder,
        textAlign: "center",
        marginBottom: 30,
        paddingHorizontal: 20
    },
    inputGroup: {
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        width: "80%",
        alignSelf: "center",
    },
    otpInput: {
        width: 45,
        height: 60,
        borderWidth: 1,
        borderColor: COLORS.grayBorder,
        borderRadius: SIZES.borderRadius,
        textAlign: "center",
        fontSize: 24,
        color: COLORS.black,
        backgroundColor: COLORS.white,
    },
    otpInputFilled: {
        borderColor: COLORS.primary,
        backgroundColor: "#F0F8FF",
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.grayBorder,
        borderRadius: SIZES.borderRadius,
        backgroundColor: COLORS.white,
    },
    passwordInput: {
        flex: 1,
        borderWidth: 0,
        height: 50,
        paddingVertical: 12,
    },
    eyeIcon: {
        padding: 10,
    },
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20
    }
});

export default ResetPasswordScreen;

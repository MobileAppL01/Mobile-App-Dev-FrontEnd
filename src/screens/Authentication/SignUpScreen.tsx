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
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { COLORS, SIZES, COMMON_STYLES, AUTH_STYLES } from "../../constants/theme";
import LogoDark from "../../assets/logos/logo_dark.svg";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";

// Define Props
type SignUpProps = StackScreenProps<RootStackParamList, "SignUp">;

const SignUpScreen = ({ navigation, route }: SignUpProps) => {
  // const { method } = route.params || {};

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'PLAYER' | 'OWNER'>('PLAYER');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Lấy các state và actions từ store
  // Lấy các state và actions từ store
  const register = useAuthStore(state => state.register);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const setError = useAuthStore(state => state.setError);
  const showNotification = useNotificationStore(state => state.showNotification);

  React.useEffect(() => { setError(null); }, []);

  const handleRegister = async () => {
    // Kiểm tra thông tin đầu vào
    if (!email || !fullName || !phone || !password || !confirmPassword) {
      showNotification("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    // Kiểm tra khớp mật khẩu
    if (password !== confirmPassword) {
      showNotification("Mật khẩu nhập lại không khớp", "error");
      return;
    }

    // Tách họ và tên
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts.length > 0 ? nameParts[0] : "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Gọi API đăng ký
    try {
      await register({
        email: email,
        firstName: firstName || "User",
        lastName: lastName || "Name",
        phone: phone,
        password: password,
        role: role
      });

      showNotification("Đăng ký thành công! Vui lòng đăng nhập.", "success");
      navigation.navigate("Login");

    } catch (err: any) {
      let msg = "Đăng ký thất bại. Vui lòng thử lại.";
      if (err.response) {
        const { data, status } = err.response;
        if (data?.message) {
          msg = data.message;
        } else if (status === 400) {
          msg = "Thông tin không hợp lệ. Vui lòng kiểm tra lại!";
        } else if (status === 409) {
          msg = "Email hoặc Số điện thoại đã được đăng ký!";
        } else if (status === 403) {
          msg = "Bạn không có quyền thực hiện hành động này!";
        } else if (status >= 500) {
          msg = "Lỗi hệ thống (500). Vui lòng thử lại sau.";
        }
      } else if (err.request) {
        msg = "Không thể kết nối đến máy chủ.";
      }
      showNotification(msg, "error");
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

          <Text style={styles.title}>Đăng Ký</Text>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'PLAYER' && styles.roleButtonActive]}
              onPress={() => setRole('PLAYER')}
            >
              <Text style={[styles.roleText, role === 'PLAYER' && styles.roleTextActive]}>Người chơi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'OWNER' && styles.roleButtonActive]}
              onPress={() => setRole('OWNER')}
            >
              <Text style={[styles.roleText, role === 'OWNER' && styles.roleTextActive]}>Chủ sân</Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>}

          <View style={styles.formContainer}>

            <View style={styles.inputGroup}>
              <Text style={COMMON_STYLES.label}>Địa chỉ email</Text>
              <TextInput
                style={COMMON_STYLES.input}
                placeholder="example@gmail.com"
                placeholderTextColor={COLORS.placeholder}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(null); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={COMMON_STYLES.label}>Họ và tên</Text>
              <TextInput
                style={COMMON_STYLES.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor={COLORS.placeholder}
                value={fullName}
                onChangeText={(t) => { setFullName(t); setError(null); }}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={COMMON_STYLES.label}>Số điện thoại</Text>
              <TextInput
                style={COMMON_STYLES.input}
                placeholder="0912345678"
                placeholderTextColor={COLORS.placeholder}
                value={phone}
                onChangeText={(t) => { setPhone(t); setError(null); }}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={COMMON_STYLES.label}>Mật khẩu</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[COMMON_STYLES.input, styles.passwordInput]}
                  placeholder="abc123"
                  placeholderTextColor={COLORS.placeholder}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(null); }}
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
              <Text style={COMMON_STYLES.label}>Nhập lại mật khẩu</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[COMMON_STYLES.input, styles.passwordInput]}
                  placeholder="abc123"
                  placeholderTextColor={COLORS.placeholder}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
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
              style={[styles.button, isLoading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={COMMON_STYLES.buttonText}>
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </Text>
            </TouchableOpacity>

            <View style={COMMON_STYLES.footer}>
              <Text style={COMMON_STYLES.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={COMMON_STYLES.linkText}>Đăng nhập</Text>
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
  logo: {
    width: 300,
    height: 120,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: SIZES.borderRadius,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: SIZES.borderRadius - 4,
    flex: 1,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleText: {
    color: COLORS.placeholder,
    fontWeight: '600',
    fontSize: 16,
  },
  roleTextActive: {
    color: COLORS.white,
  },
  // New Styles for Password Eye Icon
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // We want the container to not have a border, but simply wrap the input + icon
    // Actually, traditionally, the border is ON the container for "Input with Icon" pattern.
    // But `COMMON_STYLES.input` already has border. 
    // Let's adjust: The container should simulate the input style, and the inner input should have no border.
    // OR: we just overlay the icon.
    // Overlay is easier if we don't want to restructure common styles much.
    // Let's try overlay or flex row.
    // Current code: Container has border.
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0, // Remove border because container has it
    height: 50, // Match typical input height roughly or let padding handle it
    paddingVertical: 12, // Match common style
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    ...COMMON_STYLES.button,
    marginTop: 10,
    marginBottom: 20,
  },

});

export default SignUpScreen;
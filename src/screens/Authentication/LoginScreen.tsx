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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { COLORS, SIZES, COMMON_STYLES, AUTH_STYLES } from "../../constants/theme";

import LogoDark from "../../assets/logos/logo_dark.svg";

const { width } = Dimensions.get("window");

type LoginProps = StackScreenProps<RootStackParamList, "Login">;

const LoginScreen = ({ navigation }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Lấy các state và actions từ store
  // Lấy các state và actions từ store
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const setError = useAuthStore(state => state.setError);

  React.useEffect(() => { setError(null); }, []);

  // Notification
  const showNotification = useNotificationStore(state => state.showNotification);

  const handleLogin = async () => {
    if (!email || !password) {
      // setError("Vui lòng nhập đầy đủ thông tin!"); // Inline error
      showNotification("Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }
    try {
      await login({ username: email, password });
      showNotification("Đăng nhập thành công!", "success");
    } catch (err: any) {
      let msg = "Đăng nhập thất bại. Vui lòng thử lại.";

      // Ưu tiên lấy message từ backend
      if (err.response) {
        const { data, status } = err.response;

        // Xử lý message cụ thể từ backend
        if (data?.message === "Bad credentials") {
          msg = "Sai tên đăng nhập hoặc mật khẩu!";
        } else if (data?.message) {
          msg = data.message;
        } else if (status === 400 || status === 401) {
          msg = "Thông tin đăng nhập không chính xác!";
        } else if (status >= 500) {
          msg = "Lỗi hệ thống (500). Vui lòng thử lại sau.";
        }
      } else if (err.request) {
        msg = "Không thể kết nối đến máy chủ. Kiểm tra mạng!";
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
            </TouchableOpacity>

            <LogoDark width={300} height={120} />
            <View style={{ width: 28 }} />
          </View>

          <Text style={styles.titleContainer}>
            <Text style={styles.titleNormal}>Chào mừng trở lại, </Text>
            <Text style={styles.titleHighlight}>Đăng nhập</Text>
          </Text>


          <View style={styles.formContainer}>
            {error && <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>}

            <View style={styles.inputGroup}>
              <Text style={COMMON_STYLES.label}>Địa chỉ email</Text>
              <TextInput
                style={COMMON_STYLES.input}
                placeholder="example@gmail.com"
                placeholderTextColor={COLORS.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={COMMON_STYLES.label}>Mật khẩu</Text>
              <TextInput
                style={COMMON_STYLES.input}
                placeholder="abc123"
                placeholderTextColor={COLORS.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={COMMON_STYLES.linkText}>Quên mật khẩu</Text>
            </TouchableOpacity>

            {/* Button Đăng nhập */}
            <TouchableOpacity
              style={[COMMON_STYLES.button, isLoading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={COMMON_STYLES.buttonText}>
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </Text>
            </TouchableOpacity>

            <View style={COMMON_STYLES.footer}>
              <Text style={COMMON_STYLES.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp", { method: "email" })}>
                <Text style={COMMON_STYLES.linkText}>Đăng ký</Text>
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
  // Override or add specific styles here if not in COMMON_STYLES
  header: {
    ...COMMON_STYLES.header,
    marginBottom: 30, // Custom margin for Login
  },
  backButton: {
    padding: 5,
  },
  logo: {
    width: 300, // Specific width for Login
    height: 120,
  },
  titleContainer: {
    marginBottom: 30,
    textAlign: "center", // Căn giữa tiêu đề
    alignSelf: "center",
  },
  titleNormal: {
    fontSize: SIZES.h2,
    fontWeight: "600",
    color: COLORS.black,
  },
  titleHighlight: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: COLORS.primary, // Màu xanh điểm nhấn
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end", // Đẩy text sang phải
    marginBottom: 25,
  },

});

export default LoginScreen;


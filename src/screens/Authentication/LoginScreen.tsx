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
// 1. Import Store
import { useAuthStore } from "../../store/useAuthStore";
// 2. Import Theme
import { COLORS, SIZES, COMMON_STYLES, AUTH_STYLES } from "../../constants/theme";

import LogoDark from "../../assets/logos/logo_dark.svg";

const { width } = Dimensions.get("window");

// Định nghĩa Type cho Props
type LoginProps = StackScreenProps<RootStackParamList, "Login">;

const LoginScreen = ({ navigation }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const { isAuthenticated, hasSeenOnboarding } = useAuthStore();
  const login = useAuthStore((state) => state.login);

  const handleLogin = () => {
    // Xử lý logic đăng nhập tại đây (API call, validation...)
    console.log("Login with:", email, password);
    // const isAuthenticated = true;
    // // Ví dụ: Nếu thành công thì chuyển vào trang chủ
    // navigation.navigate('Home');
    // // Hoặc cập nhật State global để RootNavigator tự chuyển đổi
    const mockUserData = {
      id: "123",
      name: "lyquang",
      email: "lythanh@gmail.com",
      role: "CLIENT",
      avatar: "https://i.pravatar.cc/300",
      phone: "0361234567",
      gender: "Male",
      dob: "01/01/2000"
    };
    console.log("mockdata", mockUserData);

    // 3. QUAN TRỌNG: Gọi hàm login của Store
    // Hành động này sẽ set isAuthenticated = true
    // RootNavigator sẽ tự động chuyển sang màn hình Home
    login(mockUserData);
    // Lưu ý: Không cần gọi navigation.navigate('Home') nếu RootNavigator
    // đã được cấu hình điều kiện (Conditional Rendering) theo biến isAuthenticated.
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
            <View style={styles.inputGroup}>
              <Text style={COMMON_STYLES.label}>Tên đăng nhập</Text>
              <TextInput
                style={COMMON_STYLES.input}
                placeholder="09xxx/example@gmail.com"
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

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={COMMON_STYLES.linkText}>Quên mật khẩu</Text>
            </TouchableOpacity>

            {/* Button Đăng nhập */}
            <TouchableOpacity style={COMMON_STYLES.button} onPress={handleLogin}>
              <Text style={COMMON_STYLES.buttonText}>Đăng nhập</Text>
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


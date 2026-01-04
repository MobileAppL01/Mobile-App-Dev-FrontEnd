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

// Define Props
type SignUpProps = StackScreenProps<RootStackParamList, "SignUp">;

const SignUpScreen = ({ navigation, route }: SignUpProps) => {
  const { method } = route.params;

  // --- State ---
  const [inputValue, setInputValue] = useState(""); // Use one state for Email OR Phone
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Logic Helpers ---
  const isEmail = method === "email";

  // Validation & Submit Handler
  const handleRegister = () => {
    // 1. Check Empty
    if (!inputValue || !fullName || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    // 2. Check Password Match
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
      return;
    }

    // 3. Success logic (API Call here)
    console.log("Registering with:", { inputValue, fullName, password });
    Alert.alert("Thành công", "Mã OTP đã được gửi!");
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

          <View style={styles.formContainer}>

            <View style={styles.inputGroup}>
              <Text style={COMMON_STYLES.label}>Địa chỉ email</Text>
              <TextInput
                style={COMMON_STYLES.input}
                placeholder="example@gmail.com"
                placeholderTextColor={COLORS.placeholder}
                value={inputValue}
                onChangeText={setInputValue}
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
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={COMMON_STYLES.label}>Mật khẩu</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[COMMON_STYLES.input, styles.passwordInput]} // Combine styles
                  placeholder="abc123"
                  placeholderTextColor={COLORS.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword} // Toggle logic
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

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={COMMON_STYLES.buttonText}>Gửi mã OTP</Text>
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
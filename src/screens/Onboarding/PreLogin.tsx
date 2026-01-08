import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { COLORS, SIZES, AUTH_STYLES } from "../../constants/theme";
import LogoDark from "../../assets/logos/logo_dark.svg";

const { width, height } = Dimensions.get("window");

type Props = StackScreenProps<RootStackParamList, "PreLogin">;

const PreLogin = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topSection}>
        <LogoDark width={300} height={120} />
      </View>

      <View style={styles.middleSection}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("SignUp", { method: "email" })}
        >
          <MaterialCommunityIcons
            name="email-outline"
            size={24}
            color={COLORS.white}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Đăng ký bằng Email</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>hoặc</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.textNormal}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.textBold}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={AUTH_STYLES.footerImageContainer}>
        <Image
          source={require("../../assets/images/bottom_image_1.png")}
          style={AUTH_STYLES.footerImage}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Blue background
    alignItems: "center",
  },
  topSection: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingTop: 50,
  },

  middleSection: {
    flex: 0.3,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 30,
    justifyContent: "flex-start",
  },
  button: {
    flexDirection: "row",
    width: "100%",
    height: 50,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    backgroundColor: "transparent",
  },
  icon: {
    position: "absolute",
    left: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: "600",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 15, // Reduced margin
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  orText: {
    color: COLORS.white,
    marginHorizontal: 10,
    fontSize: 14,
  },

  loginContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  textNormal: {
    color: COLORS.white,
    fontSize: 15,
  },
  textBold: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default PreLogin;

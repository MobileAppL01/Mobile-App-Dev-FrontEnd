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
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from "react-native-safe-area-context";

// Import your specific paths
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuthStore } from '../../store/useAuthStore';

import LogoLight from "../../assets/logos/logo_light.svg";

const { width, height } = Dimensions.get("window");

// ✅ FIX 1: Define the Props type
type Props = StackScreenProps<RootStackParamList, 'OnboardingSecond'>;

const OnboardingScreenSecond = ({ navigation }: Props) => {
  // ✅ FIX 2: Hooks must be called INSIDE the component
  const setHasSeenOnboarding = useAuthStore((state) => state.setHasSeenOnboarding);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. Phần Logo */}
      <View style={styles.headerContainer}>
        <LogoLight width={width * 0.6} height="100%" />
      </View>

      {/* 2. Phần Hình Ảnh Chính */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/Leechongwei.png")}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </View>

      {/* 3. Phần Nội Dung & Nút Bấm */}
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Thanh toán nhanh chóng</Text>

        <Text style={styles.description}>
          Trải nghiệm thanh toán tiện lợi qua MoMo, VNPay và ứng dụng ngân hàng
          an toàn, dễ dàng
        </Text>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>

        {/* Button Tiếp Tục */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          // Chuyển sang màn hình thứ 3
          onPress={() => navigation.navigate("OnboardingThird")}
        >
          <Text style={styles.buttonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3B9AFF", // Màu xanh chủ đạo
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContainer: {
    marginTop: 20,
    alignItems: "center",
    height: height * 0.15,
  },
  logo: {
    width: width * 0.6, // Adjusted width slightly for better fit
    height: '100%',
  },
  imageContainer: {
    height: height * 0.45,
    justifyContent: "center",
    alignItems: "center",
    width: width,
  },
  mainImage: {
    width: "90%",
    height: "90%",
  },
  bottomContainer: {
    height: height * 0.4,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: "#E0F0FF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  paginationContainer: {
    flexDirection: "row",
    marginBottom: 30,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 5,
  },
  activeDot: {
    width: 10,
    height: 10,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 6,
  },
  button: {
    backgroundColor: "white",
    width: "80%",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#3B9AFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OnboardingScreenSecond;
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
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoLight from "../../assets/logos/logo_light.svg";

type Props = StackScreenProps<RootStackParamList, "OnboardingFirst">;

const { width, height } = Dimensions.get("window");

const OnboardingScreenFirst = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerContainer}>
        <LogoLight width={width * 0.8} height={height * 0.15} />
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/Leechongwei.png")}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Đặt Sân Ngay</Text>

        <Text style={styles.description}>
          Đặt sân cầu lông của bạn trong vòng 2 phút - nhanh chóng, đơn giản và
          tiện lợi.
        </Text>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("OnboardingSecond")}
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
    backgroundColor: "#3B9AFF", // Màu xanh chủ đạo giống hình
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContainer: {
    marginTop: 20,
    alignItems: "center",
    height: height * 0.15, // Chiếm 15% màn hình
  },
  logo: {
    width: width * 0.8,
  },
  logoText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
    letterSpacing: 1,
  },
  imageContainer: {
    height: height * 0.45, // Chiếm 45% màn hình cho ảnh to
    justifyContent: "center",
    alignItems: "center",
    width: width,
  },
  mainImage: {
    width: "90%",
    height: "90%",
  },
  bottomContainer: {
    height: height * 0.4, // Chiếm 40% màn hình còn lại
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
  },
  description: {
    fontSize: 16,
    color: "#E0F0FF", // Màu trắng hơi nhạt cho text phụ
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
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Dot mờ
    marginHorizontal: 5,
  },
  activeDot: {
    width: 10,
    height: 10,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white", // Dot rỗng active
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
    color: "#3B9AFF", // Màu chữ cùng màu nền
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OnboardingScreenFirst;

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import LogoDark from "../assets/logos/logo_dark.svg";
export const Header = () => {
  return (
    <>
      <View style={styles.topBanner}>
        <Text style={styles.topBannerText}>
          Tìm và đặt sân cầu lông của bạn dễ dàng – Mọi lúc, Mọi nơi!
        </Text>
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.welcomeText}>Chào mừng bạn đến với</Text>
        <LogoDark width={100} height={50} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBanner: {
    backgroundColor: "#3B9AFF",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  topBannerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "#333",
    marginRight: 5,
    marginTop: 10,
    fontWeight: "400",
  },
});

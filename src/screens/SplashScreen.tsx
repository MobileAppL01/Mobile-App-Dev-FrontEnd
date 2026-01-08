import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions, StatusBar } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { COLORS } from "../constants/theme";
import { useAuthStore } from "../store/useAuthStore";

import LogoDark from "../assets/logos/logo_dark.svg";

const { width, height } = Dimensions.get("window");

type Props = StackScreenProps<RootStackParamList, "Splash">;

const SplashScreen = ({ navigation }: Props) => {
    // const hasSeenOnboarding = useAuthStore(state => state.hasSeenOnboarding); // Unused currently but good practice
    // Actually, logic is hardcoded to PreLogin for now. 
    // Just remove destructuring to avoid subscription to full state.

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("PreLogin");
        }, 3000); // 3 seconds

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Top Logo */}
            <View style={styles.logoContainer}>
                <LogoDark width="100%" height="100%" />
            </View>

            {/* Center/Bottom Images */}
            <View style={styles.imageContainer}>
                {/* Background Image: Faded and Larger */}
                <Image
                    source={require("../assets/images/Leechongwei_bg.png")}
                    style={styles.backgroundImage}
                    resizeMode="contain"
                />
                {/* Foreground Image: Smaller, Clearer, In Front */}
                <Image
                    source={require("../assets/images/Leechongwei.png")}
                    style={styles.foregroundImage}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "space-between",
    },
    logoContainer: {
        marginTop: height * 0.15,
        width: width * 0.7,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    logo: {
        width: "400%",
        height: "400%",
    },
    imageContainer: {
        flex: 1,
        width: "100%",
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    backgroundImage: {
        position: 'absolute',
        width: width * 1, // Slightly wider to fill
        height: height * 0.65,
        bottom: 0,
        opacity: 0.4, // Faded effect
    },
    foregroundImage: {
        width: width * 0.75, // Smaller than full width
        height: height * 0.5,
        marginBottom: 0,
        zIndex: 5,
    },
});

export default SplashScreen;

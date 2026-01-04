
import { StyleSheet } from "react-native";

export const COLORS = {
    primary: "#3B9AFF",
    white: "#FFFFFF",
    black: "#000000",
    textPrimary: "#333333",
    textSecondary: "#555555",
    grayBorder: "#CCCCCC",
    placeholder: "#A0A0A0",
    background: "#FFFFFF",
    error: "red",
};

export const SIZES = {
    base: 8,
    padding: 20,
    borderRadius: 8,
    h1: 24,
    h2: 20,
    h3: 18,
    body: 16,
    small: 14,
};

export const COMMON_STYLES = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.padding,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.grayBorder,
        borderRadius: SIZES.borderRadius,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        backgroundColor: COLORS.white,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.borderRadius,
        paddingVertical: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
    },
    linkText: {
        fontSize: SIZES.body,
        color: COLORS.primary,
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    label: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        marginBottom: SIZES.base,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
        marginBottom: 20,
    },
    footer: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        fontWeight: "bold",
    },
});

export const AUTH_STYLES = StyleSheet.create({
    logo: {
        width: 600,
        height: 240,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: 40,
    },
    footerImageContainer: {
        marginTop: "auto",
        width: "100%",
        height: 105, // Increased height
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    footerImage: {
        width: "100%",
        height: "100%", // Fill container
        resizeMode: 'cover', // Cover to fit width without gaps
    },
});

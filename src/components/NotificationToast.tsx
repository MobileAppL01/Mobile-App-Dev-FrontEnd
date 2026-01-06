import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Easing, Platform } from 'react-native';
import { useNotificationStore } from '../store/useNotificationStore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

export default function NotificationToast() {
    const visible = useNotificationStore(state => state.visible);
    const message = useNotificationStore(state => state.message);
    const type = useNotificationStore(state => state.type);
    const hideNotification = useNotificationStore(state => state.hideNotification);

    // Animation Values
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // Safe Area
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            // Animate In
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Animate Out
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100, // Slide up out of view
                    duration: 300,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.cubic),
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible, translateY, opacity]);

    let backgroundColor = COLORS.black;
    let iconName: any = 'information-circle';

    if (type === 'success') {
        backgroundColor = COLORS.primary; // Greenish usually or Brand Color
        iconName = 'checkmark-circle';
        // Override if primary is blue but we want green for success
        backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        backgroundColor = '#F44336';
        iconName = 'alert-circle';
    }

    // Even if not visible, we render for exit animation, handling via Opacity
    // But to save resources, if opacity is 0 and not visible, maybe pointerEvents none?
    // Simplified: always render but control visibility via animation state? 
    // Actually for 'if (!visible) return null' approach, we can't animate out.
    // So we remove the early return.

    const topPosition = (insets?.top || 20) + 10;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: topPosition,
                    transform: [{ translateY }],
                    opacity: opacity
                }
            ]}
            pointerEvents={visible ? 'auto' : 'none'} // Interactable only when valid
        >
            <View style={[styles.content, { backgroundColor }]}>
                <Ionicons name={iconName} size={24} color="#fff" />
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity onPress={hideNotification}>
                    <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        alignItems: 'center', // Center content horizontally
        zIndex: 99999, // Absolute highest
        elevation: 100, // For Android top layer
        // No conditional render from store means we need to ensure it doesn't block touches when hidden
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12, // Softer radius
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        width: '100%', // Full width of container (which is padded)
        justifyContent: 'space-between'
    },
    message: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 10,
        flex: 1, // Take remaining space
    },
});

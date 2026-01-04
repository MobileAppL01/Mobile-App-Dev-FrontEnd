import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useNotificationStore } from '../store/useNotificationStore';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

export default function NotificationToast() {
    const { visible, message, type, hideNotification } = useNotificationStore();

    if (!visible) return null;

    let backgroundColor = '#333';
    let iconName: any = 'information-circle';

    if (type === 'success') {
        backgroundColor = '#4CAF50';
        iconName = 'checkmark-circle';
    } else if (type === 'error') {
        backgroundColor = '#F44336';
        iconName = 'alert-circle';
    }

    return (
        <SafeAreaInsetsContext.Consumer>
            {(insets) => (
                <View style={[styles.container, { top: (insets?.top || 0) + 10 }]}>
                    <View style={[styles.content, { backgroundColor }]}>
                        <Ionicons name={iconName} size={24} color="#fff" />
                        <Text style={styles.message}>{message}</Text>
                        <TouchableOpacity onPress={hideNotification}>
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaInsetsContext.Consumer>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 16,
        left: 16, // Or just right if we want a small toast, user said "right corner" but usually toast is center or flexible width. Let's do top rightish or full width with padding.
        // Let's make it float top right
        alignItems: 'flex-end',
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxWidth: '90%', // Don't overflow
    },
    message: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginHorizontal: 10,
        flexShrink: 1,
    },
});

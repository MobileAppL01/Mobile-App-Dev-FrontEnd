import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Dimensions, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInboxStore } from '../../store/useInboxStore';
import { COLORS } from '../../constants/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NotificationItem as NotificationItemType } from '../../services/notificationService';

const { width } = Dimensions.get('window');

interface NotificationItemProps {
    item: NotificationItemType;
    onPress: (item: NotificationItemType) => void;
    onDelete: (id: string) => void;
}

const NotificationItem = ({ item, onPress, onDelete }: NotificationItemProps) => {
    // Icon Logic based on type
    const getIcon = () => {
        switch (item.type) {
            case 'BOOKING':
            case 'PAYMENT_SUCCESS':
                return <MaterialIcons name="sports-tennis" size={24} color={COLORS.primary} />;
            case 'PROMOTION': return <Ionicons name="gift-outline" size={24} color="#F59E0B" />;
            case 'SYSTEM': return <Ionicons name="information-circle-outline" size={24} color="#10B981" />;
            default: return <Ionicons name="notifications-outline" size={24} color={COLORS.placeholder} />;
        }
    };

    const getIconBg = () => {
        switch (item.type) {
            case 'BOOKING':
            case 'PAYMENT_SUCCESS':
                return '#EBF5FF'; // Light Blue
            case 'PROMOTION': return '#FEF3C7'; // Light Yellow
            case 'SYSTEM': return '#D1FAE5'; // Light Green
            default: return '#F3F4F6';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            // Assume the backend sends UTC but without 'Z' (e.g. 2023-10-10T10:00:00).
            // By appending 'Z', we force it to be treated as UTC.
            // If the backend already includes 'Z' or offset, this might need adjustment,
            // but usually this fixes the "treated as local" issue.
            const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHrs = diffMs / (1000 * 60 * 60);

            // Options for VN time
            const vnOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Ho_Chi_Minh' };

            if (diffHrs < 24 && diffHrs >= -1) {
                return date.toLocaleTimeString('vi-VN', { ...vnOptions, hour: '2-digit', minute: '2-digit' });
            } else if (diffHrs < 48 && diffHrs >= 0) {
                return "Hôm qua";
            }
            return date.toLocaleDateString('vi-VN', vnOptions);
        } catch (e) {
            return dateString;
        }
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
        return (
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteAction}>
                <Animated.View style={[styles.deleteActionContent, { transform: [{ translateX: trans }] }]}>
                    <Ionicons name="trash-outline" size={24} color="#fff" />
                    <Text style={styles.deleteActionText}>Xóa</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ marginBottom: 12 }}>
            <Swipeable renderRightActions={renderRightActions}>
                <TouchableOpacity
                    style={[styles.itemContainer, !item.isRead && styles.unreadItem]}
                    onPress={() => onPress(item)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
                        {getIcon()}
                    </View>
                    <View style={styles.textContainer}>
                        <View style={styles.itemHeader}>
                            <Text style={[styles.itemTitle, !item.isRead && { fontWeight: 'bold', color: COLORS.black }]}>
                                {item.title}
                            </Text>
                            <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
                        </View>
                        <Text style={styles.itemMessage} numberOfLines={2}>
                            {item.message}
                        </Text>
                    </View>
                    {!item.isRead && (
                        <View style={styles.unreadDot} />
                    )}
                </TouchableOpacity>
            </Swipeable>
        </View>
    );
};

const NotificationScreen = () => {
    const navigation = useNavigation();
    const { notifications, unreadCount, isLoading, fetchNotifications, markRead, markAllRead, deleteNotification, deleteAllNotifications } = useInboxStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handlePressItem = (item: NotificationItemType) => {
        // Disabled markRead on press as requested
        // if (!item.isRead) {
        //    markRead(item.id);
        // }
        // Navigate if needed
    };

    const handleDelete = (id: string) => {
        Alert.alert("Xóa thông báo", "Bạn có chắc muốn xóa thông báo này?", [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa", style: 'destructive', onPress: () => deleteNotification(id, false) }
        ]);
    };

    const handleDeleteAll = () => {
        Alert.alert("Xóa tất cả", "Bạn có chắc muốn xóa tất cả thông báo?", [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa tất cả", style: 'destructive', onPress: () => deleteAllNotifications(false) }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo</Text>
                {notifications.length > 0 && (
                    <TouchableOpacity onPress={handleDeleteAll} style={styles.readAllBtn}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                        <Text style={[styles.readAllText, { color: COLORS.error }]}>Xóa tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotificationItem item={item} onPress={handlePressItem} onDelete={handleDelete} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchNotifications} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Image
                            source={require('../../assets/images/bottom_image_1.png')}
                            style={{ width: 150, height: 150, opacity: 0.5, marginBottom: 20 }}
                            resizeMode="contain"
                        />
                        <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    readAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5
    },
    readAllText: {
        marginLeft: 5,
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '500'
    },
    listContent: {
        padding: 16,
        paddingBottom: 100
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    unreadItem: {
        backgroundColor: '#F0F9FF', // Subtle highlight for unread
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        marginRight: 8
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        alignItems: 'center'
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151', // Dark Gray
        flex: 1,
        marginRight: 10
    },
    timeText: {
        fontSize: 12,
        color: '#9CA3AF'
    },
    itemMessage: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.error,
        marginTop: 6
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    deleteBtn: {
        padding: 4,
        marginLeft: 8
    },
    deleteAction: {
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        // Match itemContainer margin but we need to verify layout
    },
    deleteActionContent: {
        alignItems: 'center',
    },
    deleteActionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    }
});

export default NotificationScreen;

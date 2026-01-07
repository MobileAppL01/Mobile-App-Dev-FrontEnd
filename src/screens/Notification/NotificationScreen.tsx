import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Dimensions, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInboxStore } from '../../store/useInboxStore';
import { COLORS } from '../../constants/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NotificationItem as NotificationItemType } from '../../services/notificationService';
import { Skeleton } from '../../components/common/Skeleton';

const { width } = Dimensions.get('window');

interface NotificationItemProps {
    item: NotificationItemType | { isSkeleton: boolean, id: string };
    onPress: (item: NotificationItemType) => void;
    onDelete: (id: string) => void;
}

const NotificationItem = ({ item, onPress, onDelete }: NotificationItemProps) => {
    // Skeleton Loading View
    if ('isSkeleton' in item && item.isSkeleton) {
        return (
            <View style={[styles.itemContainer, { marginBottom: 12 }]}>
                <View style={[styles.iconBox, { backgroundColor: '#f0f0f0' }]}>
                    <Skeleton width={24} height={24} borderRadius={12} />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.itemHeader}>
                        <Skeleton width={120} height={16} borderRadius={4} />
                        <Skeleton width={50} height={12} borderRadius={4} />
                    </View>
                    <Skeleton width="90%" height={14} style={{ marginTop: 8 }} />
                    <Skeleton width="60%" height={14} style={{ marginTop: 4 }} />
                </View>
            </View>
        );
    }

    // Type Guard for real item
    const notification = item as NotificationItemType;

    // Icon Logic based on type
    const getIcon = () => {
        switch (notification.type) {
            case 'BOOKING':
            case 'PAYMENT_SUCCESS':
                return <MaterialIcons name="sports-tennis" size={24} color={COLORS.primary} />;
            case 'PROMOTION': return <Ionicons name="gift-outline" size={24} color="#F59E0B" />;
            case 'SYSTEM': return <Ionicons name="information-circle-outline" size={24} color="#10B981" />;
            default: return <Ionicons name="notifications-outline" size={24} color={COLORS.placeholder} />;
        }
    };

    const getIconBg = () => {
        switch (notification.type) {
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
            const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHrs = diffMs / (1000 * 60 * 60);

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
            <TouchableOpacity onPress={() => onDelete(notification.id)} style={styles.deleteAction}>
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
                    style={[styles.itemContainer, !notification.isRead && styles.unreadItem]}
                    onPress={() => onPress(notification)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
                        {getIcon()}
                    </View>
                    <View style={styles.textContainer}>
                        <View style={styles.itemHeader}>
                            <Text style={[styles.itemTitle, !notification.isRead && { fontWeight: 'bold', color: COLORS.black }]}>
                                {notification.title}
                            </Text>
                            <Text style={styles.timeText}>{formatDate(notification.createdAt)}</Text>
                        </View>
                        <Text style={styles.itemMessage} numberOfLines={2}>
                            {notification.message}
                        </Text>
                    </View>
                    {!notification.isRead && (
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

    const SKELETON_DATA = Array(8).fill(0).map((_, i) => ({ id: `skeleton-${i}`, isSkeleton: true } as any));

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo</Text>
                {notifications.length > 0 && !isLoading && (
                    <TouchableOpacity onPress={handleDeleteAll} style={styles.readAllBtn}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                        <Text style={[styles.readAllText, { color: COLORS.error }]}>Xóa tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={isLoading ? SKELETON_DATA : notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotificationItem
                        item={item}
                        onPress={handlePressItem}
                        onDelete={handleDelete}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchNotifications} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Image
                                source={require('../../assets/images/bottom_image_1.png')}
                                style={{ width: 150, height: 150, opacity: 0.5, marginBottom: 20 }}
                                resizeMode="contain"
                            />
                            <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
                        </View>
                    ) : null
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

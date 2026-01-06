import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Dimensions } from 'react-native';
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
}

const NotificationItem = ({ item, onPress }: NotificationItemProps) => {
    // Icon Logic based on type
    const getIcon = () => {
        switch (item.type) {
            case 'BOOKING': return <MaterialIcons name="sports-tennis" size={24} color={COLORS.primary} />;
            case 'PROMOTION': return <Ionicons name="gift-outline" size={24} color="#F59E0B" />;
            case 'SYSTEM': return <Ionicons name="information-circle-outline" size={24} color="#10B981" />;
            default: return <Ionicons name="notifications-outline" size={24} color={COLORS.placeholder} />;
        }
    };

    const getIconBg = () => {
        switch (item.type) {
            case 'BOOKING': return '#EBF5FF'; // Light Blue
            case 'PROMOTION': return '#FEF3C7'; // Light Yellow
            case 'SYSTEM': return '#D1FAE5'; // Light Green
            default: return '#F3F4F6';
        }
    };

    // Format Date (Simple relative time or absolute)
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHrs = diffMs / (1000 * 60 * 60);

            // Options for VN time
            const vnOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Ho_Chi_Minh' };

            if (diffHrs < 24 && diffHrs >= 0) {
                return date.toLocaleTimeString('vi-VN', { ...vnOptions, hour: '2-digit', minute: '2-digit' });
            } else if (diffHrs < 48 && diffHrs >= 0) {
                return "Hôm qua";
            }
            return date.toLocaleDateString('vi-VN', vnOptions);
        } catch (e) {
            return dateString;
        }
    };

    return (
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
    );
};

const OwnerNotificationScreen = () => {
    const navigation = useNavigation();
    const { notifications, unreadCount, isLoading, fetchOwnerNotifications, markRead, markAllRead } = useInboxStore();

    useEffect(() => {
        fetchOwnerNotifications();
    }, []);

    const handlePressItem = (item: NotificationItemType) => {
        if (!item.isRead) {
            markRead(item.id);
        }
        // Navigate if needed, e.g., to Booking Detail
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo (Chủ sân)</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
                        <Ionicons name="checkmark-done-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.readAllText}>Đã đọc tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotificationItem item={item} onPress={handlePressItem} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchOwnerNotifications} colors={[COLORS.primary]} />
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
        marginBottom: 12,
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
    }
});

export default OwnerNotificationScreen;

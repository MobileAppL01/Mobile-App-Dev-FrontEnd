import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminService } from '../../services/adminService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Header } from '../../components/Header';
import { COLORS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with spacing

interface Owner {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    avatar: string;
}

const AdminDashboardScreen = () => {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const navigation = useNavigation<any>();
    const showNotification = useNotificationStore(state => state.showNotification);

    useEffect(() => {
        fetchOwners();
    }, []);

    useEffect(() => {
        if (searchText.trim() === "") {
            setFilteredOwners(owners);
        } else {
            const lowerDate = searchText.toLowerCase();
            const filtered = owners.filter(owner =>
                owner.fullName?.toLowerCase().includes(lowerDate) ||
                owner.email?.toLowerCase().includes(lowerDate) ||
                owner.phone?.includes(searchText)
            );
            setFilteredOwners(filtered);
        }
    }, [searchText, owners]);

    const fetchOwners = async () => {
        try {
            setIsLoading(true);
            const res = await adminService.getAllOwners();
            if (res && res.result) {
                setOwners(res.result);
                setFilteredOwners(res.result);
            }
        } catch (error) {
            console.log('Error fetching owners:', error);
            showNotification("Không thể tải danh sách chủ sân", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const renderOwnerItem = ({ item }: { item: Owner }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AdminOwnerRevenue', { ownerId: item.id, ownerName: item.fullName })}
        >
            <View style={styles.card}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                    <View style={styles.statusIndicator} />
                </View>

                <Text style={styles.name} numberOfLines={1}>{item.fullName}</Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Owner</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail" size={12} color="#9CA3AF" />
                        <Text style={styles.infoText} numberOfLines={1}>{item.email}</Text>
                    </View>
                    {item.phone && (
                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={12} color="#9CA3AF" />
                            <Text style={styles.infoText} numberOfLines={1}>{item.phone}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.viewText}>Xem doanh thu</Text>
                    <Ionicons name="arrow-forward" size={14} color="white" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.fixedHeader}>
                <Header />
            </View>

            <View style={styles.contentContainer}>
                <LinearGradient
                    colors={['#FFFFFF', '#F3F4F6']}
                    style={styles.searchSection}
                >
                    <Text style={styles.screenTitle}>Thống kê doanh thu</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm chủ sân..."
                            placeholderTextColor="#9CA3AF"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                </LinearGradient>

                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <FlatList
                        key={'owner-grid'}
                        data={filteredOwners}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderOwnerItem}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrapper}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconContainer}>
                                    <Ionicons name="people" size={40} color="#9CA3AF" />
                                </View>
                                <Text style={styles.emptyText}>Không tìm thấy chủ sân nào.</Text>
                            </View>
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    fixedHeader: {
        backgroundColor: 'white',
        zIndex: 10,
        elevation: 2,
    },
    contentContainer: {
        flex: 1,
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 10,
        zIndex: 5,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: '800', // Extra bold for emphasis
        color: '#1F2937',
        alignSelf: 'center',
        marginBottom: 15,
        letterSpacing: 0.5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    // Square Card Styles
    cardContainer: {
        width: CARD_WIDTH,
        marginBottom: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    avatar: {
        width: 64, // Larger avatar
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981', // Online/Active Green
        borderWidth: 2,
        borderColor: 'white',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 6,
    },
    badge: {
        backgroundColor: '#EEF2FF', // Soft Indigo
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    badgeText: {
        color: '#4F46E5', // Indigo text
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 12,
    },
    infoContainer: {
        width: '100%',
        gap: 6,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 12,
        color: '#6B7280',
        flex: 1,
    },
    cardFooter: {
        backgroundColor: '#3B9AFF',
        width: '100%',
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    viewText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default AdminDashboardScreen;

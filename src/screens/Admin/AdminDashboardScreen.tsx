import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminService } from '../../services/adminService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Owner {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    avatar: string;
}

const AdminDashboardScreen = () => {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation<any>();

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        try {
            setIsLoading(true);
            const res = await adminService.getAllOwners();
            if (res && res.result) {
                setOwners(res.result);
            }
        } catch (error) {
            console.log('Error fetching owners:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderOwnerItem = ({ item }: { item: Owner }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AdminOwnerRevenue', { ownerId: item.id, ownerName: item.fullName })}
        >
            <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <Text style={styles.headerSubtitle}>Quản lý doanh thu chủ sân</Text>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3B9AFF" />
                </View>
            ) : (
                <FlatList
                    data={owners}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOwnerItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>Chưa có chủ sân nào.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    email: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    phone: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});

export default AdminDashboardScreen;

import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import LogoDark from "../../assets/logos/logo_dark.svg";

const { width } = Dimensions.get('window');

const AboutUsScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Về chúng tôi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <LogoDark width={100} height={100} />
                    </View>
                    <Text style={styles.appName}>Bookinton</Text>
                    <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.titleRow}>
                        <Ionicons name="rocket-outline" size={20} color="#3B9AFF" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>Sứ mệnh</Text>
                    </View>
                    <Text style={styles.text}>
                        Bookinton được xây dựng với sứ mệnh kết nối cộng đồng yêu cầu lông tại Việt Nam. Chúng tôi cam kết mang lại trải nghiệm đặt sân nhanh chóng, tiện lợi và minh bạch nhất.
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.titleRow}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>Cam kết chất lượng</Text>
                    </View>
                    <Text style={styles.text}>
                        Chúng tôi nỗ lực không ngừng để đảm bảo các sân cầu lông trên nền tảng đều đạt chuẩn chất lượng thi đấu.
                    </Text>

                    {/* Certified Badge Area */}
                    <View style={styles.certifiedContainer}>
                        <View style={styles.certifiedBadge}>
                            <MaterialCommunityIcons name="check-decagram" size={24} color="#fff" />
                            <Text style={styles.certifiedText}>Đối tác tin cậy 2025</Text>
                        </View>
                        <View style={[styles.certifiedBadge, { backgroundColor: '#E53935' }]}>
                            <Ionicons name="star" size={18} color="#fff" style={{ marginRight: 4 }} />
                            <Text style={styles.certifiedText}>Top Booking App</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>Liên hệ</Text>
                    <View style={styles.contactCard}>
                        <View style={styles.contactRow}>
                            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="mail" size={18} color="#2196F3" />
                            </View>
                            <Text style={styles.contactText}>bookinton.hcmut@gmail.com</Text>
                        </View>
                        <View style={styles.contactDivider} />
                        <View style={styles.contactRow}>
                            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="globe" size={18} color="#4CAF50" />
                            </View>
                            <Text style={styles.contactText}>www.bookinton.vn</Text>
                        </View>
                        <View style={styles.contactDivider} />
                        <View style={styles.contactRow}>
                            <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
                                <Ionicons name="location" size={18} color="#F44336" />
                            </View>
                            <Text style={styles.contactText}>Ho Chi Minh University of Technology</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2026 Bookinton Vietnam. All rights reserved.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        zIndex: 10
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    backButton: {
        padding: 4
    },
    content: {
        padding: 20,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: "#3B9AFF",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8
    },
    appName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#333',
        marginBottom: 4,
        letterSpacing: 0.5
    },
    appVersion: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500'
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    text: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        textAlign: 'justify'
    },
    certifiedContainer: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 10,
        flexWrap: 'wrap'
    },
    certifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6
    },
    certifiedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
    },
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden'
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    contactDivider: {
        height: 1,
        backgroundColor: '#f5f5f5',
        marginLeft: 48
    },
    contactText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontWeight: '500'
    },
    footer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#F8F9FA'
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500'
    }
});

export default AboutUsScreen;

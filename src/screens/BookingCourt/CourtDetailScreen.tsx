import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Reusable Table Component
// Reusable components removed for simplicity


export default function CourtDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { court } = (route.params as any) || {};

    // Mock Data if not passed fully
    const courtData = {
        ...court,
        phone: "0123456789",
        rating: 4.8,
        reviewCount: 100,
        website: "anhnghiacourt.com",
        description: "Sân Cầu Lông Anh Nghĩa là địa điểm lý tưởng cho những ai yêu thích bộ môn cầu lông. Sân được thiết kế đạt tiêu chuẩn thi đấu với mặt sân gỗ chất lượng cao, hệ thống đèn LED sáng đều, không gây chói mắt...",
        images: [
            court?.image || require("../../assets/images/court1.png"),
            require("../../assets/images/court2.png"),
            require("../../assets/images/court1.png")
        ]
    };

    const [activeSlide, setActiveSlide] = useState(0);

    const onScroll = (event: any) => {
        const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeSlide) {
            setActiveSlide(slide);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header Bar */}
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#3B9AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{courtData.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Image Carousel */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    >
                        {courtData.images.map((img: any, index: number) => (
                            <Image key={index} source={img} style={styles.courtImage} />
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.paginationDots}>
                        {courtData.images.map((_: any, index: number) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    activeSlide === index ? styles.activeDot : styles.inactiveDot
                                ]}
                            />
                        ))}
                    </View>

                    {/* Overlay Buttons */}
                    <View style={styles.imageOverlayTop}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="heart-outline" size={20} color="#3B9AFF" />
                        </View>
                        <View style={[styles.iconCircle, { marginLeft: 10 }]}>
                            <Ionicons name="location-outline" size={20} color="#3B9AFF" />
                        </View>
                        <TouchableOpacity style={styles.bookOverlayButton}>
                            <Text style={styles.bookOverlayText}>Đặt lịch</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageOverlayNav}>
                        <TouchableOpacity style={styles.navCircle} onPress={() => { /* prev */ }}>
                            <Ionicons name="chevron-back" size={16} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navCircle} onPress={() => { /* next */ }}>
                            <Ionicons name="chevron-forward" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-sharp" size={16} color="#3B9AFF" style={{ marginTop: 2 }} />
                        <Text style={styles.infoText}>
                            {courtData.address} <Text style={{ color: '#666', fontSize: 12 }}>| 5.6 km</Text>
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="time-sharp" size={16} color="#3B9AFF" />
                        <Text style={styles.infoText}>{courtData.time}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="call-sharp" size={16} color="#3B9AFF" />
                        <Text style={styles.infoText}>{courtData.phone}</Text>
                    </View>

                    <TouchableOpacity style={styles.ratingRow} onPress={() => navigation.navigate("ReviewScreen" as never)}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>{courtData.rating}</Text>
                        </View>
                        <Text style={styles.reviewText}>| {courtData.reviewCount} đánh giá</Text>
                    </TouchableOpacity>

                    <View style={styles.linkRow}>
                        <Text style={styles.websiteText}>Website: <Text style={{ color: '#333' }}>{courtData.website}</Text></Text>
                        <TouchableOpacity>
                            <Text style={styles.linkAction}>Quy định</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <Text style={styles.descriptionText}>
                        {courtData.description}
                        <Text style={styles.readMore}> Đọc thêm...</Text>
                    </Text>
                </View>

                {/* Pricing Tables - Using manual layout to match the complex image */}

                {/* BANG GIA SAN */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeaderBlue}>BẢNG GIÁ SÂN</Text>
                    <View style={styles.blueTable}>
                        <View style={styles.blueTableHeader}>
                            <Text style={styles.blueHeaderTitle}>Sân cầu lông</Text>
                        </View>
                        <View style={styles.blueTableRow}>
                            <View style={[styles.blueCell, { flex: 1, borderRightWidth: 1, borderColor: '#fff' }]}>
                                <Text style={styles.blueCellHeader}>Khung giờ</Text>
                            </View>
                            <View style={[styles.blueCell, { flex: 0.5 }]}>
                                <Text style={styles.blueCellHeader}>Giá</Text>
                            </View>
                        </View>
                        <View style={[styles.blueTableRow, { backgroundColor: 'white' }]}>
                            <View style={[styles.blueCellContent, { flex: 1, borderRightWidth: 1, borderColor: '#eee' }]}>
                                <Text style={styles.cellContentText}>Mặc định</Text>
                            </View>
                            <View style={[styles.blueCellContent, { flex: 0.5 }]}>
                                <Text style={styles.cellContentText}>0 đ</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* CONG NHAN */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeaderBlue}>CÔNG NHÂN</Text>
                    <View style={styles.complexTable}>
                        {/* Header */}
                        <View style={styles.complexHeader}>
                            <Text style={[styles.complexHeaderText, { flex: 1 }]}>Thứ</Text>
                            <Text style={[styles.complexHeaderText, { flex: 1 }]}>Khung giờ</Text>
                            <Text style={[styles.complexHeaderText, { flex: 1 }]}>Cố định</Text>
                            <Text style={[styles.complexHeaderText, { flex: 1, borderRightWidth: 0 }]}>Vãng lai</Text>
                        </View>
                        {/* Row 1 */}
                        <View style={styles.complexRow}>
                            <Text style={[styles.complexCell, { flex: 1 }]}>Mặc định</Text>
                            <Text style={[styles.complexCell, { flex: 1 }]}>—</Text>
                            <Text style={[styles.complexCell, { flex: 1 }]}>45.000 đ</Text>
                            <Text style={[styles.complexCell, { flex: 1, borderRightWidth: 0 }]}>45.000 đ</Text>
                        </View>
                        {/* Row 2 Group T2-T6 */}
                        <View style={styles.complexRow}>
                            <View style={[styles.complexCell, { flex: 1, justifyContent: 'center' }]}>
                                <Text style={styles.cellContentText}>T2 – T6</Text>
                            </View>
                            <View style={{ flex: 3 }}>
                                <View style={styles.innerRow}>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>5h–16h</Text>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>45.000 đ</Text>
                                    <Text style={[styles.complexCell, { flex: 1, borderRightWidth: 0 }]}>45.000 đ</Text>
                                </View>
                                <View style={styles.innerRow}>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>16h–21h</Text>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>80.000 đ</Text>
                                    <Text style={[styles.complexCell, { flex: 1, borderRightWidth: 0 }]}>90.000 đ</Text>
                                </View>
                                <View style={[styles.innerRow, { borderBottomWidth: 0 }]}>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>21h–24h</Text>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>70.000 đ</Text>
                                    <Text style={[styles.complexCell, { flex: 1, borderRightWidth: 0 }]}>80.000 đ</Text>
                                </View>
                            </View>
                        </View>
                        {/* Row 3 Group T7-CN */}
                        <View style={styles.complexRow}>
                            <View style={[styles.complexCell, { flex: 1, justifyContent: 'center' }]}>
                                <Text style={styles.cellContentText}>T7 – CN</Text>
                            </View>
                            <View style={{ flex: 3 }}>
                                <View style={styles.innerRow}>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>5h–9h</Text>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>70.000 đ</Text>
                                    <Text style={[styles.complexCell, { flex: 1, borderRightWidth: 0 }]}>80.000 đ</Text>
                                </View>
                                <View style={[styles.innerRow, { borderBottomWidth: 0 }]}>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>9h–16h</Text>
                                    <Text style={[styles.complexCell, { flex: 1 }]}>60.000 đ</Text>
                                    <Text style={[styles.complexCell, { flex: 1, borderRightWidth: 0 }]}>70.000 đ</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* SERVICES */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeaderBlue}>DANH SÁCH DỊCH VỤ</Text>
                    <View style={styles.complexTable}>
                        <View style={styles.complexHeader}>
                            <Text style={[styles.complexHeaderText, { flex: 1 }]}>Dịch vụ</Text>
                            <Text style={[styles.complexHeaderText, { flex: 1, borderRightWidth: 0 }]}>Giá</Text>
                        </View>
                        <View style={styles.complexRow}>
                            <Text style={[styles.complexCell, { flex: 1 }]}>Thuê vợt</Text>
                            <Text style={[styles.complexCell, { flex: 1, borderRightWidth: 0 }]}>50.000 đ</Text>
                        </View>
                        <View style={[styles.complexRow, { borderBottomWidth: 0 }]}>
                            <Text style={[styles.complexCell, { flex: 1 }]}>Nước uống</Text>
                            <Text style={[styles.complexCell, { flex: 1, borderRightWidth: 0 }]}>15.000 đ</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3B9AFF',
    },
    backButton: {
        padding: 4,
    },
    carouselContainer: {
        height: 220,
        position: 'relative',
    },
    courtImage: {
        width: width,
        height: 220,
        resizeMode: 'cover',
    },
    paginationDots: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: 'white',
    },
    inactiveDot: {
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    imageOverlayTop: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookOverlayButton: {
        backgroundColor: '#3B9AFF',
        borderRadius: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginLeft: 10,
    },
    bookOverlayText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    imageOverlayNav: {
        position: 'absolute',
        width: '100%',
        top: '50%',
        marginTop: -15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        pointerEvents: 'none' // For display mainly, logic separate
    },
    navCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(59, 154, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
    },
    infoContainer: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    infoText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#333',
        flex: 1,
        lineHeight: 18,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFD700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
        color: '#333',
    },
    reviewText: {
        fontSize: 12,
        color: '#333',
        fontWeight: 'bold',
    },
    linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    websiteText: {
        fontSize: 12,
        color: '#3B9AFF',
    },
    linkAction: {
        fontSize: 12,
        color: '#3B9AFF',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3B9AFF',
        marginVertical: 10,
    },
    descriptionText: {
        fontSize: 13,
        color: '#444',
        lineHeight: 20,
    },
    readMore: {
        color: '#3B9AFF',
        fontWeight: 'bold',
    },
    sectionContainer: {
        marginTop: 10,
        paddingHorizontal: 16,
    },
    sectionHeaderBlue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#3B9AFF',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    blueTable: {
        borderWidth: 1,
        borderColor: '#3B9AFF',
        borderRadius: 4,
        overflow: 'hidden',
    },
    blueTableHeader: {
        backgroundColor: '#82C2FF',
        padding: 8,
        alignItems: 'center',
    },
    blueHeaderTitle: {
        fontWeight: 'bold',
        color: '#333',
    },
    blueTableRow: {
        flexDirection: 'row',
        backgroundColor: '#D6EAF8',
    },
    blueCell: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blueCellHeader: {
        fontWeight: 'bold',
        color: '#333',
    },
    blueCellContent: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellContentText: {
        fontSize: 13,
        color: '#333',
    },
    complexTable: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 8,
        backgroundColor: '#fff',
    },
    complexHeader: {
        flexDirection: 'row',
        backgroundColor: '#F0F8FF', // Light AliceBlue
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    complexHeaderText: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 13,
        color: '#2C3E50',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    complexRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    complexCell: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        textAlign: 'center',
        fontSize: 13,
        color: '#34495E',
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
        textAlignVertical: 'center',
    },
    innerRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
    }

});

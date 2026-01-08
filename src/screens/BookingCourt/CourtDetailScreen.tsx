import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    Linking,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { reviewService } from '../../services/reviewService';

const { width } = Dimensions.get('window');

import { getCourtImageSource } from '../../utils/imageHelper';

export default function CourtDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { court } = (route.params as any) || {};

    // Mock Data if not passed fully
    const courtData = {
        ...court,
        phone: court?.phone || "0123456789",
        rating: court?.rating || 4.8,
        reviewCount: court?.totalReviews || 100,
        website: "anhnghiacourt.com",
        time: court?.time || (court?.openTime ? `${court.openTime.substring(0, 5)} - ${court.closeTime?.substring(0, 5)}` : "6:00 AM - 10:00 PM"),
        description: court?.description || "Sân Cầu Lông Anh Nghĩa là địa điểm lý tưởng cho những ai yêu thích bộ môn cầu lông...",
        images: [
            getCourtImageSource(court?.image?.uri),
            require("../../assets/images/court2.png"),
            require("../../assets/images/court1.png")
        ],
        status: court?.status
    };

    const scrollViewRef = useRef<ScrollView>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    const onScroll = (event: any) => {
        const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeSlide) {
            setActiveSlide(slide);
        }
    };

    const scrollCarousel = (direction: 'next' | 'prev') => {
        if (!scrollViewRef.current) return;
        let nextSlide = activeSlide;
        if (direction === 'next') {
            nextSlide = activeSlide < courtData.images.length - 1 ? activeSlide + 1 : 0;
        } else {
            nextSlide = activeSlide > 0 ? activeSlide - 1 : courtData.images.length - 1;
        }
        scrollViewRef.current.scrollTo({ x: nextSlide * width, animated: true });
        setActiveSlide(nextSlide);
    };

    const handleBookNow = () => {
        // courtData acts as the Location object
        navigation.navigate("BookingTimeSelection" as never, { location: courtData } as never);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={{ flex: 1 }}>
                {/* Header Bar */}
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#3B9AFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{courtData.name}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Image Carousel */}
                    <View style={styles.carouselContainer}>
                        <ScrollView
                            ref={scrollViewRef}
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
                        </View>

                        <View style={styles.imageOverlayNav}>
                            <TouchableOpacity style={styles.navCircle} onPress={() => scrollCarousel('prev')}>
                                <Ionicons name="chevron-back" size={16} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navCircle} onPress={() => scrollCarousel('next')}>
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

                        <TouchableOpacity
                            style={styles.seeReviewsBtn}
                            onPress={() => navigation.navigate("ReviewScreen" as never, { locationId: courtData.locationId, courtName: courtData.name } as never)}
                        >
                            <Text style={styles.seeReviewsText}>Xem đánh giá chi tiết</Text>
                            <Ionicons name="chevron-forward" size={16} color="#3B9AFF" />
                        </TouchableOpacity>

                        <View style={styles.linkRow}>
                            {/* ... existing link row content ... */}
                            <Text style={styles.websiteText}>Website: <Text style={{ color: '#333' }}>{courtData.website}</Text></Text>
                            <TouchableOpacity>
                                <Text style={styles.linkAction}>Quy định</Text>
                            </TouchableOpacity>
                        </View>

                        {/* MAP SECTION */}
                        <TouchableOpacity
                            style={styles.mapPreview}
                            activeOpacity={0.9}
                            onPress={() => {
                                Alert.alert(
                                    "Truy cập bản đồ",
                                    "Bạn có muốn mở bản đồ để xem đường đi đến sân này không?",
                                    [
                                        { text: "Bỏ qua", style: "cancel" },
                                        {
                                            text: "Mở bản đồ",
                                            onPress: () => {
                                                const query = encodeURIComponent(courtData.address || "Sân cầu lông");
                                                const url = Platform.select({
                                                    ios: `maps:0,0?q=${query}`,
                                                    android: `geo:0,0?q=${query}`
                                                });
                                                // Fallback to Google Maps Web if scheme fails (though geo/maps usually work)
                                                const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

                                                Linking.canOpenURL(url!).then(supported => {
                                                    if (supported) {
                                                        Linking.openURL(url!);
                                                    } else {
                                                        Linking.openURL(webUrl);
                                                    }
                                                });
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            {/* Fake Map Background */}
                            <View style={styles.fakeMapBg}>
                                {/* Grid lines or simple pattern simulation */}
                                <View style={styles.mapGridVer} />
                                <View style={styles.mapGridHor} />
                                <Ionicons name="map" size={40} color="#CBD5E1" style={{ opacity: 0.5 }} />
                            </View>

                            {/* Pin & Call To Action */}
                            <View style={styles.mapOverlayCenter}>
                                <Ionicons name="location-sharp" size={32} color="#EF4444" />
                                <View style={styles.mapTag}>
                                    <Text style={styles.mapTagText}>Xem vị trí</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Mô tả</Text>
                        <Text style={styles.descriptionText}>
                            {courtData.description}
                        </Text>
                    </View>

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
                                    <Text style={styles.cellContentText}>{courtData.pricePerHour ? courtData.pricePerHour.toLocaleString('vi-VN') : 50000} đ</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* KHÁCH HÀNG */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionHeaderBlue}>KHÁCH HÀNG</Text>
                        <View style={styles.complexTable}>
                            {/* Header */}
                            <View style={styles.complexHeader}>
                                <Text style={[styles.complexHeaderText, { flex: 1.2 }]}>Thứ</Text>
                                <Text style={[styles.complexHeaderText, { flex: 1.5 }]}>Khung giờ</Text>
                                <Text style={[styles.complexHeaderText, { flex: 1 }]}>Cố định</Text>
                                <Text style={[styles.complexHeaderText, { flex: 1, borderRightWidth: 0 }]}>Vãng lai</Text>
                            </View>
                            {/* Body */}
                            <View style={{ flexDirection: 'row' }}>
                                {/* Right Block */}
                                <View style={{ flex: 4.7 }}>
                                    {/* Row 1: Mac dinh */}
                                    <View style={styles.innerRow}>
                                        <View style={[styles.complexCellContainer, { flex: 1.2 }]}><Text style={styles.complexCellText}>Mặc định</Text></View>
                                        <View style={[styles.complexCellContainer, { flex: 1.5 }]}><Text style={styles.complexCellText}>5h–24h</Text></View>
                                        <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>80.000 đ</Text></View>
                                        <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>80.000 đ</Text></View>
                                    </View>
                                    {/* Row 2: T2-T6 */}
                                    <View style={styles.innerRow}>
                                        <View style={[styles.complexCellContainer, { flex: 1.2, borderBottomWidth: 0 }]}><Text style={styles.complexCellText}>T2 – T6</Text></View>
                                        <View style={{ flex: 3.5, borderLeftWidth: 1, borderColor: '#E0E0E0' }}>
                                            <View style={styles.innerRow}>
                                                <View style={[styles.complexCellContainer, { flex: 1.5 }]}><Text style={styles.complexCellText}>5h–16h</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>30.000 đ</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>30.000 đ</Text></View>
                                            </View>
                                            <View style={styles.innerRow}>
                                                <View style={[styles.complexCellContainer, { flex: 1.5 }]}><Text style={styles.complexCellText}>16h–21h</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>80.000 đ</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>90.000 đ</Text></View>
                                            </View>
                                            <View style={[styles.innerRow, { borderBottomWidth: 0 }]}>
                                                <View style={[styles.complexCellContainer, { flex: 1.5 }]}><Text style={styles.complexCellText}>21h–24h</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>70.000 đ</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>80.000 đ</Text></View>
                                            </View>
                                        </View>
                                    </View>
                                    {/* Row 3: T7-CN */}
                                    <View style={[styles.innerRow, { borderTopWidth: 1, borderColor: '#E0E0E0', borderBottomWidth: 0 }]}>
                                        <View style={[styles.complexCellContainer, { flex: 1.2, borderBottomWidth: 0 }]}><Text style={styles.complexCellText}>T7 – CN</Text></View>
                                        <View style={{ flex: 3.5, borderLeftWidth: 1, borderColor: '#E0E0E0' }}>
                                            <View style={styles.innerRow}>
                                                <View style={[styles.complexCellContainer, { flex: 1.5 }]}><Text style={styles.complexCellText}>5h–9h</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>70.000 đ</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>80.000 đ</Text></View>
                                            </View>
                                            <View style={styles.innerRow}>
                                                <View style={[styles.complexCellContainer, { flex: 1.5 }]}><Text style={styles.complexCellText}>9h–16h</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>60.000 đ</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>70.000 đ</Text></View>
                                            </View>
                                            <View style={[styles.innerRow, { borderBottomWidth: 0 }]}>
                                                <View style={[styles.complexCellContainer, { flex: 1.5 }]}><Text style={styles.complexCellText}>16h–21h</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>90.000 đ</Text></View>
                                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>100.000 đ</Text></View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* HSSV */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionHeaderBlue}>HSSV</Text>
                        <View style={styles.complexTable}>
                            <View style={styles.complexHeader}>
                                <Text style={[styles.complexHeaderText, { flex: 1 }]}>Thứ</Text>
                                <Text style={[styles.complexHeaderText, { flex: 1 }]}>Khung giờ</Text>
                                <Text style={[styles.complexHeaderText, { flex: 1, borderRightWidth: 0 }]}>Giá</Text>
                            </View>
                            <View style={styles.complexRow}>
                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>Mặc định</Text></View>
                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>—</Text></View>
                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>0 đ</Text></View>
                            </View>
                            <View style={styles.complexRow}>
                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>T2 – T6</Text></View>
                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>5h–24h</Text></View>
                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>50.000 đ</Text></View>
                            </View>
                            <View style={[styles.complexRow, { borderBottomWidth: 0 }]}>
                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>T7 – CN</Text></View>
                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>5h–24h</Text></View>
                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>60.000 đ</Text></View>
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
                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>Thuê vợt</Text></View>
                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>50.000 đ</Text></View>
                            </View>
                            <View style={[styles.complexRow, { borderBottomWidth: 0 }]}>
                                <View style={[styles.complexCellContainer, { flex: 1 }]}><Text style={styles.complexCellText}>Nước uống</Text></View>
                                <View style={[styles.complexCellContainer, { flex: 1, borderRightWidth: 0 }]}><Text style={styles.complexCellText}>15.000 đ</Text></View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Sticky Footer */}
                <View style={styles.footerContainer}>
                    <View style={styles.footerPriceInfo}>
                        <Text style={styles.footerPriceLabel}>Mặc định</Text>
                        <Text style={styles.footerPriceValue}>{courtData.pricePerHour ? courtData.pricePerHour.toLocaleString('vi-VN') : 50000}đ<Text style={styles.perHour}>/giờ</Text></Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.bookNowButton, courtData.status === 'MAINTENANCE' && { backgroundColor: '#ccc' }]}
                        onPress={handleBookNow}
                        disabled={courtData.status === 'MAINTENANCE'}
                    >
                        <Text style={styles.bookNowText}>{courtData.status === 'MAINTENANCE' ? "Bảo trì" : "ĐẶT LỊCH NGAY"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

// Add these to StyleSheet at bottom (I will do this in next replacement chunk or include here if tool allows modifying styles separately? No, must match exactly).
// Actually, I can't add styles if I don't select the style block.
// I will just use inline styles for the footer or rely on existing styles if generic enough, or I will update styles in a second call.
// "stickyFooter" and "bookNowButton" are new.
// I'll add them to the style block in a separate call or try to squeeze them here?
// The tool won't let me modify styles if I am targeting the function.
// I will assume I need to update styles too.


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
        borderBottomWidth: 1,
        borderBottomColor: '#3B9AFF',
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
    complexCellContainer: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    complexCellText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#34495E',
    },
    innerRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
    },
    seeReviewsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginVertical: 4,
    },
    seeReviewsText: {
        fontSize: 14,
        color: '#3B9AFF',
        fontWeight: 'bold',
        marginRight: 6,
        textDecorationLine: 'underline',
    },
    footerContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        // Shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 24 : 16 // Handle safe area properly
    },
    footerPriceInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    footerPriceLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2
    },
    footerPriceValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3B9AFF',
    },
    perHour: {
        fontSize: 12,
        color: '#999',
        fontWeight: 'normal'
    },
    bookNowButton: {
        backgroundColor: '#3B9AFF', // Unified blue theme
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#3B9AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4
    },
    bookNowText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
    // Map Styles
    mapPreview: {
        height: 140,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 12,
        backgroundColor: '#F1F5F9', // Light Slate
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    fakeMapBg: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    mapGridVer: {
        position: 'absolute',
        width: 1,
        height: '100%',
        backgroundColor: '#E2E8F0',
        left: '50%'
    },
    mapGridHor: {
        position: 'absolute',
        height: 1,
        width: '100%',
        backgroundColor: '#E2E8F0',
        top: '50%'
    },
    mapOverlayCenter: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mapTag: {
        marginTop: 4,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    mapTagText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3B9AFF'
    }
});

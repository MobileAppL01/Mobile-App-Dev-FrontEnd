import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LogoDark from "../../assets/logos/logo_dark.svg";

const { width, height } = Dimensions.get('window');

// --- Types ---
export interface Court {
  id: number;
  name: string;
  address: string;
  time: string;
  image: any;
}

// --- Sample Data (Expanded) ---
const INITIAL_COURTS: Court[] = [
  {
    id: 1,
    name: "Thanh Da Badminton Court",
    address: "353/7A Binh Quoi, Ward 28, Binh Thanh, HCMC",
    time: "9:00 AM - 11:00 PM",
    image: require("../../assets/images/court1.png"),
  },
  {
    id: 2,
    name: "Nghia Badminton Court",
    address: "123 Pham Van Dong, Thu Duc, HCMC",
    time: "8:00 AM - 10:00 PM",
    image: require("../../assets/images/court2.png"),
  },
  {
    id: 3,
    name: "Family Badminton Court",
    address: "45 Nguyen Trai, District 1, HCMC",
    time: "7:00 AM - 9:00 PM",
    image: require("../../assets/images/court1.png"),
  },
  {
    id: 4,
    name: "Bach Khoa Badminton Court",
    address: "268 Ly Thuong Kiet, District 10, HCMC",
    time: "6:00 AM - 11:00 PM",
    image: require("../../assets/images/court2.png"),
  },
  {
    id: 5,
    name: "Buon Ho Badminton Court",
    address: "Dak Lak Province",
    time: "5:00 AM - 8:00 PM",
    image: require("../../assets/images/court1.png"),
  },
  {
    id: 6,
    name: "Buon Me Thuot Badminton Court",
    address: "Dak Lak Province",
    time: "9:00 AM - 10:00 PM",
    image: require("../../assets/images/court2.png"),
  },
  {
    id: 7,
    name: "Victory Court",
    address: "Tan Binh District, HCMC",
    time: "9:00 AM - 11:00 PM",
    image: require("../../assets/images/court1.png"),
  },
  {
    id: 8,
    name: "Galaxy Court",
    address: "District 7, HCMC",
    time: "9:00 AM - 11:00 PM",
    image: require("../../assets/images/court2.png"),
  },
  {
    id: 9,
    name: "Sunshine Court",
    address: "District 2, HCMC",
    time: "9:00 AM - 11:00 PM",
    image: require("../../assets/images/court1.png"),
  },
  {
    id: 10,
    name: "Moonlight Court",
    address: "District 3, HCMC",
    time: "9:00 AM - 11:00 PM",
    image: require("../../assets/images/court2.png"),
  },
  {
    id: 11,
    name: "Star Court",
    address: "District 5, HCMC",
    time: "9:00 AM - 11:00 PM",
    image: require("../../assets/images/court1.png"),
  },
  {
    id: 12,
    name: "Ocean Court",
    address: "Phu Nhuan, HCMC",
    time: "9:00 AM - 11:00 PM",
    image: require("../../assets/images/court2.png"),
  },
  {
    id: 13,
    name: "Forest Court",
    address: "Go Vap, HCMC",
    time: "9:00 AM - 11:00 PM",
    image: require("../../assets/images/court1.png"),
  },
  {
    id: 14,
    name: "Sky Court",
    address: "Binh Tan, HCMC",
    time: "9:00 AM - 11:00 PM",
    image: require("../../assets/images/court2.png"),
  }
];

const ITEMS_PER_PAGE = 6;

export default function HomeScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const navigation = useNavigation<any>();

  // Use state data (could be filtered later)
  const [courtsData, setCourtsData] = useState(INITIAL_COURTS);

  // Pagination Logic
  const totalPages = Math.ceil(courtsData.length / ITEMS_PER_PAGE);
  const currentCourts = courtsData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCourtPress = (court: Court) => {
    navigation.navigate('CourtDetail', { court });
  };

  // --- Render Components ---

  const renderHeader = () => (
    <View>
      <View style={styles.topBanner}>
        <Text style={styles.topBannerText}>Tìm và đặt sân cầu lông của bạn dễ dàng – Mọi lúc, Mọi nơi!</Text>
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.welcomeText}>Chào mừng bạn đến với</Text>
        <LogoDark width={100} height={50} />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Đặt sân cầu lông bạn muốn!</Text>
        <View style={styles.separator} />
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBox} onPress={() => setFilterVisible(true)}>
          <Ionicons name="filter-outline" size={20} color="#666" style={{ marginRight: 8 }} />
          <Text style={[styles.searchInput, { color: '#999' }]}>Nhập tên sân..</Text>
          <Ionicons name="search-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCourtItem = ({ item }: { item: Court }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.9}
      onPress={() => handleCourtPress(item)}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.courtImage} />
        {/* Overlay Icons */}
        <View style={styles.overlayIcons}>
          <View style={styles.iconBadge}>
            <Ionicons name="heart-outline" size={16} color="#3B9AFF" />
          </View>
          <View style={[styles.iconBadge, { marginLeft: 8 }]}>
            <Ionicons name="location-outline" size={16} color="#3B9AFF" />
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.courtName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.courtAddress} numberOfLines={2}>
          {item.address}
        </Text>
        <Text style={styles.courtTime}>
          <Text style={{ fontWeight: 'bold' }}>{item.time.split('-')[0]}</Text> - <Text style={{ fontWeight: 'bold' }}>{item.time.split('-')[1]}</Text>
        </Text>

        <TouchableOpacity style={styles.bookButton} onPress={() => handleCourtPress(item)}>
          <Text style={styles.bookButtonText}>Đặt ngay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Generate page numbers to show
    let pages = [];
    if (totalPages <= 5) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Show first 3, ... , last page or current context
      // Simplest: Current, Prev, Next
      if (currentPage <= 3) pages = [1, 2, 3, 4, 5].filter(p => p <= totalPages);
      else if (currentPage >= totalPages - 2) pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      else pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={styles.pageButton}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? "#ccc" : "#333"} />
        </TouchableOpacity>

        {pages.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.pageButton, currentPage === p && styles.activePage]}
            onPress={() => handlePageChange(p)}
          >
            <Text style={[styles.pageText, currentPage === p && styles.activePageText]}>{p}</Text>
          </TouchableOpacity>
        ))}

        {totalPages > 5 && currentPage < totalPages - 2 && (
          <View style={styles.dotsContainer}>
            <Text>...</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.pageButton}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? "#ccc" : "#333"} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isFilterVisible}
      onRequestClose={() => setFilterVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header Modal */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setFilterVisible(false)} style={styles.modalBackBtn}>
            <Ionicons name="arrow-back" size={24} color="#3B9AFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Tìm kiếm</Text>
          <TouchableOpacity onPress={() => { /* reset */ }}>
            <Ionicons name="refresh" size={24} color="#3B9AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Area Section */}
          <View style={styles.filterSection}>
            <View style={styles.filterLabelRow}>
              <Ionicons name="radio-button-on" size={20} color="#3B9AFF" />
              <Text style={styles.filterLabel}>Khu vực</Text>
            </View>
            <View style={styles.dropdownRow}>
              <View style={styles.dropdown}>
                <Text style={styles.dropdownText}>Tinh/TP</Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </View>
              <View style={styles.dropdown}>
                <Text style={styles.dropdownText}>Phường / Xã</Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </View>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.filterSection}>
            <View style={styles.filterLabelRow}>
              <Ionicons name="radio-button-on" size={20} color="#3B9AFF" />
              <Text style={styles.filterLabel}>Giá <Text style={{ fontWeight: '400', fontSize: 14 }}>(70.000VNĐ/giờ)</Text></Text>
            </View>
            <View style={styles.priceRangeLabels}>
              <Text style={styles.priceLabel}>0 VNĐ</Text>
              <Text style={styles.priceLabel}>200.000 VNĐ</Text>
            </View>
            {/* Fake Slider Visual */}
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: '40%' }]} />
              <View style={styles.sliderThumb} />
            </View>
          </View>

          {/* Keyword Section */}
          <View style={styles.filterSection}>
            <Text style={styles.keywordsTitle}>Từ khóa</Text>
            <View style={styles.keywordsContainer}>
              <TouchableOpacity style={styles.keywordChip}>
                <Text style={styles.keywordText}>Cầu lông gần tôi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keywordChip}>
                <Text style={styles.keywordText}>Cầu lông xa tôi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keywordChip}>
                <Text style={styles.keywordText}>Cầu lông Thủ Đức</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.searchButton} onPress={() => setFilterVisible(false)}>
            <Text style={styles.searchButtonText}>Tìm kiếm</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={currentCourts}
        renderItem={renderCourtItem}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderPagination}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBanner: {
    backgroundColor: '#3B9AFF',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  topBannerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
    marginTop: 10,
    fontWeight: '400',
  },
  titleContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#3B9AFF',
    marginTop: 8,
    width: '100%',
  },
  searchContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B9AFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 45,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 10
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: (width - 48) / 2,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 100,
    width: '100%',
  },
  courtImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayIcons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 8,
    alignItems: 'center',
  },
  courtName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  courtAddress: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    height: 30,
  },
  courtTime: {
    fontSize: 10,
    color: '#333',
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: '#3B9AFF',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 4,
    width: '80%',
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  activePage: {
    borderColor: '#333',
    borderWidth: 1.5,
  },
  activePageText: {
    fontWeight: 'bold',
    color: '#333',
  },
  pageText: {
    fontSize: 14,
    color: '#333',
  },
  dotsContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalBackBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 24,
  },
  filterSection: {
    marginBottom: 30,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B9AFF',
    marginLeft: 8,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdown: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#999',
    fontSize: 14,
  },
  priceRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    position: 'relative',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    left: '40%',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 3,
  },
  keywordsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordChip: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  keywordText: {
    color: '#666',
    fontSize: 12,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
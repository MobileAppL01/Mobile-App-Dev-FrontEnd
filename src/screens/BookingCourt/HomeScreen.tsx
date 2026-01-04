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
import { VIETNAM_LOCATIONS } from '../../constants/VietnamLocation';

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

  // Filter States
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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

  const renderLocationPicker = (
    visible: boolean,
    title: string,
    data: string[],
    onSelect: (item: string) => void,
    onClose: () => void
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 16, borderBottomWidth: 1, borderColor: '#f0f0f0' }}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={{ fontSize: 16 }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

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
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Bộ lọc tìm kiếm</Text>
          <TouchableOpacity onPress={() => {
            setSelectedCity('');
            setSelectedDistrict('');
            setMinPrice('');
            setMaxPrice('');
          }}>
            <Text style={{ color: '#3B9AFF', fontWeight: 'bold' }}>Đặt lại</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Area Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionHeader}>Khu vực</Text>
            <View style={styles.locationContainer}>

              {/* City Picker Trigger */}
              <TouchableOpacity
                style={[styles.dropdownBox, !selectedCity && styles.placeholderDropdown]}
                onPress={() => setShowCityPicker(true)}
              >
                <Ionicons name="location-sharp" size={20} color={selectedCity ? "#3B9AFF" : "#999"} style={{ marginRight: 8 }} />
                <Text style={[styles.dropdownText, !selectedCity && { color: '#999' }]}>
                  {selectedCity || "Chọn Tỉnh/Thành phố"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#999" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              {/* District Picker Trigger */}
              <TouchableOpacity
                style={[styles.dropdownBox, !selectedDistrict && styles.placeholderDropdown, { marginTop: 12 }]}
                onPress={() => {
                  if (!selectedCity) {
                    alert("Vui lòng chọn Tỉnh/Thành phố trước.");
                  } else {
                    setShowDistrictPicker(true);
                  }
                }}
              >
                <Ionicons name="map" size={20} color={selectedDistrict ? "#3B9AFF" : "#999"} style={{ marginRight: 8 }} />
                <Text style={[styles.dropdownText, !selectedDistrict && { color: '#999' }]}>
                  {selectedDistrict || "Chọn Quận/Huyện"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#999" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

            </View>
          </View>

          {/* Price Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionHeader}>Khoảng giá (VNĐ)</Text>
            <View style={styles.priceInputRow}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceInputLabel}>Từ</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
              </View>
              <View style={styles.priceDash}></View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceInputLabel}>Đến</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="500.000"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>
          </View>

          {/* Amenities / Keywords Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionHeader}>Tiện ích</Text>
            <View style={styles.keywordsContainer}>
              {['Wifi miễn phí', 'Chỗ để xe', 'Máy lạnh', 'Canteen', 'Shop cầu lông'].map((item) => (
                <TouchableOpacity key={item} style={styles.keywordChip}>
                  <Text style={styles.keywordText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.applyButton} onPress={() => setFilterVisible(false)}>
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>

        {/* Location Pickers */}
        {renderLocationPicker(
          showCityPicker,
          "Chọn Tỉnh/Thành phố",
          VIETNAM_LOCATIONS.map(l => l.name),
          (city) => { setSelectedCity(city); setSelectedDistrict(''); },
          () => setShowCityPicker(false)
        )}

        {renderLocationPicker(
          showDistrictPicker,
          "Chọn Quận/Huyện",
          selectedCity ? (VIETNAM_LOCATIONS.find(l => l.name === selectedCity)?.districts || []) : [],
          (district) => setSelectedDistrict(district),
          () => setShowDistrictPicker(false)
        )}

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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalBackBtn: { padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalContent: { padding: 20 },

  filterSection: { marginBottom: 25 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },

  locationContainer: {
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  placeholderDropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd'
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500'
  },

  // Price Input Styles
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInputContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center'
  },
  priceInputLabel: {
    color: '#999',
    marginRight: 8,
    fontSize: 14
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  priceDash: {
    width: 10,
    height: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 10
  },

  // Keywords
  keywordsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  keywordChip: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D6E4FF'
  },
  keywordText: { color: '#3B9AFF', fontSize: 13, fontWeight: '500' },

  // Footer
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff'
  },
  applyButton: {
    backgroundColor: '#3B9AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#3B9AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  applyButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
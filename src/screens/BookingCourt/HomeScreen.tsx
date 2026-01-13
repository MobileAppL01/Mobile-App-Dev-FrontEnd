import React, { useState, useEffect } from 'react';
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
  ScrollView,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LogoDark from "../../assets/logos/logo_dark.svg";
import { VIETNAM_LOCATIONS } from '../../constants/VietnamLocation';
import { locationService } from '../../services/locationService';
import { LocationDTO } from '../../types/location';
import { BASE_URL } from '../../services/axiosInstance';
import { useNotificationStore } from '../../store/useNotificationStore';
import { courtService } from '../../services/courtService'; // Keep for Provinces/Districts options
import { Header } from '../../components/Header';
const { width, height } = Dimensions.get('window');

// Logic for Location -> UI Court
interface Court {
  id: number;
  locationId?: number;
  name: string;
  address: string;
  rating: number;
  pricePerHour: number;
  openTime?: string;
  closeTime?: string;
  image: any;
  phone?: string;
  description?: string;
  isSkeleton?: boolean;
  status?: string;
}
import { getCourtImageSource } from '../../utils/imageHelper';
import { Skeleton } from '../../components/common/Skeleton';

const ITEMS_PER_PAGE = 6;

const CourtCard = React.memo(({ item, onPress }: { item: Court, onPress: (item: Court) => void }) => {
  if (item.isSkeleton) {
    return (
      <View style={[styles.cardContainer, { backgroundColor: 'white' }]}>
        <View style={styles.imageContainer}>
          <Skeleton width="100%" height="100%" />
        </View>
        <View style={styles.cardContent}>
          <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={12} style={{ marginBottom: 16 }} />
          <Skeleton width="70%" height={28} borderRadius={4} />
        </View>
      </View>
    );
  }

  const [imageSource, setImageSource] = useState(getCourtImageSource(item.image?.uri));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSource(getCourtImageSource(item.image?.uri));
  }, [item.image?.uri]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback to a random default image using the helper
      setImageSource(getCourtImageSource(null));
    }
  };

  const isMaintenance = item.status === 'MAINTENANCE';

  return (
    <TouchableOpacity
      style={[styles.cardContainer, isMaintenance && styles.cardDisabled]}
      activeOpacity={isMaintenance ? 1 : 0.9}
      onPress={() => !isMaintenance && onPress(item)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={[styles.courtImage, isMaintenance && { opacity: 0.6 }]}
          onError={handleImageError}
        />
        {isMaintenance && (
          <View style={styles.maintenanceOverlay}>
            <Text style={styles.maintenanceText}>BẢO TRÌ</Text>
          </View>
        )}
        {/* Overlay Icons */}
        {!isMaintenance && (
          <View style={styles.overlayIcons}>
            <View style={styles.iconBadge}>
              <Ionicons name="heart-outline" size={16} color="#3B9AFF" />
            </View>
            <View style={[styles.iconBadge, { marginLeft: 8 }]}>
              <Ionicons name="location-outline" size={16} color="#3B9AFF" />
            </View>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.courtName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.courtAddress} numberOfLines={2}>
          {item.address}
        </Text>
        <Text style={styles.courtTime}>
          <Text style={{ fontWeight: 'bold' }}>{item.openTime?.substring(0, 5)}</Text> - <Text style={{ fontWeight: 'bold' }}>{item.closeTime?.substring(0, 5)}</Text>
        </Text>

        <TouchableOpacity
          style={[styles.bookButton, isMaintenance && { backgroundColor: '#ccc' }]}
          onPress={() => !isMaintenance && onPress(item)}
          disabled={isMaintenance}
        >
          <Text style={styles.bookButtonText}>{isMaintenance ? "Bảo trì" : "Đặt ngay"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

export default function HomeScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const navigation = useNavigation<any>();

  const [courtsData, setCourtsData] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter Data States (Options)
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  // Search & Sort State
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | null>(null);

  // Filter States
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchCourts().then(() => setRefreshing(false));
  }, []);


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchCourts = async (filters?: { searchText?: string; city?: string; district?: string; min?: number; max?: number; sort?: 'price_asc' | 'price_desc' | null }) => {
    try {
      setIsLoading(true);

      let rawData: LocationDTO[] = [];
      const query = filters?.searchText || searchText;

      // 1. Fetch Data (Always fetch all to support Name + Address search locally)
      // Since backend search API might be limited to address only for now
      rawData = await locationService.getAllLocations();

      // 2. Map to UI Model
      // Clean up base URL for images
      let baseUrl = BASE_URL;
      if (baseUrl.endsWith("/v1")) {
        baseUrl = baseUrl.replace(/\/v1$/, "");
      }

      let mapped: Court[] = rawData.map(loc => {
        let candidate = null;

        // 1. Try 'image' property
        if ((loc as any).image && typeof (loc as any).image === 'string' && (loc as any).image.trim() !== '') {
          candidate = (loc as any).image;
        }
        // 2. Try 'images' array property (fallback)
        else if ((loc as any).images && Array.isArray((loc as any).images) && (loc as any).images.length > 0) {
          const firstImg = (loc as any).images[0];
          if (typeof firstImg === 'string' && firstImg.trim() !== '') {
            candidate = firstImg;
          } else if (typeof firstImg === 'object' && firstImg.secureUrl) {
            // If backend returns object { secureUrl: "..." }
            candidate = firstImg.secureUrl;
          }
        }

        let imageUri = null;
        if (candidate) {
          if (candidate.startsWith('http')) {
            imageUri = candidate;
          } else {
            imageUri = `${baseUrl}/files/${candidate}`;
          }
        }

        return {
          id: loc.id,
          locationId: loc.id, // Ensure explicit locationId for CourtDetail usage
          name: loc.name,
          address: loc.address,
          rating: loc.rating || 5,
          pricePerHour: loc.pricePerHour,
          openTime: "06:00", // Default
          closeTime: "22:00", // Default
          image: imageUri ? { uri: imageUri } : { uri: null },
          phone: "0123456789",
          description: "Sân cầu lông chất lượng cao, thảm đạt chuẩn thi đấu, hệ thống ánh sáng hiện đại, không gian thoáng mát sạch sẽ.",
          status: loc.status
        }
      });

      // 3. Client-side Filter

      // Search Filter (Name or Address)
      if (query) {
        const q = query.toLowerCase();
        mapped = mapped.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
        );
      }

      const city = filters?.city || selectedCity;
      const district = filters?.district || selectedDistrict;
      const min = filters?.min !== undefined ? filters.min : (minPrice ? parseInt(minPrice) : undefined);
      const max = filters?.max !== undefined ? filters.max : (maxPrice ? parseInt(maxPrice) : undefined);

      if (city) {
        mapped = mapped.filter(c => c.address.toLowerCase().includes(city.toLowerCase()));
      }
      if (district) {
        mapped = mapped.filter(c => c.address.toLowerCase().includes(district.toLowerCase()));
      }
      if (min !== undefined && !isNaN(min)) {
        mapped = mapped.filter(c => c.pricePerHour >= min);
      }
      if (max !== undefined && !isNaN(max)) {
        mapped = mapped.filter(c => c.pricePerHour <= max);
      }

      // 4. Sort
      const sort = filters?.sort || sortBy;
      if (sort === 'price_asc') {
        mapped.sort((a, b) => a.pricePerHour - b.pricePerHour);
      } else if (sort === 'price_desc') {
        mapped.sort((a, b) => b.pricePerHour - a.pricePerHour);
      }

      setCourtsData(mapped);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch courts:", error);
      useNotificationStore.getState().showNotification("Không thể tải danh sách sân. Vui lòng thử lại sau.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      // Use local data for filter options as requested ("fake/noise data")
      const provs = VIETNAM_LOCATIONS.map(p => p.name);
      setProvinces(provs);
      fetchCourts(); // Initial fetch
    } catch (e) {
      console.error("Init Error:", e);
      useNotificationStore.getState().showNotification("Lỗi khởi tạo dữ liệu.", "error");
      fetchCourts();
    }
  }

  const handleApplyFilter = () => {
    const min = minPrice ? parseInt(minPrice) : undefined;
    const max = maxPrice ? parseInt(maxPrice) : undefined;

    fetchCourts({
      searchText,
      city: selectedCity,
      district: selectedDistrict,
      min,
      max,
      sort: sortBy
    });
    setFilterVisible(false);
  };

  const onSelectCity = async (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict('');

    // Find districts from local constant
    const selectedProv = VIETNAM_LOCATIONS.find(p => p.name === city);
    if (selectedProv) {
      setDistricts(selectedProv.districts);
    } else {
      setDistricts([]);
    }
  };


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
      <Header />
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Đặt sân cầu lông bạn muốn!</Text>
        <View style={styles.separator} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, địa chỉ..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => fetchCourts({ searchText, city: selectedCity, district: selectedDistrict, min: minPrice ? parseInt(minPrice) : undefined, max: maxPrice ? parseInt(maxPrice) : undefined, sort: sortBy })}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={24} color="#3B9AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCourtItem = ({ item }: { item: Court }) => (
    <CourtCard item={item} onPress={handleCourtPress} />
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Generate page numbers to show
    let pages: number[] = [];
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

        {/* Simplified logic for dots */}
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
            keyExtractor={(item, index) => item + index}
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
            setSortBy(null);
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

          {/* Sort Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionHeader}>Sắp xếp</Text>
            <View style={styles.keywordsContainer}>
              <TouchableOpacity
                style={[styles.keywordChip, sortBy === 'price_asc' && styles.keywordChipActive]}
                onPress={() => setSortBy(sortBy === 'price_asc' ? null : 'price_asc')}
              >
                <Text style={[styles.keywordText, sortBy === 'price_asc' && styles.keywordTextActive]}>Giá tăng dần</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.keywordChip, sortBy === 'price_desc' && styles.keywordChipActive]}
                onPress={() => setSortBy(sortBy === 'price_desc' ? null : 'price_desc')}
              >
                <Text style={[styles.keywordText, sortBy === 'price_desc' && styles.keywordTextActive]}>Giá giảm dần</Text>
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
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>

        {/* Location Pickers */}
        {renderLocationPicker(
          showCityPicker,
          "Chọn Tỉnh/Thành phố",
          provinces,
          onSelectCity,
          () => setShowCityPicker(false)
        )}

        {renderLocationPicker(
          showDistrictPicker,
          "Chọn Quận/Huyện",
          districts,
          (district) => setSelectedDistrict(district),
          () => setShowDistrictPicker(false)
        )}

      </SafeAreaView>
    </Modal>
  );

  const SKELETON_DATA: Court[] = Array(6).fill(0).map((_, i) => ({ id: -1 - i, name: '', address: '', rating: 0, pricePerHour: 0, image: null, isSkeleton: true } as unknown as Court));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={isLoading ? SKELETON_DATA : currentCourts}
        renderItem={renderCourtItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={!isLoading ? renderPagination : null}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B9AFF']} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', marginTop: 50, paddingHorizontal: 20 }}>
              <Ionicons name="search-outline" size={60} color="#ccc" />
              <Text style={{ marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center' }}>
                Không tìm thấy sân cầu lông nào phù hợp với bộ lọc của bạn.
              </Text>
            </View>
          ) : null
        }
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
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
  cardDisabled: {
    opacity: 0.9,
    backgroundColor: '#EEEEEE'
  },
  maintenanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  maintenanceText: {
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
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
  keywordChipActive: {
    backgroundColor: '#3B9AFF',
    borderColor: '#3B9AFF'
  },
  keywordTextActive: {
    color: '#fff'
  },

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
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
import { VIETNAM_LOCATIONS } from '../../../constants/VietnamLocation';
import { locationService } from '../../../services/locationService';
import { LocationDTO } from '../../../types/location';
import { BASE_URL } from '../../../services/axiosInstance';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { courtService } from '../../../services/courtService'; // Keep for Provinces/Districts options
import { Header } from '../../../components/Header';
import { styles } from './HomeScreen.styles';


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
import { getCourtImageSource } from '../../../utils/imageHelper';
import { Skeleton } from '../../../components/common/Skeleton';

const ITEMS_PER_PAGE = 6;



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
      console.log("raw data from fetch court", rawData);

      // 2. Map to UI Model
      // Clean up base URL for images
      let baseUrl = BASE_URL;
      if (baseUrl.endsWith("/v1")) {
        // API url for image not have v1
        baseUrl = baseUrl.replace(/\/v1$/, "");
        console.log("baseURL for image", baseUrl);
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


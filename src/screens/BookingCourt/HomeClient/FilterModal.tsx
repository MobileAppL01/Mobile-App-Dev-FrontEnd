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
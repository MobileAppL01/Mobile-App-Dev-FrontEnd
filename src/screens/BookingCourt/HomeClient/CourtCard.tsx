
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

const CourtCard = React.memo(
  ({ item, onPress }: { item: Court; onPress: (item: Court) => void }) => {
    if (item.isSkeleton) {
      return (
        <View style={[styles.cardContainer, { backgroundColor: "white" }]}>
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

    const [imageSource, setImageSource] = useState(
      getCourtImageSource(item.image?.uri)
    );
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

    const isMaintenance = item.status === "MAINTENANCE";

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
          <Text style={styles.courtName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.courtAddress} numberOfLines={2}>
            {item.address}
          </Text>
          <Text style={styles.courtTime}>
            <Text style={{ fontWeight: "bold" }}>
              {item.openTime?.substring(0, 5)}
            </Text>{" "}
            -{" "}
            <Text style={{ fontWeight: "bold" }}>
              {item.closeTime?.substring(0, 5)}
            </Text>
          </Text>

          <TouchableOpacity
            style={[
              styles.bookButton,
              isMaintenance && { backgroundColor: "#ccc" },
            ]}
            onPress={() => !isMaintenance && onPress(item)}
            disabled={isMaintenance}
          >
            <Text style={styles.bookButtonText}>
              {isMaintenance ? "Bảo trì" : "Đặt ngay"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
);

const renderCourtItem = ({ item }: { item: Court }) => (
  <CourtCard item={item} onPress={handleCourtPress} />
);

  const handleCourtPress = (court: Court) => {
    navigation.navigate('CourtDetail', { court });
  };

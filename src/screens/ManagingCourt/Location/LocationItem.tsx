import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "./ManageLocationScreen.styles"; // Import file style chung
import { manageCourtService } from "../../../services/manageCourtService"; // Import service để gọi API
import { useCourtStore } from "../../../store/useCourtStore";
import { useCallback, useEffect } from "react";
// Kích hoạt LayoutAnimation trên Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LocationItemProps {
  item: any;
  onPress: (item: any) => void;
  onLongPress: (item: any) => void;
  onDelete: (item: any) => void;
  onOpenPromo: (item: any) => void; // Hàm mở modal tạo mới KM
  refreshTrigger?: string | null; // <--- THÊM PROP NÀY
  onViewReviews?: (item: any) => void; // <--- THÊM PROP XEM ĐÁNH GIÁ (OPTIONAL ĐỂ TRÁNH LỖI NẾU CHƯA TRUYỀN)
}

const LocationItem: React.FC<LocationItemProps> = ({
  item,
  onPress,
  onLongPress,
  onDelete,
  onOpenPromo,
  refreshTrigger, // <--- Nhận prop
  onViewReviews, // <--- Nhận prop
}) => {
  const [expanded, setExpanded] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [loaded, setLoaded] = useState(false); // Đánh dấu đã tải dữ liệu chưa


  const fetchPromotions = useCallback(async () => {
    setLoadingPromo(true);
    try {
      const res = await manageCourtService.getPromotion(item.id);
      if (res && res.result) {
        setPromotions(res.result);
      }
      setLoaded(true);
    } catch (error) {
      console.log("Lỗi tải khuyến mãi");
    } finally {
      setLoadingPromo(false);
    }
  }, [item.id]);

  useEffect(() => {
    // Nếu refreshTrigger có chứa ID của item này -> Gọi lại API ngay lập tức
    if (refreshTrigger && refreshTrigger.includes(item.id)) {
      fetchPromotions();
      // Nếu đang đóng thì tự mở ra để user thấy kết quả (Optional)
      if (!expanded) setExpanded(true);
    }
  }, [refreshTrigger]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!expanded && !loaded) {
      fetchPromotions();
    }
    setExpanded(!expanded);
  };

  // Nút xóa khi vuốt sang trái
  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => onDelete(item)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={28} color="white" />
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 10 }}>
            Xóa
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };
  const { deletePromotion } = useCourtStore();
  const handleDeletePromotion = (promotionId: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa chương trình khuyến mãi này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive", // Màu đỏ trên iOS
          onPress: async () => {
            try {
              await deletePromotion(promotionId);
              setPromotions((prevList) =>
                prevList.filter((p) => p.id !== promotionId)
              );
              Alert.alert("Thành công", "Đã xóa khuyến mãi!");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa khuyến mãi lúc này.");
            }
          },
        },
      ]
    );
  };
  // Render từng dòng khuyến mãi
  const renderPromoItem = (promo: any) => (
    <View key={promo.id} style={styles.promoRow}>
      <View style={styles.promoLeftBorder} />
      <View style={{ flex: 1 }}>
        <Text style={styles.promoCode}>
          {promo.code}- {promo.id}
        </Text>
        <Text style={styles.promoDate}>
          {promo.startDate} - {promo.endDate}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.promoValue}>
          {promo.discountType === "PERCENT"
            ? `${promo.discountValue}%`
            : `${promo.discountValue}k`}
        </Text>
        <TouchableOpacity onPress={() => handleDeletePromotion(promo.id)}>
          <Ionicons
            name="trash-bin-outline"
            size={18}
            color="#FF4757"
            style={{ marginTop: 4 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      containerStyle={{ marginBottom: 15 }}
    >
      {/* Wrapper bao ngoài để tạo bóng đổ chung */}
      <View style={styles.cardContainerShadow}>
        {/* --- PHẦN CARD CHÍNH --- */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={onPress}
          onLongPress={() => onLongPress(item)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: item.image || "https://via.placeholder.com/150" }}
            style={styles.clusterImage}
          />

          <View style={styles.clusterContent}>
            <Text style={styles.clusterTitle}>{item.name}</Text>
            <Text style={styles.clusterAddress} numberOfLines={1}>
              <Ionicons name="location-outline" size={14} color="#666" />{" "}
              {item.address}
            </Text>
            <View style={styles.clusterInfoRow}>
              <View style={styles.infoTag}>
                <Text style={styles.infoTagText}>
                  {item.courtCount ?? (item.courts?.length || 0)} sân
                </Text>
              </View>
              <Text style={styles.timeText}>
                {item.openTime?.substring(0, 5)} -{" "}
                {item.closeTime?.substring(0, 5)}
              </Text>
            </View>
          </View>

          {/* Cột nút bấm bên phải */}
          <View style={styles.rightActionColumn}>
            {/* Nút thêm khuyến mãi (+ hình tròn) */}
            <TouchableOpacity onPress={() => onOpenPromo(item)}>
              <Ionicons name="add-circle" size={32} color="#3B9AFF" />
            </TouchableOpacity>

            {/* Nút Xem đánh giá (Ngôi sao) */}
            {onViewReviews && (
              <TouchableOpacity onPress={() => onViewReviews(item)} style={{ marginTop: 10 }}>
                <Ionicons name="star-half-outline" size={28} color="#F59E0B" />
              </TouchableOpacity>
            )}

            {/* Nút Mở rộng (Mũi tên V) */}
            <TouchableOpacity
              onPress={toggleExpand}
              style={{ padding: 5, marginTop: 10 }}
            >
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* --- PHẦN DROPDOWN (DANH SÁCH KM) --- */}
        {expanded && (
          <View style={styles.dropdownContainer}>
            {loadingPromo ? (
              <ActivityIndicator
                size="small"
                color="#3B9AFF"
                style={{ margin: 10 }}
              />
            ) : promotions.length > 0 ? (
              promotions.map((promo) => renderPromoItem(promo))
            ) : (
              <Text style={styles.emptyText}>
                Chưa có chương trình khuyến mãi nào
              </Text>
            )}
          </View>
        )}
      </View>
    </Swipeable>
  );
};

export default LocationItem;

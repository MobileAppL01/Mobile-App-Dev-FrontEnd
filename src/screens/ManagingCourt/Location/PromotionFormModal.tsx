import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./ManageLocationScreen.styles";

interface PromoFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  clusterName?: string; // Tên sân đang được chọn để hiển thị
}

const PromotionFormModal: React.FC<PromoFormProps> = ({
  visible,
  onClose,
  onSubmit,
  clusterName,
}) => {
  // State nội bộ
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("2026-01-05");
  const [endDate, setEndDate] = useState("2026-01-10");

  // Reset form khi đóng mở
  useEffect(() => {
    if (visible) {
      setCode("");
      setDiscountValue("");
      // Có thể set date default ở đây
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!code || !discountValue) {
      Alert.alert("Lỗi", "Vui lòng nhập Mã và Giá trị giảm");
      return;
    }
    onSubmit({
      code,
      discountValue: Number(discountValue),
      startDate,
      endDate,
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalKeyboardContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tạo Khuyến Mãi</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle" size={28} color="black" />
                </TouchableOpacity>
              </View>

              <Text style={{ marginBottom: 10, color: "#666" }}>
                Áp dụng cho:{" "}
                <Text style={{ fontWeight: "bold", color: "#3B9AFF" }}>
                  {clusterName || "..."}
                </Text>
              </Text>

              <ScrollView>
                <Text style={styles.label}>Mã Code</Text>
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="VD: TET2026"
                  autoCapitalize="characters"
                />

                <Text style={styles.label}>Giảm giá (%)</Text>
                <TextInput
                  style={styles.input}
                  value={discountValue}
                  onChangeText={setDiscountValue}
                  placeholder="VD: 20"
                  keyboardType="numeric"
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ width: "48%" }}>
                    <Text style={styles.label}>Bắt đầu</Text>
                    <TextInput
                      style={styles.input}
                      value={startDate}
                      onChangeText={setStartDate}
                    />
                  </View>
                  <View style={{ width: "48%" }}>
                    <Text style={styles.label}>Kết thúc</Text>
                    <TextInput
                      style={styles.input}
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                  <Text style={styles.saveBtnText}>Tạo Mã</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PromotionFormModal;

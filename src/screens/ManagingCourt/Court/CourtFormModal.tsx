import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./ManagerCourtScreen.styles"; // Import style

interface CourtFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  clusterName?: string;
  isLoading?: boolean;
}

const CourtFormModal: React.FC<CourtFormProps> = ({
  visible,
  onClose,
  onSubmit,
  clusterName,
  isLoading,
}) => {
  const [courtName, setCourtName] = useState("");

  // Reset form mỗi khi mở modal
  useEffect(() => {
    if (visible) {
      setCourtName("");
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!courtName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên sân");
      return;
    }
    onSubmit(courtName);
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
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thêm Sân Mới</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle" size={28} color="black" />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <View>
                <View>
                  <Text style={{ color: "#666", fontSize: 13 }}>
                    Đang thêm vào cơ sở:
                  </Text>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 15,
                      color: "#3B9AFF",
                    }}
                  >
                    {clusterName}
                  </Text>
                </View>

                <Text style={styles.label}>
                  Tên sân <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={courtName}
                  onChangeText={setCourtName}
                  placeholder="Ví dụ: Sân 3, Sân VIP..."
                  autoFocus={true}
                />

                <Text style={styles.label}>Trạng thái mặc định</Text>
                <View >
                  <Text style={{ color: "#2ecc71", fontWeight: "bold" }}>
                    ACTIVE
                  </Text>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.saveBtnText}>Lưu Sân</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CourtFormModal;
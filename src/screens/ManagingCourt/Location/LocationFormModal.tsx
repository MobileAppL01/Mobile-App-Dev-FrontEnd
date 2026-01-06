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
// Điều chỉnh đường dẫn import styles tùy vào cấu trúc thư mục của bạn
import { styles } from "./ManageLocationScreen.styles"; 

interface LocationFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any; // Dữ liệu cũ nếu là đang Sửa
}

const LocationFormModal: React.FC<LocationFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  // State nội bộ của Form
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [openTime, setOpenTime] = useState("05:00:00");
  const [closeTime, setCloseTime] = useState("22:00:00");

  // Mỗi khi mở modal (visible thay đổi) hoặc đổi item sửa (initialData thay đổi)
  // thì fill dữ liệu vào form
  useEffect(() => {
    if (visible) {
      if (initialData) {
        // Mode: EDIT
        setName(initialData.name);
        setAddress(initialData.address);
        setDescription(initialData.description || "");
        setPrice(initialData.pricePerHour ? initialData.pricePerHour.toString() : "");
        setOpenTime(initialData.openTime || "05:00:00");
        setCloseTime(initialData.closeTime || "22:00:00");
      } else {
        // Mode: ADD NEW -> Reset form
        setName("");
        setAddress("");
        setDescription("");
        setPrice("");
        setOpenTime("05:00:00");
        setCloseTime("22:00:00");
      }
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    // Validate cơ bản tại form
    if (!name || !address || !price) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên, Địa chỉ và Giá tiền");
      return;
    }
    
    // Gửi dữ liệu ra ngoài cho màn hình cha xử lý
    onSubmit({
      name,
      address,
      description,
      pricePerHour: Number(price),
      openTime,
      closeTime,
      image: "string", // Hoặc xử lý ảnh nếu có
      courts: initialData ? initialData.courts : [],
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
                <Text style={styles.modalTitle}>
                  {initialData ? "Chỉnh sửa Cụm Sân" : "Thêm Cụm Sân"}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close-circle" size={28} color="black" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>
                  Tên cơ sở <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ví dụ: Sân Long Thành"
                />

                <Text style={styles.label}>
                  Địa chỉ <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Ví dụ: Đồng Nai"
                />

                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />

                <Text style={styles.label}>
                  Giá tiền mỗi giờ <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ width: "48%" }}>
                    <Text style={styles.label}>Mở cửa</Text>
                    <TextInput
                      style={styles.input}
                      value={openTime}
                      onChangeText={setOpenTime}
                      placeholder="05:00:00"
                    />
                  </View>
                  <View style={{ width: "48%" }}>
                    <Text style={styles.label}>Đóng cửa</Text>
                    <TextInput
                      style={styles.input}
                      value={closeTime}
                      onChangeText={setCloseTime}
                      placeholder="22:00:00"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                  <Text style={styles.saveBtnText}>
                    {initialData ? "Cập Nhật" : "Lưu Thông Tin"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LocationFormModal;
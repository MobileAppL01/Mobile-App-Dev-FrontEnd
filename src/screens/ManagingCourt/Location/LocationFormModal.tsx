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
  Image,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { styles } from "./ManageLocationScreen.styles";
import { manageCourtService } from "../../../services/manageCourtService";

interface LocationFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const LocationFormModal: React.FC<LocationFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [openTime, setOpenTime] = useState("05:00:00");
  const [closeTime, setCloseTime] = useState("22:00:00");
  const [imageUri, setImageUri] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setName(initialData.name);
        setAddress(initialData.address);
        setDescription(initialData.description || "");
        setPrice(initialData.pricePerHour ? initialData.pricePerHour.toString() : "");
        setOpenTime(initialData.openTime || "05:00:00");
        setCloseTime(initialData.closeTime || "22:00:00");
        setImageUri(initialData.image || "");
      } else {
        setName("");
        setAddress("");
        setDescription("");
        setPrice("");
        setOpenTime("05:00:00");
        setCloseTime("22:00:00");
        setImageUri("");
      }
    }
  }, [visible, initialData]);

  const handlePickImage = async () => {
    try {
      // 1. Pick Image (Permissions handled automatically or implicitly)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedAsset = result.assets[0];
        // 3. Upload Immediately
        setUploading(true);
        try {
          const uploadRes = await manageCourtService.uploadFile(pickedAsset, 'location');
          if (uploadRes && uploadRes.url) {
            setImageUri(uploadRes.url); // Save the Cloudinary URL
            Alert.alert("Thành công", "Đã tải ảnh lên!");
          }
        } catch (error) {
          Alert.alert("Lỗi tải ảnh", "Không thể tải ảnh lên server.");
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.log('Pick image error', error);
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!name || !address || !price) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên, Địa chỉ và Giá tiền");
      return;
    }

    onSubmit({
      name,
      address,
      description,
      pricePerHour: Number(price),
      openTime,
      closeTime,
      image: imageUri || "string", // Provide URL or placeholder
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
                {/* --- Image Picker UI --- */}
                <Text style={styles.label}>Ảnh đại diện</Text>
                <TouchableOpacity onPress={handlePickImage} style={{
                  height: 150,
                  backgroundColor: '#f9f9f9', // Lighter background
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 15,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderStyle: 'dashed'
                }}>
                  {uploading ? (
                    <ActivityIndicator size="large" color="#3B9AFF" />
                  ) : imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="camera-outline" size={32} color="#888" />
                      <Text style={{ color: '#666', marginTop: 5 }}>Chạm để chọn ảnh</Text>
                    </View>
                  )}
                  {/* Badge 'Sửa' nếu đã có ảnh */}
                  {!uploading && imageUri && (
                    <View style={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 5 }}>
                      <Text style={{ color: 'white', fontSize: 10 }}>Thay đổi</Text>
                    </View>
                  )}
                </TouchableOpacity>

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

                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={uploading}>
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
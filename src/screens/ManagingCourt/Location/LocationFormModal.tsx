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
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { styles } from "./ManageLocationScreen.styles";
import { manageCourtService } from "../../../services/manageCourtService";
import { useNotificationStore } from "../../../store/useNotificationStore";

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

  const showNotification = useNotificationStore(state => state.showNotification);

  const handlePickImage = async () => {
    try {
      // 1. Pick Image (Permissions handled automatically or implicitly)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedAsset = result.assets[0];

        // Instant Preview
        const previousUri = imageUri;
        setImageUri(pickedAsset.uri);

        // 3. Upload in background (UI shows overlay)
        setUploading(true);
        try {
          const uploadRes = await manageCourtService.uploadFile(pickedAsset, 'location');
          if (uploadRes && uploadRes.url) {
            setImageUri(uploadRes.url); // Save the Cloudinary URL (Server URL)
            showNotification("Đã tải ảnh lên!", "success");
          }
        } catch (error: any) {
          // Revert if failed
          setImageUri(previousUri);
          console.error("Upload error:", error);
          // Service already throws user-friendly message for size errors
          const msg = error.message || "Không thể tải ảnh lên server";
          showNotification(msg, "error");
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.log('Pick image error', error);
      setUploading(false);
      showNotification("Có lỗi khi chọn ảnh", "error");
    }
  };

  const handleSubmit = () => {
    if (!name || !address || !price) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên, Địa chỉ và Giá tiền");
      return;
    }

    const submissionData = {
      name,
      address,
      description,
      pricePerHour: Number(price),
      openTime,
      closeTime,
      // Fix: Only send image if it's a valid URL or explicitly empty string (to clear)
      // Avoid sending "string" literal which breaks image loading
      image: (imageUri && imageUri !== "string") ? imageUri : null,
      courts: initialData ? initialData.courts : [],
    };

    console.log("Submitting Location Data:", submissionData);
    onSubmit(submissionData);
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
                  height: 180, // Increased height for better view
                  backgroundColor: '#f9f9f9',
                  borderRadius: 12, // Softer corners
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 15,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderStyle: imageUri ? 'solid' : 'dashed'
                }}>
                  {imageUri ? (
                    <>
                      <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      {uploading && (
                        <View style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <ActivityIndicator size="large" color="#ffffff" />
                        </View>
                      )}
                    </>
                  ) : (
                    uploading ? (
                      <ActivityIndicator size="large" color="#3B9AFF" />
                    ) : (
                      <View style={{ alignItems: 'center' }}>
                        <Ionicons name="camera-outline" size={40} color="#888" />
                        <Text style={{ color: '#666', marginTop: 8, fontWeight: '500' }}>Chạm để tải ảnh bìa</Text>
                        <Text style={{ color: '#999', fontSize: 10, marginTop: 4 }}>Tỉ lệ 16:9</Text>
                      </View>
                    )
                  )}

                  {/* Edit Badge */}
                  {!uploading && imageUri && (
                    <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="pencil" size={10} color="white" style={{ marginRight: 4 }} />
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>Sửa</Text>
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
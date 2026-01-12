import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    Alert,
    TextInput,
    ActivityIndicator,
    Modal
} from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import * as ImagePicker from 'expo-image-picker';
import { bookingService } from '../../services/bookingService';


// --- Component con InfoField (Đã cập nhật logic xử lý Date và Edit) ---
interface InfoFieldProps {
    label: string;
    value: string | number | Date | null | undefined;
    flex?: number;
    editable?: boolean;
    onChangeText?: (text: string) => void;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

const InfoField = ({ label, value, flex, editable, onChangeText, keyboardType = 'default' }: InfoFieldProps) => {
    const getDisplayValue = () => {
        if (value === null || value === undefined) return "";
        if (value instanceof Date) {
            return value.toLocaleDateString("vi-VN");
        }
        return String(value);
    };

    return (
        <View style={[styles.inputGroup, flex ? { flex } : undefined]}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, editable && styles.inputEditable]}>
                {editable ? (
                    <TextInput
                        style={[styles.inputText, { padding: 0 }]} // Reset padding for TextInput inside View
                        value={getDisplayValue()}
                        onChangeText={onChangeText}
                        keyboardType={keyboardType}
                    />
                ) : (
                    <Text style={styles.inputText}>{getDisplayValue()}</Text>
                )}
            </View>
        </View>
    );
};
// -----------------------------------------------------------

export default function UserProfileScreen() {
    const { user, logout, updateUser } = useAuthStore();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const showNotification = useNotificationStore(state => state.showNotification);

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        avatar: ""
    });

    const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
                avatar: user.avatar || ""
            });
        }
    }, [user]);

    const [bookingCount, setBookingCount] = useState(0);

    const isPlayer = user?.role === 'PLAYER' || user?.role === 'ROLE_PLAYER';

    useEffect(() => {
        if (!isPlayer) return;

        const fetchStats = async () => {
            try {
                const bookings = await bookingService.getMyBookings();
                if (bookings && Array.isArray(bookings)) {
                    setBookingCount(bookings.length);
                }
            } catch (error) {
                console.log("Error fetching booking stats", error);
                showNotification("Không thể tải thông tin thống kê", "error");
            }
        };
        fetchStats();
    }, [isPlayer]);

    const displayUser = {
        name: user?.fullName || "Người dùng",
        email: user?.email || "",
        avatar: (user?.avatar && user.avatar.trim() !== "") ? user.avatar : "https://i.pravatar.cc/300",
        phone: user?.phone || "",
        // Backend not supporting gender/dob yet
        bookings: bookingCount,
        points: 0 // Points system not yet implemented
    };

    const pickImage = async () => {
        if (!isEditing) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const pickedAsset = result.assets[0];

                // 1. Instant Preview (Optimistic Update)
                const previousAvatar = formData.avatar;
                setFormData(prev => ({ ...prev, avatar: pickedAsset.uri }));

                setIsLoading(true);
                try {
                    const response = await authService.uploadAvatar(pickedAsset);
                    if (response.url) {
                        // 2. Update with real server URL after success
                        const newAvatarUrl = response.url;
                        setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));

                        // Auto-save the profile to persist the new avatar immediately
                        await authService.updateProfile({
                            ...formData,
                            avatar: newAvatarUrl
                        });

                        updateUser({ ...user, avatar: newAvatarUrl });
                        showNotification("Cập nhật ảnh đại diện thành công", "success");
                    }
                } catch (error) {
                    // 3. Revert if failed
                    setFormData(prev => ({ ...prev, avatar: previousAvatar }));
                    showNotification("Không thể tải ảnh lên", "error");
                } finally {
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.log("Image picker error", error);
            showNotification("Lỗi chọn ảnh", "error");
        }
    };

    const handleSave = async () => {
        if (!formData.fullName.trim()) {
            showNotification("Tên không được để trống", "warning");
            return;
        }

        setIsLoading(true);
        try {
            const updatePayload = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                avatar: formData.avatar // Added avatar field
            };

            await authService.updateProfile(updatePayload);

            // Update local store
            updateUser({
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                avatar: formData.avatar
            });

            showNotification("Cập nhật hồ sơ thành công", "success");
            setIsEditing(false);

        } catch (error: any) {
            console.error(error);
            showNotification(error.response?.data?.message || "Không thể cập nhật hồ sơ", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
                avatar: user.avatar || ""
            });
        }
        setIsEditing(false);
    };

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                onPress: () => {
                    logout();
                    showNotification("Đăng xuất thành công", "success");
                    setTimeout(() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'PreLogin' }],
                        });
                    }, 250);
                },
                style: "destructive"
            }
        ]);
    };

    const handleSubmitChangePassword = async () => {
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            showNotification("Vui lòng điền đầy đủ thông tin", "warning");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showNotification("Mật khẩu mới không khớp", "warning");
            return;
        }

        setLoadingPassword(true);
        try {
            await authService.changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            });
            showNotification("Đổi mật khẩu thành công!", "success");
            setIsChangePasswordVisible(false);
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error(error);
            showNotification(error.response?.data?.message || error.response?.data || "Đổi mật khẩu thất bại", "error");
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#42A5F5" />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* --- HEADER --- */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={pickImage} disabled={!isEditing}>
                            <View style={{ position: 'relative' }}>
                                <Image source={{ uri: isEditing && formData.avatar ? formData.avatar : displayUser.avatar }} style={styles.avatar} />
                                {isEditing && (
                                    <View style={{
                                        position: 'absolute',
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'white',
                                        borderRadius: 15,
                                        padding: 6,
                                        borderWidth: 1,
                                        borderColor: '#eee',
                                        elevation: 2
                                    }}>
                                        <Ionicons name="camera" size={18} color="#333" />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        <View style={styles.headerInfo}>
                            <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
                            {/* Phone removed as per previous user edit */}
                            <View style={styles.vipBadge}>
                                <Text style={styles.vipText}>
                                    {(user?.role === 'ROLE_OWNER' || user?.role === 'OWNER') ? "Chủ sân" : "Thành viên vip"}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('AboutUs' as any)}
                            style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}
                        >
                            <Ionicons name="information-circle-outline" size={28} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- BODY CONTENT --- */}
                <View style={styles.bodyContent}>

                    {/* --- STATS CARD (Only for Players) --- */}
                    {isPlayer && (
                        <View style={styles.statsCard}>
                            <View style={styles.statItem}>
                                <View style={[styles.iconCircle, { backgroundColor: "#E3F2FD" }]}>
                                    <Ionicons name="trophy" size={24} color="#2196F3" />
                                </View>
                                <View>
                                    <Text style={styles.statLabel}>Tổng số lần đặt</Text>
                                    <Text style={styles.statValue}>{displayUser.bookings}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.statItem}>
                                <View style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}>
                                    <MaterialCommunityIcons name="medal-outline" size={24} color="#FF9800" />
                                </View>
                                <View>
                                    <Text style={styles.statLabel}>Điểm tích lũy</Text>
                                    <Text style={styles.statValue}>{displayUser.points}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* --- FORM INFO --- */}
                    <View style={styles.formCard}>
                        <InfoField
                            label="Họ và tên"
                            value={isEditing ? formData.fullName : displayUser.name}
                            editable={isEditing}
                            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                        />
                        <InfoField
                            label="Email"
                            value={isEditing ? formData.email : displayUser.email}
                            editable={isEditing}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                        />
                        <InfoField
                            label="Số điện thoại"
                            value={isEditing ? formData.phone : displayUser.phone}
                            editable={isEditing}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            keyboardType="phone-pad"
                        />

                        {/* Backend User Entity does not support Gender/DOB yet. Hiding for now to avoid hardcoding.
                        <View style={styles.row}>
                            <InfoField label="Giới tính" value={displayUser.gender} flex={0.45} />
                            <View style={{ width: 15 }} />
                            <InfoField label="Ngày sinh" value={displayUser.dob} flex={0.55} />
                        </View> 
                        */}
                    </View>

                    {/* --- ACTIONS --- */}
                    {isEditing ? (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={handleCancel}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Lưu</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => setIsEditing(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.editButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#64B5F6', marginTop: -10 }]}
                                onPress={() => setIsChangePasswordVisible(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.editButtonText, { color: '#64B5F6' }]}>Đổi mật khẩu</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* --- CHANGE PASSWORD MODAL --- */}
            <Modal
                visible={isChangePasswordVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsChangePasswordVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mật khẩu cũ</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={passwordForm.oldPassword}
                                onChangeText={(t) => setPasswordForm({ ...passwordForm, oldPassword: t })}
                                secureTextEntry
                                placeholder="Nhập mật khẩu cũ"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mật khẩu mới</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={passwordForm.newPassword}
                                onChangeText={(t) => setPasswordForm({ ...passwordForm, newPassword: t })}
                                secureTextEntry
                                placeholder="Nhập mật khẩu mới"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={passwordForm.confirmPassword}
                                onChangeText={(t) => setPasswordForm({ ...passwordForm, confirmPassword: t })}
                                secureTextEntry
                                placeholder="Nhập lại mật khẩu mới"
                            />
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => {
                                    setIsChangePasswordVisible(false);
                                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                disabled={loadingPassword}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={handleSubmitChangePassword}
                                disabled={loadingPassword}
                            >
                                {loadingPassword ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    // HEADER Styles
    header: {
        backgroundColor: "#42A5F5",
        height: 200,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingTop: 60,
        paddingHorizontal: 20,
        zIndex: 1,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "white",
        marginRight: 15,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 5,
    },
    headerName: {
        color: "rgba(255,255,255,0.95)",
        fontSize: 14,
        fontWeight: '600'
    },
    vipBadge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 8,
        borderRadius: 15,
        alignSelf: "flex-start",
    },
    vipText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },

    // BODY Styles
    bodyContent: {
        paddingHorizontal: 20,
    },

    // STATS CARD Styles
    statsCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        marginTop: -40,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 24,
        zIndex: 10,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
    },
    statValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    divider: {
        width: 1,
        height: "70%",
        backgroundColor: "#EEE",
        marginHorizontal: 10,
    },

    // FORM Styles
    formCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    inputGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    label: {
        fontSize: 14,
        color: "#333",
        fontWeight: "600",
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: "#E0E0E0",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    inputEditable: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    inputText: {
        color: "#333",
        fontSize: 15,
        fontWeight: "500",
    },

    // BUTTONS Styles
    editButton: {
        backgroundColor: "#64B5F6",
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#64B5F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    editButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },

    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 15
    },
    actionButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    saveButton: {
        backgroundColor: "#64B5F6",
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600"
    },

    logoutButton: {
        backgroundColor: "white",
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FF5252", // Red for danger/logout
        marginBottom: 30,
    },
    logoutText: {
        color: "#FF5252",
        fontSize: 16,
        fontWeight: "bold",
    },

    // MODAL Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333'
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
    }
});
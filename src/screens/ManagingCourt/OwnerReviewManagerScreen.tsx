import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    LayoutAnimation,
    Platform,
    UIManager,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { reviewService, UIReview, ReviewStats, UIReply } from '../../services/reviewService';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getAvatarSource } from '../../utils/imageHelper';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function OwnerReviewManagerScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { locationId, locationName } = (route.params as any) || {};
    const { showNotification } = useNotificationStore();
    const user = useAuthStore(state => state.user);

    // State
    const [reviews, setReviews] = useState<UIReview[]>([]);
    const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0, counts: {} } as any);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('Tất cả');

    // Mock Hidden Reviews (In real app, backend should handle this)
    const [hiddenReviewIds, setHiddenReviewIds] = useState<string[]>([]);

    // Modals
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);

    // Action State
    const [selectedReview, setSelectedReview] = useState<UIReview | null>(null);
    const [replyText, setReplyText] = useState('');
    const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

    const [reportNote, setReportNote] = useState('');
    const [reportReasons, setReportReasons] = useState({
        spam: false,
        abusive: false,
        irrelevant: false,
        privacy: false
    });

    useEffect(() => {
        loadData();
    }, [locationId]);

    const loadData = async () => {
        if (!locationId) return;
        setLoading(true);
        try {
            const [fetchedReviews, fetchedStats] = await Promise.all([
                reviewService.getLocationReviews(locationId, 0, 100), // Get more for management
                reviewService.getLocationStats(locationId)
            ]);
            // Sort reviews by id desc (newest first assuming ID increment)
            const sorted = fetchedReviews.sort((a, b) => Number(b.id) - Number(a.id));
            setReviews(sorted);
            setStats(fetchedStats);
        } catch (error) {
            console.error(error);
            showNotification("Có lỗi khi tải đánh giá", "error");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Filter Logic
    const getFilteredReviews = () => {
        let filtered = reviews;

        // Base filter by visibility first (except for HIDDEN tab)
        if (filter === 'Đã ẩn') {
            return reviews.filter(r => hiddenReviewIds.includes(r.id));
        } else {
            filtered = reviews.filter(r => !hiddenReviewIds.includes(r.id));
        }

        switch (filter) {
            case 'Chưa phản hồi':
                return filtered.filter(r => r.replies.length === 0);
            case 'Đã phản hồi':
                return filtered.filter(r => r.replies.length > 0);
            case '5 sao':
                return filtered.filter(r => r.rating === 5);
            case 'Tất cả':
            default:
                return filtered;
        }
    };

    const handleReplyPress = (review: UIReview) => {
        setSelectedReview(review);
        setEditingReplyId(null);
        setReplyText('');
        setReplyModalVisible(true);
    };

    const handleEditReply = (reply: UIReply, review: UIReview) => {
        setSelectedReview(review);
        setReplyText(reply.comment);
        setEditingReplyId(reply.id);
        setReplyModalVisible(true);
    };

    const handleReportPress = (review: UIReview) => {
        setSelectedReview(review);
        setReportModalVisible(true);
        setReportReasons({ spam: false, abusive: false, irrelevant: false, privacy: false });
        setReportNote('');
    };

    const handleConfirmReply = async () => {
        if (!replyText.trim() || !selectedReview) return;

        try {
            if (editingReplyId) {
                // EDIT
                const updatedReply = await reviewService.updateComment(Number(editingReplyId), replyText);

                // Update Local UI
                const updatedReviews = reviews.map(r => {
                    if (r.id === selectedReview.id) {
                        const updatedReplies = r.replies.map(rp =>
                            rp.id === editingReplyId
                                ? { ...updatedReply, userId: user?.id || rp.userId, user: { ...updatedReply.user, isOwner: true } }
                                : rp
                        );
                        return { ...r, replies: updatedReplies };
                    }
                    return r;
                });
                setReviews(updatedReviews);
                showNotification("Cập nhật phản hồi thành công", "success");

            } else {
                // CREATE
                const newReply = await reviewService.createComment(Number(selectedReview.id), replyText);

                // Optimistic update
                const updatedReview = {
                    ...selectedReview,
                    // Ensure we mark it as Owner locally for UI feedback immediately
                    replies: [...selectedReview.replies, { ...newReply, userId: user?.id || newReply.userId, user: { ...newReply.user, isOwner: true } }]
                };

                setReviews(reviews.map(r => r.id === selectedReview.id ? updatedReview : r));
                showNotification("Đã trả lời đánh giá", "success");
            }

            setReplyModalVisible(false);
            setEditingReplyId(null);
            setReplyText('');
        } catch (error) {
            console.error(error);
            showNotification(editingReplyId ? "Cập nhật thất bại" : "Gửi câu trả lời thất bại", "error");
        }
    };

    const handleConfirmReport = () => {
        if (!selectedReview) return;
        // Mocking hide/report
        setHiddenReviewIds([...hiddenReviewIds, selectedReview.id]);
        setReportModalVisible(false);
        showNotification("Đã ẩn đánh giá khỏi trang công khai", "success");
    };

    const handleRestoreReview = (review: UIReview) => {
        setHiddenReviewIds(hiddenReviewIds.filter(id => id !== review.id));
        showNotification("Đã khôi phục đánh giá", "success");
    };

    const handleVote = (id: string, isReply = false) => {
        // Mock vote
        const updateLike = (item: any) => {
            if (item.isLiked) {
                return { ...item, likes: item.likes - 1, isLiked: false };
            } else {
                return { ...item, likes: item.likes + 1, isLiked: true };
            }
        };

        const updatedReviews = reviews.map(review => {
            if (!isReply && review.id === id) {
                return updateLike(review);
            }
            if (review.replies) {
                const updatedReplies = review.replies.map(r =>
                    (isReply && r.id === id) ? updateLike(r) : r
                );
                return { ...review, replies: updatedReplies };
            }
            return review;
        });

        setReviews(updatedReviews);
    };

    const handleDeleteReply = (reviewId: string, replyId: string) => {
        Alert.alert("Xóa phản hồi", "Bạn có chắc muốn xóa phản hồi này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try {
                        await reviewService.deleteComment(Number(replyId));
                        // Update local state
                        const updatedReviews = reviews.map(r => {
                            if (r.id === reviewId) {
                                return { ...r, replies: r.replies.filter(rp => rp.id !== replyId) };
                            }
                            return r;
                        });
                        setReviews(updatedReviews);
                        showNotification("Đã xóa phản hồi", "success");
                    } catch (error) {
                        showNotification("Xóa phản hồi thất bại", "error");
                    }
                }
            }
        ]);
    };

    // Format Date (Simple relative time or absolute)
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHrs = diffMs / (1000 * 60 * 60);

            // Options for VN time
            const vnOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Ho_Chi_Minh' };

            if (diffHrs < 24 && diffHrs >= 0) {
                return date.toLocaleTimeString('vi-VN', { ...vnOptions, hour: '2-digit', minute: '2-digit' });
            } else if (diffHrs < 48 && diffHrs >= 0) {
                return "Hôm qua";
            }
            return date.toLocaleDateString('vi-VN', vnOptions);
        } catch (e) {
            return dateString;
        }
    };

    const renderRatingBar = (star: number, count: number, total: number) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
            <View style={styles.ratingBarRow} key={star}>
                <View style={styles.sStarCol}>
                    <Text style={styles.sStarText}>{star}</Text>
                    <Ionicons name="star" size={10} color="#FFD700" />
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.countText}>{count}</Text>
            </View>
        )
    };

    const renderReplyItem = (reply: UIReply, reviewId: string) => {
        const isMyReply = reply.userId === user?.id; // Check ownership by ID
        const activeReview = reviews.find(r => r.id === reviewId);

        const renderRightActions = () => {
            return (
                <View style={{ flexDirection: 'row', width: isMyReply ? 140 : 70, height: '100%', marginBottom: 8, marginLeft: 8 }}>
                    {isMyReply && (
                        <TouchableOpacity
                            style={[styles.swipeAction, { backgroundColor: '#3B9AFF' }]}
                            onPress={() => activeReview && handleEditReply(reply, activeReview)}
                        >
                            <Ionicons name="pencil" size={24} color="#fff" />
                            <Text style={styles.swipeActionText}>Sửa</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.swipeAction, { backgroundColor: '#FF4757' }]}
                        onPress={() => handleDeleteReply(reviewId, reply.id)}
                    >
                        <Ionicons name="trash" size={24} color="#fff" />
                        <Text style={styles.swipeActionText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            );
        };

        return (
            <Swipeable renderRightActions={renderRightActions} key={reply.id}>
                <View style={[styles.replyContainer, (isMyReply || reply.user.isOwner) && styles.replyContainerOwner]}>
                    <View style={styles.reviewHeader}>
                        <Image source={getAvatarSource(reply.user.avatar)} style={styles.avatarSmall} />
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.userName}>{reply.user.name}</Text>
                                {(isMyReply || reply.user.isOwner) && <View style={styles.ownerBadge}><Text style={styles.ownerText}>Chủ sân</Text></View>}
                            </View>
                            <Text style={styles.dateText}>{formatDate(reply.date)}</Text>
                        </View>
                    </View>
                    <Text style={styles.commentContent}>{reply.comment}</Text>
                    <View style={styles.actionRow}>
                        {/* Removed Like Button */}
                    </View>
                </View>
            </Swipeable>
        );
    };

    const renderReviewItem = ({ item }: { item: UIReview }) => (
        <View style={styles.reviewItem}>
            {/* Header: User Info */}
            <View style={styles.reviewHeader}>
                <Image source={getAvatarSource(item.user.avatar)} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user.name}</Text>
                    <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <Ionicons key={s} name="star" size={12} color={s <= item.rating ? "#FFD700" : "#ddd"} />
                        ))}
                        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            <Text style={styles.commentContent}>{item.comment}</Text>
            {item.images && item.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
                    {item.images.map((img, idx) => (
                        <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
                    ))}
                </ScrollView>
            )}

            {/* Action Buttons for Review Item */}
            <View style={styles.actionRow}>
                {filter === 'Đã ẩn' ? (
                    <TouchableOpacity style={styles.btnActionSecondary} onPress={() => handleRestoreReview(item)}>
                        <Ionicons name="refresh" size={14} color="#333" />
                        <Text style={styles.btnActionTextSecondary}>Khôi phục</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#FF4757' }]} onPress={() => handleReportPress(item)}>
                            <Ionicons name="warning" size={14} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>Tố cáo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.btnActionSecondary}
                            onPress={() => {
                                if (item.replies.length > 0) {
                                    // Toggle replies
                                    const updated = reviews.map(r => r.id === item.id ? { ...r, showReplies: !r.showReplies } : r);
                                    setReviews(updated);
                                } else {
                                    // Reply
                                    handleReplyPress(item);
                                }
                            }}
                        >
                            <Ionicons name={item.replies.length > 0 ? (item.showReplies ? "chevron-up" : "chevron-down") : "chatbox-ellipses"} size={14} color="#333" />
                            <Text style={styles.btnActionTextSecondary}>
                                {item.replies.length > 0
                                    ? (item.showReplies ? "Ẩn câu trả lời" : `Xem câu trả lời (${item.replies.length})`)
                                    : "Trả lời"}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Replies Logic */}
            {item.showReplies && item.replies.length > 0 && (
                <View style={styles.repliesSection}>
                    {item.replies.map(r => renderReplyItem(r, item.id))}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{locationName || 'Sân cầu lông'} - Quản lý đánh giá</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Stats Box */}
                <View style={styles.summaryContainer}>
                    <View style={styles.bigRating}>
                        <Text style={styles.bigScore}>{stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            {[1, 2, 3, 4, 5].map(s => <Ionicons key={s} name="star" size={14} color="#FFD700" />)}
                        </View>
                        <Text style={styles.totalReviews}>{stats.totalReviews} đánh giá</Text>
                    </View>
                    <View style={styles.barsColumn}>
                        {[5, 4, 3, 2, 1].map(star => renderRatingBar(star, stats.counts ? (stats.counts[star] || 0) : 0, stats.totalReviews))}
                    </View>
                </View>

                {/* Filters Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    {['Tất cả', 'Chưa phản hồi', 'Đã phản hồi', 'Đã ẩn', '5 sao'].map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filter === f && styles.filterChipActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* List */}
                <View style={styles.listContainer}>
                    {getFilteredReviews().length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#999' }}>Không có đánh giá nào</Text>
                        </View>
                    ) : (
                        getFilteredReviews().map(item => (
                            <View key={item.id}>
                                {renderReviewItem({ item })}
                                <View style={styles.divider} />
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Modal Report */}
            <Modal
                visible={reportModalVisible}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="warning" size={24} color="#FF4757" style={{ marginRight: 8 }} />
                            <Text style={styles.modalTitle}>Báo cáo vi phạm</Text>
                        </View>
                        <Text style={styles.modalSubtitle}>Ẩn đánh giá này khỏi trang công khai?</Text>

                        {selectedReview && (
                            <View style={styles.previewBox}>
                                <Text style={styles.previewName}>{selectedReview.user.name}</Text>
                                <Text style={styles.previewContent} numberOfLines={2}>{selectedReview.comment}</Text>
                            </View>
                        )}

                        <Text style={styles.label}>Vui lòng chọn lý do:</Text>

                        <TouchableOpacity style={styles.checkboxRow} onPress={() => setReportReasons({ ...reportReasons, spam: !reportReasons.spam })}>
                            <Ionicons name={reportReasons.spam ? "checkbox" : "square-outline"} size={20} color="#333" />
                            <Text style={styles.checkboxLabel}>Spam hoặc quảng cáo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxRow} onPress={() => setReportReasons({ ...reportReasons, abusive: !reportReasons.abusive })}>
                            <Ionicons name={reportReasons.abusive ? "checkbox" : "square-outline"} size={20} color="#333" />
                            <Text style={styles.checkboxLabel}>Ngôn từ lăng mạ, xúc phạm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxRow} onPress={() => setReportReasons({ ...reportReasons, irrelevant: !reportReasons.irrelevant })}>
                            <Ionicons name={reportReasons.irrelevant ? "checkbox" : "square-outline"} size={20} color="#333" />
                            <Text style={styles.checkboxLabel}>Không liên quan đến sản phẩm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxRow} onPress={() => setReportReasons({ ...reportReasons, privacy: !reportReasons.privacy })}>
                            <Ionicons name={reportReasons.privacy ? "checkbox" : "square-outline"} size={20} color="#333" />
                            <Text style={styles.checkboxLabel}>Tiết lộ thông tin cá nhân</Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>Ghi chú nội bộ (chỉ bạn thấy):</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ví dụ: Người dùng cứ liên tục spam..."
                            value={reportNote}
                            onChangeText={setReportNote}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setReportModalVisible(false)}>
                                <Text style={styles.modalBtnTextCancel}>Quay lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleConfirmReport}>
                                <Text style={styles.modalBtnTextConfirm}>Xác nhận ẩn</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Reply */}
            <Modal
                visible={replyModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingReplyId ? "Chỉnh sửa phản hồi" : "Trả lời đánh giá"}</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            multiline
                            placeholder="Nhập câu trả lời của bạn..."
                            value={replyText}
                            onChangeText={setReplyText}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setReplyModalVisible(false)}>
                                <Text style={styles.modalBtnTextCancel}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtnConfirm, { backgroundColor: '#3B9AFF' }]} onPress={handleConfirmReply}>
                                <Text style={styles.modalBtnTextConfirm}>{editingReplyId ? "Cập nhật" : "Gửi"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    backButton: { padding: 4 },
    summaryContainer: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
    bigRating: { alignItems: 'center', justifyContent: 'center', width: 100, marginRight: 16 },
    bigScore: { fontSize: 48, fontWeight: 'bold', color: '#333' },
    totalReviews: { fontSize: 12, color: '#666', marginTop: 4 },
    barsColumn: { flex: 1 },
    ratingBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    sStarCol: { flexDirection: 'row', width: 30, alignItems: 'center' },
    sStarText: { fontSize: 12, color: '#666', marginRight: 2 },
    progressBarContainer: { flex: 1, height: 6, backgroundColor: '#eee', borderRadius: 3, marginHorizontal: 8, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#FBC02D' },
    countText: { fontSize: 12, color: '#666', width: 20, textAlign: 'right' },

    // Tabs
    tabsContainer: { flexDirection: 'row', padding: 10, justifyContent: 'center', backgroundColor: '#f9f9f9' },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e0e0e0', marginHorizontal: 4 },
    activeTab: { backgroundColor: '#3B9AFF' },
    tabText: { fontSize: 13, color: '#666', fontWeight: '500' },
    activeTabText: { color: '#fff', fontWeight: 'bold' },

    // List
    listContainer: { paddingBottom: 40 },
    divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 16 },
    reviewItem: { padding: 16 },
    reviewHeader: { flexDirection: 'row', marginBottom: 8 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    avatarSmall: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
    userInfo: { justifyContent: 'center' },
    userName: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    dateText: { fontSize: 12, color: '#999', marginLeft: 8 },
    commentContent: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 8 },
    reviewImages: { flexDirection: 'row', marginBottom: 10 },
    reviewImage: { width: 100, height: 80, borderRadius: 4, marginRight: 8, resizeMode: 'cover' },


    // Actions
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    btnAction: { flexDirection: 'row', backgroundColor: '#ddd', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center', marginLeft: 8, minWidth: 50 },
    btnActionActive: { backgroundColor: '#3B9AFF' },
    btnActionSecondary: { flexDirection: 'row', backgroundColor: '#eee', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center', marginLeft: 8 },
    btnActionText: { color: '#333', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
    btnActionTextSecondary: { color: '#333', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },

    // Replies
    repliesSection: { marginTop: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#eee' },
    replyContainer: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee'
    },
    replyContainerOwner: {
        backgroundColor: '#F0F8FF' // Light AliceBlue for owner
    },
    ownerBadge: {
        backgroundColor: '#3B9AFF',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 6
    },
    ownerText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'center' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    modalSubtitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
    previewBox: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 16 },
    previewName: { fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
    previewContent: { fontSize: 13, color: '#555', fontStyle: 'italic' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 10 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 10 },
    checkboxLabel: { marginLeft: 8, fontSize: 14, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, backgroundColor: '#fff', marginBottom: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    modalBtnCancel: { flex: 1, paddingVertical: 12, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
    modalBtnConfirm: { flex: 1, paddingVertical: 12, backgroundColor: '#FF4757', borderRadius: 8, alignItems: 'center' },
    modalBtnTextCancel: { fontWeight: 'bold', color: '#333' },
    modalBtnTextConfirm: { fontWeight: 'bold', color: '#fff' },

    // Filter Chips
    filterContainer: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row' },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f0f0f0', borderRadius: 20, marginRight: 8 },
    filterChipActive: { backgroundColor: '#3B9AFF' },
    filterText: { fontSize: 13, color: '#666' },
    filterTextActive: { color: '#fff', fontWeight: 'bold' },

    // Swipe Action
    swipeAction: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        borderRadius: 8,
        marginHorizontal: 1
    },
    swipeActionText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2
    }
});

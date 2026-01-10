import React, { useState, useEffect, useRef } from 'react';
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
    Animated,
    RefreshControl,
    KeyboardAvoidingView
} from 'react-native';
import { getAvatarSource } from '../../utils/imageHelper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { reviewService, UIReview, ReviewStats, UIReply } from '../../services/reviewService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../store/useNotificationStore';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/useAuthStore';
import { Swipeable } from 'react-native-gesture-handler';
import { Skeleton } from '../../components/common/Skeleton';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function ReviewScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { locationId } = (route.params as any) || {};
    const { user } = useAuthStore();
    const { showNotification } = useNotificationStore();

    // Data State
    const [reviews, setReviews] = useState<UIReview[]>([]);
    const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0, counts: {} } as any);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('Đề xuất');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // Edit/Reply Context
    const [editTarget, setEditTarget] = useState<{ type: 'REVIEW' | 'COMMENT', id: string } | null>(null);
    const [replyTarget, setReplyTarget] = useState<{ reviewId: string, parentCommentId?: string } | null>(null);

    // Refs for Swipeables to close them
    const swipeableRefs = useRef(new Map()).current;

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadData().then(() => setRefreshing(false));
    }, [locationId]);

    useEffect(() => {
        loadData();
    }, [locationId]);

    const loadData = async () => {
        if (!locationId) return;
        setLoading(true);
        try {
            const [fetchedReviews, fetchedStats] = await Promise.all([
                reviewService.getLocationReviews(locationId),
                reviewService.getLocationStats(locationId)
            ]);
            const sortedReviews = fetchedReviews.sort((a, b) => Number(b.id) - Number(a.id));
            setReviews(sortedReviews);
            setStats(fetchedStats);
        } catch (error) {
            console.error(error);
            showNotification("Có lỗi khi tải đánh giá", "error");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
            selectionLimit: 3
        });

        if (!result.canceled) {
            const uris = result.assets.map(asset => asset.uri);
            setSelectedImages([...selectedImages, ...uris]);
        }
    };

    const handleVote = (id: string, isReply = false) => {
        // Optimistic UI update
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

    const toggleReplies = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setReviews(reviews.map(r => r.id === id ? { ...r, showReplies: !r.showReplies } : r));
    }

    // --- Action Handlers ---

    const openCreateReview = () => {
        setMyRating(0);
        setMyComment('');
        setSelectedImages([]);
        setEditTarget(null);
        setReplyTarget(null);
        setModalVisible(true);
    };

    const openReply = (reviewId: string, parentCommentId?: string) => {
        setMyRating(0); // Rating irrelevant for reply
        setMyComment('');
        setSelectedImages([]);
        setEditTarget(null);
        setReplyTarget({ reviewId, parentCommentId });
        setModalVisible(true);
    };

    const openEdit = (type: 'REVIEW' | 'COMMENT', item: UIReview | UIReply, existingRating: number = 0) => {
        setMyRating(existingRating);
        setMyComment(item.comment);
        // Images: item.images if Review.
        setSelectedImages((item as any).images || []);
        setEditTarget({ type, id: item.id });
        setReplyTarget(null);
        setModalVisible(true);
    };

    const handleDelete = (type: 'REVIEW' | 'COMMENT', id: string) => {
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc muốn xóa ${type === 'REVIEW' ? 'đánh giá' : 'bình luận'} này?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa", style: "destructive", onPress: async () => {
                        try {
                            if (type === 'REVIEW') {
                                await reviewService.deleteReview(Number(id));
                                showNotification("Đã xóa đánh giá!", "success");
                            } else {
                                await reviewService.deleteComment(Number(id));
                                showNotification("Đã xóa bình luận!", "success");
                            }
                            loadData();
                        } catch (e) {
                            showNotification("Xóa thất bại", "error");
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        console.log("Submitting with target:", editTarget, replyTarget, "Content:", myComment);
        if (!myComment.trim() && !editTarget) {
            showNotification("Vui lòng nhập nội dung!", "error");
            return;
        }

        try {
            if (editTarget) {
                // EDIT MODE
                if (editTarget.type === 'REVIEW') {
                    // Update content
                    await reviewService.updateReview(Number(editTarget.id), myRating, myComment);

                    // Handle Images if changed? 
                    // Current implementation of updateReview doesn't handle images.
                    // If we want to update images, we usually delete old ones and upload new ones or append.
                    // For simplicity, let's assume we just want to upload NEW images if any selected in Edit mode?
                    // But selectedImages is initialized with existing images (URLs).
                    // Distinguish between new URIs (local) and old URLs (http).

                    const newImages = selectedImages.filter(img => !img.startsWith('http'));
                    if (newImages.length > 0) {
                        const imageFiles = newImages.map(uri => ({
                            uri: uri,
                            fileName: `review_${Date.now()}.jpg`,
                            type: 'image/jpeg'
                        }));
                        await reviewService.uploadReviewImages(Number(editTarget.id), imageFiles);
                    }
                } else {
                    await reviewService.updateComment(Number(editTarget.id), myComment);
                }
                showNotification("Cập nhật thành công!", "success");
            } else if (replyTarget) {
                // REPLY MODE
                console.log("Create Comment Args:", Number(replyTarget.reviewId), myComment, replyTarget.parentCommentId ? Number(replyTarget.parentCommentId) : "undefined");
                await reviewService.createComment(Number(replyTarget.reviewId), myComment, replyTarget.parentCommentId ? Number(replyTarget.parentCommentId) : undefined);
                showNotification("Phản hồi thành công!", "success");
                // Auto expand replies for that review
                const updatedReviews = reviews.map(r => r.id === replyTarget.reviewId ? { ...r, showReplies: true } : r);
                setReviews(updatedReviews);
            } else {
                // CREATE REVIEW MODE
                if (myRating === 0) {
                    showNotification("Vui lòng chọn số sao đánh giá!", "error");
                    return;
                }
                if (!locationId) {
                    console.error("Missing Location ID in createReview");
                    showNotification("Lỗi: Không tìm thấy ID sân!", "error");
                    return;
                }
                console.log("Creating review for location:", locationId, "Rating:", myRating);
                const newReview = await reviewService.createReview(locationId, myRating, myComment);

                // Upload Images
                if (selectedImages.length > 0) {
                    const imageFiles = selectedImages.map(uri => ({
                        uri: uri,
                        fileName: `review_${Date.now()}.jpg`,
                        type: 'image/jpeg'
                    }));
                    await reviewService.uploadReviewImages(Number(newReview.id), imageFiles);
                }

                showNotification("Gửi đánh giá thành công!", "success");
            }

            setModalVisible(false);
            loadData();
        } catch (error: any) {
            console.error(error);
            // Check for 400 error specifically "You have already reviewed this location"
            if (error.response?.status === 400) {
                // Try to get message from backend or default to friendly message
                const msg = error.response.data?.message || "Bạn đã đánh giá sân này rồi!";
                // If the message is the specific English one, translate it
                if (msg === "You have already reviewed this location") {
                    showNotification("Bạn đã đánh giá sân này rồi!", "warning");
                } else {
                    showNotification(msg, "warning");
                }
            } else {
                showNotification("Thao tác thất bại", "error");
            }
        }
    };

    // --- Render Items ---

    const renderRightActions = (type: 'REVIEW' | 'COMMENT', item: any) => {
        return (
            <View style={{ flexDirection: 'row', width: 140, height: '100%' }}>
                <TouchableOpacity
                    style={[styles.swipeActionBtn, { backgroundColor: '#3B9AFF' }]}
                    onPress={() => {
                        // Close swipeable logic if needed
                        openEdit(type, item, type === 'REVIEW' ? item.rating : 0);
                    }}
                >
                    <Ionicons name="pencil" size={24} color="#fff" />
                    <Text style={styles.swipeActionText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.swipeActionBtn, { backgroundColor: '#FF3B30' }]}
                    onPress={() => handleDelete(type, item.id)}
                >
                    <Ionicons name="trash" size={24} color="#fff" />
                    <Text style={styles.swipeActionText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderReplyItem = (reply: UIReply, reviewId: string) => {
        const isMyComment = user?.id === reply.userId;
        const backgroundColor = isMyComment ? '#E8F5E9' : (reply.user.isOwner ? '#F0F8FF' : '#fff');

        const content = (
            <View style={[styles.replyContainer, { backgroundColor }]}>
                <View style={styles.reviewHeader}>
                    <Image source={getAvatarSource(reply.user.avatar)} style={styles.avatarSmall} />
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.userName}>{reply.user.name}</Text>
                            {reply.user.isOwner && <View style={styles.ownerBadge}><Text style={styles.ownerText}>Chủ sân</Text></View>}
                        </View>
                        <Text style={styles.dateText}>{reply.date}</Text>
                    </View>
                </View>
                <Text style={styles.commentContent}>{reply.comment}</Text>
                <View style={styles.actionRow}>
                    {/* Like button removed */}
                    {/* Only show Reply button if not my own comment (optional, or allow self-reply?) */}
                    <TouchableOpacity
                        style={styles.btnActionSecondary}
                        onPress={() => openReply(reviewId, reply.id)}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color="#333" />
                        <Text style={styles.btnActionTextSecondary}>Trả lời</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );

        if (isMyComment) {
            return (
                <Swipeable key={reply.id} renderRightActions={() => renderRightActions('COMMENT', reply)}>
                    {content}
                </Swipeable>
            );
        }
        return <View key={reply.id}>{content}</View>;
    };

    const renderReviewItem = ({ item }: { item: UIReview }) => {
        const isMyReview = user?.id === item.userId;
        const backgroundColor = isMyReview ? '#E8F5E9' : '#fff';

        const content = (
            <View style={[styles.reviewItem, { backgroundColor }]}>
                <View style={styles.reviewHeader}>
                    <Image source={getAvatarSource(item.user.avatar)} style={styles.avatar} />
                    <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.userName}>{item.user.name}</Text>
                        </View>
                        <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Ionicons key={s} name="star" size={12} color={s <= item.rating ? "#FFD700" : "#ddd"} />
                            ))}
                            <Text style={styles.dateText}>{item.date}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.commentContent}>{item.comment}</Text>

                {item.images && item.images.length > 0 && (
                    <View style={styles.reviewImages}>
                        {item.images.map((img: string, idx: number) => (
                            <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
                        ))}
                    </View>
                )}

                <View style={styles.actionRow}>
                    {/* Like button removed */}

                    <TouchableOpacity
                        style={styles.btnActionSecondary}
                        onPress={() => {
                            if (item.replies && item.replies.length > 0) {
                                toggleReplies(item.id);
                            } else {
                                // Reply to review
                                openReply(item.id);
                            }
                        }}
                    >
                        <Ionicons name="chatbubble-outline" size={14} color="#333" />
                        <Text style={styles.btnActionTextSecondary}>
                            {item.replies && item.replies.length > 0
                                ? (item.showReplies ? "Ẩn câu trả lời" : `Xem trả lời (${item.replies.length})`)
                                : "Trả lời"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* REPLIES AREA */}
                {item.showReplies && item.replies.length > 0 && (
                    <View style={styles.repliesList}>
                        {item.replies.map(reply => renderReplyItem(reply, item.id))}
                    </View>
                )}
            </View>
        );

        if (isMyReview) {
            return (
                <View key={item.id} style={{ marginBottom: 16 }}>
                    <Swipeable renderRightActions={() => renderRightActions('REVIEW', item)}>
                        {content}
                    </Swipeable>
                    <View style={styles.divider} />
                </View>
            );
        }

        return (
            <View key={item.id} style={{ marginBottom: 16 }}>
                {content}
                <View style={styles.divider} />
            </View>
        );
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bình luận và đánh giá</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B9AFF']} />}
            >
                {/* Summary Section */}
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

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    {['Đề xuất', 'Có bình luận', 'Kèm hình ảnh', '5 sao'].map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filter === f && styles.activeChip]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Reviews List */}
                <View style={styles.reviewsList}>
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <View key={`skeleton-${i}`} style={{ padding: 16 }}>
                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <Skeleton width={40} height={40} borderRadius={20} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Skeleton width={120} height={14} style={{ marginBottom: 4 }} />
                                        <Skeleton width={80} height={12} />
                                    </View>
                                </View>
                                <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
                                <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
                                <Skeleton width={100} height={80} borderRadius={4} />
                            </View>
                        ))
                    ) : (
                        reviews.map(item => renderReviewItem({ item }))
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={openCreateReview}>
                <Ionicons name="pencil" size={24} color="#fff" />
            </TouchableOpacity>

            {
                modalVisible && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={[styles.modalOverlay, { zIndex: 9998 }]}
                    >
                        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>
                                    {editTarget
                                        ? (editTarget.type === 'REVIEW' ? "Chỉnh sửa đánh giá" : "Chỉnh sửa bình luận")
                                        : (replyTarget ? "Trả lời bình luận" : "Đánh giá của bạn")
                                    }
                                </Text>
                                <View style={styles.miniUser}>
                                    <Image source={getAvatarSource(user?.avatar)} style={styles.miniAvatar} />
                                    <View>
                                        <Text style={styles.miniName}>{user?.fullName || "Tôi"}</Text>
                                        <Text style={styles.miniNote}>Thông tin công khai</Text>
                                    </View>
                                </View>

                                {/* Rating only show if Review (Edit Review or Create Review) */}
                                {(!replyTarget && (!editTarget || editTarget.type === 'REVIEW')) && (
                                    <View style={styles.starInputRow}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <TouchableOpacity key={s} onPress={() => setMyRating(s)}>
                                                <Ionicons
                                                    name={s <= myRating ? "star" : "star-outline"}
                                                    size={32}
                                                    color="#FFD700"
                                                    style={{ marginHorizontal: 4 }}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        placeholder={replyTarget ? "Nhập câu trả lời của bạn..." : "Hãy mô tả trải nghiệm của bạn..."}
                                        multiline
                                        style={styles.textInput}
                                        value={myComment}
                                        onChangeText={setMyComment}
                                    />
                                </View>

                                {/* Image picker only for Reviews */}
                                {(!replyTarget && (!editTarget || editTarget.type === 'REVIEW')) && (
                                    <View style={styles.addImageAction}>
                                        <Text style={styles.addImageTitle}>Thêm hình ảnh hoặc video</Text>
                                        <TouchableOpacity style={styles.addImageBox} onPress={pickImage}>
                                            {selectedImages.length > 0 ? (
                                                <ScrollView horizontal>
                                                    {selectedImages.map((uri, idx) => (
                                                        <Image key={idx} source={{ uri }} style={{ width: 50, height: 50, marginRight: 5, borderRadius: 4 }} />
                                                    ))}
                                                </ScrollView>
                                            ) : (
                                                <>
                                                    <Ionicons name="images-outline" size={24} color="#666" />
                                                    <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Kéo hoặc chạm để tải lên</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.cancelText}>Quay lại</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                                        <Text style={styles.submitText}>
                                            {editTarget ? "Cập nhật" : (replyTarget ? "Phản hồi" : "Gửi đánh giá")}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                )
            }
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
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
    filterContainer: { paddingHorizontal: 16, paddingVertical: 12 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f0f0f0', borderRadius: 20, marginRight: 8 },
    activeChip: { backgroundColor: '#3B9AFF' },
    filterText: { fontSize: 13, color: '#666' },
    activeFilterText: { color: '#fff', fontWeight: '600' },
    reviewsList: { paddingBottom: 80 },
    reviewItem: { padding: 16 },
    reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    avatarSmall: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
    userInfo: { flex: 1 },
    userName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    dateText: { fontSize: 11, color: '#999', marginLeft: 8 },
    commentContent: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 10 },
    reviewImages: { flexDirection: 'row', marginBottom: 10 },
    reviewImage: { width: 100, height: 80, borderRadius: 4, marginRight: 8, resizeMode: 'cover' },
    actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },

    btnAction: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
        marginRight: 10,
        minWidth: 50,
        justifyContent: 'center'
    },
    btnActionActive: {
        backgroundColor: '#3B9AFF'
    },
    btnActionSecondary: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    btnActionText: { color: '#666', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },
    btnActionTextSecondary: { color: '#666', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },

    repliesList: {
        marginTop: 10,
        borderLeftWidth: 2,
        borderLeftColor: '#eee',
        paddingLeft: 10
    },
    replyContainer: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee'
    },
    ownerBadge: {
        backgroundColor: '#3B9AFF',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 6
    },
    ownerText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },

    divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 16 },
    fab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3B9AFF', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    miniUser: { flexDirection: 'row', alignSelf: 'flex-start', marginBottom: 16, alignItems: 'center' },
    miniAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    miniName: { fontWeight: 'bold', fontSize: 14 },
    miniNote: { fontSize: 10, color: '#666' },
    starInputRow: { flexDirection: 'row', marginBottom: 20 },
    inputContainer: { width: '100%', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 20 },
    textInput: { minHeight: 80, textAlignVertical: 'top' },
    addImageAction: { width: '100%', marginBottom: 20, alignItems: 'center' },
    addImageTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    addImageBox: { width: '100%', height: 80, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#eee', borderRadius: 8, flex: 0.45, alignItems: 'center' },
    cancelText: { fontWeight: 'bold', color: '#333' },
    submitBtn: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#3B9AFF', borderRadius: 8, flex: 0.45, alignItems: 'center' },
    submitText: { fontWeight: 'bold', color: '#fff' },

    // Swipe Actions
    swipeActionBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    swipeActionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        marginTop: 4
    }
});

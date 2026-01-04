import React, { useState } from 'react';
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
    UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore } from '../../store/useNotificationStore';
import * as ImagePicker from 'expo-image-picker';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// --- TYPE INTERFACES ---
interface Reply {
    id: string;
    user: { name: string; avatar: string; isOwner?: boolean };
    date: string;
    comment: string;
    likes: number;
    isLiked: boolean;
}

interface Review {
    id: string;
    user: { name: string; avatar: string };
    rating: number;
    date: string;
    comment: string;
    images: string[];
    likes: number;
    isLiked: boolean;
    replies: Reply[];
    showReplies?: boolean;
}

// --- MOCK DATA ---
const INITIAL_REVIEWS: Review[] = [
    {
        id: '1',
        user: { name: 'Phạm Thanh Phong', avatar: 'https://i.pravatar.cc/150?u=99' },
        rating: 5,
        date: '20:42 31/10/2025',
        comment: 'Mặt sân sạch sẽ chất lượng, đèn không chói như các sân khác',
        images: [],
        likes: 1,
        isLiked: true,
        replies: [
            {
                id: '101',
                user: { name: 'Hoàng Văn Mạnh', avatar: 'https://i.pravatar.cc/150?u=admin', isOwner: true },
                date: '21:03 31/10/2025',
                comment: 'Cảm ơn bạn đã ủng hộ sân ^^',
                likes: 1,
                isLiked: false
            },
            {
                id: '102',
                user: { name: 'Phạm Thanh Phong', avatar: 'https://i.pravatar.cc/150?u=99' },
                date: '21:12 31/10/2025',
                comment: 'Không có gì ạ',
                likes: 1,
                isLiked: true
            }
        ],
        showReplies: true
    },
    {
        id: '2',
        user: { name: 'Đặng Văn Ba', avatar: 'https://i.pravatar.cc/150?u=1' },
        rating: 4,
        date: '10:55 29/10/2025',
        comment: 'Sân đẹp',
        images: [
            'https://picsum.photos/200/300?random=1',
            'https://picsum.photos/200/300?random=2',
            'https://picsum.photos/200/300?random=3'
        ],
        likes: 12,
        isLiked: false,
        replies: [],
        showReplies: false
    },
    {
        id: '3',
        user: { name: 'Lê Thị Thìn', avatar: 'https://i.pravatar.cc/150?u=2' },
        rating: 5,
        date: '21:32 27/10/2025',
        comment: 'Sân chất lượng tốt, sẽ còn quay lại ủng hộ!',
        images: [],
        likes: 12,
        isLiked: true,
        replies: [],
        showReplies: false
    },
    {
        id: '4',
        user: { name: 'Nguyễn Hoàng Nam', avatar: 'https://i.pravatar.cc/150?u=3' },
        rating: 5,
        date: '22:14 23/10/2025',
        comment: 'Lần đầu đi đánh cầu lông gặp sân này rất ổn, thoáng mát rộng rãi, đầy đủ tiện nghi',
        images: [],
        likes: 12,
        isLiked: false,
        replies: [],
        showReplies: false
    },
    {
        id: '5',
        user: { name: 'Phạm Quốc Việt', avatar: 'https://i.pravatar.cc/150?u=4' },
        rating: 5,
        date: '21:53 19/10/2025',
        comment: 'Sân này mát mẻ, chỗ để xe rộng rãi, nói chung khá tốt',
        images: [],
        likes: 12,
        isLiked: false,
        replies: [],
        showReplies: false
    },
    {
        id: '6',
        user: { name: 'Lê Công Vinh', avatar: 'https://i.pravatar.cc/150?u=5' },
        rating: 5,
        date: '17:26 15/10/2025',
        comment: 'Tuyệt vời, sân sạch sẽ, mát mẻ',
        images: [],
        likes: 0,
        isLiked: false,
        replies: [],
        showReplies: false
    }
];

const RATING_STATS = {
    average: 4.8,
    total: 100,
    counts: { 5: 86, 4: 8, 3: 4, 2: 2, 1: 0 }
};

export default function ReviewScreen() {
    const navigation = useNavigation();
    const { showNotification } = useNotificationStore();
    const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
    const [filter, setFilter] = useState('Đề xuất');

    // Modal & Post Logic
    const [modalVisible, setModalVisible] = useState(false);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // Options Modal State
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

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

    const handleSubmitReview = () => {
        if (myRating === 0) {
            showNotification("Vui lòng chọn số sao đánh giá!", "error");
            return;
        }

        const newReview: Review = {
            id: Date.now().toString(),
            user: { name: 'Phạm Thanh Phong', avatar: 'https://i.pravatar.cc/150?u=99' },
            rating: myRating,
            date: 'Vừa xong',
            comment: myComment,
            images: selectedImages,
            likes: 0,
            isLiked: false,
            replies: [],
            showReplies: false
        };

        setReviews([newReview, ...reviews]);
        setModalVisible(false);
        setMyRating(0);
        setMyComment('');
        setSelectedImages([]);
        showNotification("Đã gửi đánh giá thành công!", "success");
    };

    const handleOptionsPress = (reviewData: Review) => {
        // Only show options if it's the current user's review
        // In a real app, check user ID. Here we mock check by name.
        if (reviewData.user.name === 'Phạm Thanh Phong') {
            setSelectedReviewId(reviewData.id);
            setOptionsModalVisible(true);
        }
    };

    const handleDeleteReview = () => {
        setReviews(reviews.filter(r => r.id !== selectedReviewId));
        setOptionsModalVisible(false);
        showNotification("Đã xóa đánh giá!", "success");
    };

    const handleEditReview = () => {
        // Populate modal with existing data then open it
        // For simplicity, we just close options and open the write modal as "new" for now
        // A full edit implementation would pre-fill fields.
        setOptionsModalVisible(false);
        setModalVisible(true);
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

    const renderReplyItem = (reply: Reply) => (
        <View key={reply.id} style={[styles.replyContainer, reply.user.isOwner && styles.replyContainerOwner]}>
            <View style={styles.reviewHeader}>
                <Image source={{ uri: reply.user.avatar }} style={styles.avatarSmall} />
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
                <TouchableOpacity
                    style={[styles.btnAction, reply.isLiked && styles.btnActionActive]}
                    onPress={() => handleVote(reply.id, true)}>
                    <Ionicons name="thumbs-up" size={14} color={reply.isLiked ? "#fff" : "#fff"} />
                    <Text style={[styles.btnActionText, reply.isLiked && { color: '#fff' }]}>{reply.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnActionSecondary}>
                    <Ionicons name="chatbox-ellipses" size={14} color="#333" />
                    <Text style={styles.btnActionTextSecondary}>Trả lời</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderReviewItem = ({ item }: { item: Review }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.userName}>{item.user.name}</Text>
                        {item.user.name === 'Phạm Thanh Phong' && (
                            <TouchableOpacity onPress={() => handleOptionsPress(item)}>
                                <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
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
                <TouchableOpacity
                    style={[styles.btnAction, item.isLiked && styles.btnActionActive]}
                    onPress={() => handleVote(item.id)}>
                    <Ionicons name="thumbs-up" size={14} color={item.isLiked ? "#fff" : "#fff"} />
                    <Text style={[styles.btnActionText, item.isLiked && { color: '#fff' }]}>{item.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnActionSecondary} onPress={() => toggleReplies(item.id)}>
                    <Ionicons name="chatbox" size={14} color="#333" />
                    <Text style={styles.btnActionTextSecondary}>Trả lời</Text>
                </TouchableOpacity>
            </View>

            {/* REPLIES AREA */}
            {item.showReplies && item.replies.length > 0 && (
                <View style={styles.repliesList}>
                    {item.replies.map(renderReplyItem)}
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
                <Text style={styles.headerTitle}>Bình luận và đánh giá</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Summary Section */}
                <View style={styles.summaryContainer}>
                    <View style={styles.bigRating}>
                        <Text style={styles.bigScore}>{RATING_STATS.average}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            {[1, 2, 3, 4, 5].map(s => <Ionicons key={s} name="star" size={14} color="#FFD700" />)}
                        </View>
                        <Text style={styles.totalReviews}>{RATING_STATS.total} đánh giá</Text>
                    </View>
                    <View style={styles.barsColumn}>
                        {[5, 4, 3, 2, 1].map(star => renderRatingBar(star, RATING_STATS.counts[star as keyof typeof RATING_STATS.counts], RATING_STATS.total))}
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
                    {reviews.map(item => (
                        <View key={item.id}>
                            {renderReviewItem({ item })}
                            <View style={styles.divider} />
                        </View>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="pencil" size={24} color="#fff" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Đánh giá của bạn</Text>
                        <View style={styles.miniUser}>
                            <Image source={{ uri: "https://i.pravatar.cc/150?u=99" }} style={styles.miniAvatar} />
                            <View>
                                <Text style={styles.miniName}>Phạm Thanh Phong</Text>
                                <Text style={styles.miniNote}>Nhật ký chỉnh sửa là thông tin công khai</Text>
                            </View>
                        </View>

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

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Hãy mô tả trải nghiệm của bạn về sân cầu lông này..."
                                multiline
                                style={styles.textInput}
                                value={myComment}
                                onChangeText={setMyComment}
                            />
                        </View>

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

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Quay lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview}>
                                <Text style={styles.submitText}>Gửi đánh giá</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Options Modal (Edit/Delete) */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={optionsModalVisible}
                onRequestClose={() => setOptionsModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setOptionsModalVisible(false)}
                >
                    <View style={styles.optionsModalContent}>
                        <TouchableOpacity style={styles.optionItem} onPress={handleEditReview}>
                            <Ionicons name="pencil" size={20} color="#333" />
                            <Text style={styles.optionText}>Chỉnh sửa</Text>
                        </TouchableOpacity>
                        <View style={styles.optionDivider} />
                        <TouchableOpacity style={styles.optionItem} onPress={handleDeleteReview}>
                            <Ionicons name="trash" size={20} color="#333" />
                            <Text style={styles.optionText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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

    // Optimized Buttons
    // Shared button style
    btnAction: {
        flexDirection: 'row',
        backgroundColor: '#ddd', // Default grey like provided image (button background)
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
        marginRight: 10,
        minWidth: 50,
        justifyContent: 'center'
    },
    // When active (liked), it turns blue
    btnActionActive: {
        backgroundColor: '#3B9AFF'
    },
    btnActionSecondary: {
        flexDirection: 'row',
        backgroundColor: '#ddd', // Grey
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    btnActionText: { color: '#333', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },
    btnActionTextSecondary: { color: '#333', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },

    // Replies
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

    divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 16 },
    fab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3B9AFF', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
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
    addImageBox: { width: '100%', height: 60, borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#eee', borderRadius: 8, flex: 0.45, alignItems: 'center' },
    cancelText: { fontWeight: 'bold', color: '#333' },
    submitBtn: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#3B9AFF', borderRadius: 8, flex: 0.45, alignItems: 'center' },
    submitText: { fontWeight: 'bold', color: '#fff' },

    // Options Modal
    optionsModalContent: {
        backgroundColor: '#eee',
        borderRadius: 12,
        padding: 0,
        width: 150,
        position: 'absolute',
        right: 40, // Position towards the right
        top: '25%', // Approximate general position or handle dynamically
        // Ideally we would use `measure` on the pressed element to position exactly, 
        // but for now placing it roughly where the "..." usually is on the list items
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 10,
        color: '#333'
    },
    optionDivider: {
        height: 1,
        backgroundColor: '#ccc',
        marginHorizontal: 10
    }
});

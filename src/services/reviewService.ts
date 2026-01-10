import axiosInstance, { getAccessToken } from './axiosInstance';
import { Platform } from 'react-native';

// Backend DTOs
interface ReviewDTO {
    id: number;
    userId: number;
    userName: string;
    userAvatar: string;
    locationId: number;
    locationName: string;
    rating: number;
    content: string;
    createdAt: string;
    comments: CommentDTO[];
    images: string[]; // Added images field
}

interface CommentDTO {
    id: number;
    reviewId: number;
    userId: number;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: string;
    parentCommentId: number | null;
    replies: CommentDTO[];
}

// Frontend Interfaces (Matching ReviewScreen.tsx)
export interface UIReview {
    id: string;
    userId: string; // Added for ownership check
    user: { name: string; avatar: string };
    rating: number;
    date: string;
    comment: string;
    images: string[];
    likes: number;
    isLiked: boolean;
    replies: UIReply[];
    showReplies?: boolean;
}

export interface UIReply {
    id: string;
    userId: string; // Added for ownership check
    user: { name: string; avatar: string; isOwner?: boolean };
    date: string;
    comment: string;
    likes: number;
    isLiked: boolean;
    replies?: UIReply[]; // Nested replies support if needed
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    counts: Record<number, number>;
}

export const reviewService = {
    getLocationReviews: async (locationId: number, page: number = 0, size: number = 10): Promise<UIReview[]> => {
        try {
            const response = await axiosInstance.get<ReviewDTO[]>(`/reviews/location/${locationId}`, {
                params: { page, size }
            });
            return response.data.map(mapToUIReview);
        } catch (error) {
            console.error("Error fetching reviews", error);
            return [];
        }
    },

    getLocationStats: async (locationId: number): Promise<ReviewStats> => {
        try {
            const response = await axiosInstance.get<{ averageRating: number, totalReviews: number, counts: Record<string, number> }>(`/reviews/location/${locationId}/stats`);
            const counts: Record<number, number> = {};
            if (response.data.counts) {
                Object.entries(response.data.counts).forEach(([k, v]) => {
                    counts[Number(k)] = Number(v);
                });
            }
            return {
                averageRating: response.data.averageRating,
                totalReviews: response.data.totalReviews,
                counts
            };
        } catch (error) {
            console.error("Error fetching stats", error);
            return { averageRating: 0, totalReviews: 0, counts: {} };
        }
    },

    createReview: async (locationId: number, rating: number, content: string): Promise<UIReview> => {
        const response = await axiosInstance.post<ReviewDTO>('/reviews', {
            locationId,
            rating,
            content
        });
        return mapToUIReview(response.data);
    },

    uploadReviewImages: async (reviewId: number, images: any[]): Promise<UIReview> => {
        const formData = new FormData();
        images.forEach((img) => {
            // Fix for Android URI
            let uri = img.uri;
            if (Platform.OS === 'android' && !uri.startsWith('file://')) {
                uri = `file://${uri}`;
            }

            // Fix for MimeType
            let type = img.mimeType || img.type;
            if (!type || type === 'image') {
                const ext = uri.split('.').pop()?.toLowerCase();
                type = ext === 'png' ? 'image/png' : 'image/jpeg';
            }

            formData.append('files', { // Note: 'files' matches Backend @RequestPart("files")
                uri: uri,
                name: img.fileName || `review_${Date.now()}.jpg`,
                type: type
            } as any);
        });

        // Backend ReviewController is at /api/v1/reviews
        // axiosInstance.baseURL is .../api/v1
        let baseURL = axiosInstance.defaults.baseURL || "";
        if (baseURL.endsWith('/')) baseURL = baseURL.slice(0, -1);

        // Ensure we don't duplicate /reviews if it's already in base (unlikely but safe)
        const endpoint = `/reviews/${reviewId}/images`;
        const fullUrl = `${baseURL}${endpoint}`;

        const token = getAccessToken();

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Accept header is good practice
                    'Accept': 'application/json',
                    // NO Content-Type header
                },
                body: formData,
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Review upload parse error:", text);
                throw new Error("Invalid server response");
            }

            if (!response.ok) {
                // Check for Max Upload Size error specifically
                if (data.message && data.message.includes("Maximum upload size exceeded")) {
                    throw new Error("Dung lượng ảnh quá lớn (Tối đa 5MB).");
                }
                throw new Error(data.message || "Upload failed");
            }

            return mapToUIReview(data);
        } catch (error: any) {
            console.error("Upload review images error", error);
            throw error;
        }
    },

    createComment: async (reviewId: number, content: string, parentCommentId?: number): Promise<UIReply> => {
        const payload: any = { reviewId, content };
        if (parentCommentId) payload.parentCommentId = parentCommentId;

        const url = parentCommentId ? '/reviews/comments/reply' : '/reviews/comments';
        const response = await axiosInstance.post<CommentDTO>(url, payload);
        return mapToUIReply(response.data);
    },

    updateReview: async (reviewId: number, rating: number, content: string): Promise<UIReview> => {
        const response = await axiosInstance.put<ReviewDTO>(`/reviews/${reviewId}`, {
            rating,
            content,
            locationId: 0
        });
        return mapToUIReview(response.data);
    },

    updateComment: async (commentId: number, content: string): Promise<UIReply> => {
        const response = await axiosInstance.put<CommentDTO>(`/reviews/comments/${commentId}`, {
            content
        });
        return mapToUIReply(response.data);
    },

    deleteReview: async (reviewId: number): Promise<void> => {
        await axiosInstance.delete(`/reviews/${reviewId}`);
    },

    deleteComment: async (commentId: number): Promise<void> => {
        await axiosInstance.delete(`/reviews/comments/${commentId}`);
    }
};

// Mappers
const mapToUIReview = (dto: ReviewDTO): UIReview => {
    return {
        id: dto.id.toString(),
        userId: dto.userId.toString(),
        user: {
            name: dto.userName || 'Người dùng ẩn danh',
            avatar: dto.userAvatar || 'https://i.pravatar.cc/150?img=12'
        },
        rating: dto.rating,
        date: formatDate(dto.createdAt),
        comment: dto.content,
        images: dto.images || [], // Correctly mapped
        likes: 0,
        isLiked: false,
        replies: dto.comments ? dto.comments.map(mapToUIReply) : [],
        showReplies: false
    };
};

const mapToUIReply = (dto: CommentDTO): UIReply => {
    return {
        id: dto.id.toString(),
        userId: dto.userId.toString(),
        user: {
            name: dto.userName || 'Người dùng ẩn danh',
            avatar: dto.userAvatar || 'https://i.pravatar.cc/150?img=12',
            isOwner: false
        },
        date: formatDate(dto.createdAt),
        comment: dto.content,
        likes: 0,
        isLiked: false,
        replies: dto.replies ? dto.replies.map(mapToUIReply) : []
    };
};

const formatDate = (isoString: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // Use Vietnamese locale and Asia/Ho_Chi_Minh timezone
        return date.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return isoString;
    }
}

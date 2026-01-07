import axiosInstance from './axiosInstance';

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'SYSTEM' | 'PROMOTION' | 'BOOKING' | 'PAYMENT_SUCCESS';
    isRead: boolean;
    createdAt: string;
}

export const notificationService = {
    // Get all notifications for Player
    getNotifications: async (): Promise<NotificationItem[]> => {
        try {
            const response = await axiosInstance.get('/notifications');
            const data = response.data; // Backend returns List<BriefNotificationResponse> directly

            if (!Array.isArray(data)) {
                return [];
            }

            return data.map((item: any) => ({
                id: item.notificationId?.toString(),
                title: getTitleFromType(item.type),
                message: item.briefNotification,
                type: item.type,
                isRead: item.notificationIsRead,
                createdAt: item.createdAt
            }));
        } catch (error) {
            console.error("Error fetching notifications:", error);
            // Return empty array instead of mock data to avoid confusion
            return [];
        }
    },

    // Get all notifications for Owner
    getOwnerNotifications: async (): Promise<NotificationItem[]> => {
        try {
            const response = await axiosInstance.get('/owner/notifications');
            const data = response.data;

            if (!Array.isArray(data)) {
                return [];
            }

            return data.map((item: any) => ({
                id: item.notificationId?.toString(),
                title: getTitleFromType(item.type),
                message: item.briefNotification,
                type: item.type,
                isRead: item.notificationIsRead,
                createdAt: item.createdAt
            }));
        } catch (error) {
            console.error("Error fetching owner notifications:", error);
            return [];
        }
    },


    // Mark as read
    markAsRead: async (id: string) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            await axiosInstance.put(`/notifications/read-all`);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    },

    deleteNotification: async (id: string) => {
        await axiosInstance.delete(`/notifications/${id}`);
    },

    deleteAllNotifications: async () => {
        await axiosInstance.delete(`/notifications`);
    },

    deleteOwnerNotification: async (id: string) => {
        await axiosInstance.delete(`/owner/notifications/${id}`);
    },

    deleteAllOwnerNotifications: async () => {
        await axiosInstance.delete(`/owner/notifications`);
    }
};

const getTitleFromType = (type: string) => {
    switch (type) {
        case 'PROMOTION': return 'Khuyến mãi';
        case 'PAYMENT_SUCCESS': return 'Thanh toán thành công';
        default: return 'Thông báo mới';
    }
};

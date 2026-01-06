import { create } from 'zustand';
import { notificationService, NotificationItem } from '../services/notificationService';

interface InboxState {
    notifications: NotificationItem[];
    unreadCount: number;
    isLoading: boolean;

    fetchNotifications: () => Promise<void>;
    fetchOwnerNotifications: () => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
}

export const useInboxStore = create<InboxState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const data = await notificationService.getNotifications();
            const unread = data.filter(n => !n.isRead).length;
            set({ notifications: data, unreadCount: unread, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    fetchOwnerNotifications: async () => {
        set({ isLoading: true });
        try {
            const data = await notificationService.getOwnerNotifications();
            const unread = data.filter(n => !n.isRead).length;
            set({ notifications: data, unreadCount: unread, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    markRead: async (id: string) => {
        // Optimistic update
        const { notifications } = get();
        const updated = notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        );
        const unread = updated.filter(n => !n.isRead).length;
        set({ notifications: updated, unreadCount: unread });

        await notificationService.markAsRead(id);
    },

    markAllRead: async () => {
        const { notifications } = get();
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        set({ notifications: updated, unreadCount: 0 });

        await notificationService.markAllAsRead();
    }
}));

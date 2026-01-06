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
    deleteNotification: (id: string, isOwner?: boolean) => Promise<void>;
    deleteAllNotifications: (isOwner?: boolean) => Promise<void>;
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
        await notificationService.markAllAsRead();
        // Even if markAsRead fails or is mock, we just move on.
        // But here we want to modify this function to handle local "Read All" if needed
        // For now, keep it as is.
        const { notifications } = get();
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        set({ notifications: updated, unreadCount: 0 });
    },

    deleteNotification: async (id: string, isOwner: boolean = false) => {
        const { notifications } = get();
        const updated = notifications.filter(n => n.id !== id);
        const unread = updated.filter(n => !n.isRead).length;
        set({ notifications: updated, unreadCount: unread });
        try {
            if (isOwner) {
                await notificationService.deleteOwnerNotification(id);
            } else {
                await notificationService.deleteNotification(id);
            }
        } catch (e) {
            console.error(e);
        }
    },

    deleteAllNotifications: async (isOwner: boolean = false) => {
        set({ notifications: [], unreadCount: 0 });
        try {
            if (isOwner) {
                await notificationService.deleteAllOwnerNotifications();
            } else {
                await notificationService.deleteAllNotifications();
            }
        } catch (e) {
            console.error(e);
        }
    }
}));

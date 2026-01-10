import { create } from 'zustand';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
    visible: boolean;
    message: string;
    type: NotificationType;
    showNotification: (message: string, type?: NotificationType) => void;
    hideNotification: () => void;
}

let timeoutId: NodeJS.Timeout;

export const useNotificationStore = create<NotificationState>((set) => ({
    visible: false,
    message: '',
    type: 'info',
    showNotification: (message, type = 'info') => {
        if (timeoutId) clearTimeout(timeoutId);
        set({ visible: true, message, type });
        // Auto hide after 3 seconds
        timeoutId = setTimeout(() => {
            set({ visible: false });
        }, 3000);
    },
    hideNotification: () => {
        if (timeoutId) clearTimeout(timeoutId);
        set({ visible: false });
    },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'has_seen_onboarding';

export const setHasSeenOnboarding = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (e) {
    console.error('Error setting onboarding status', e);
  }
};

export const getHasSeenOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (e) {
    console.error('Error getting onboarding status', e);
    return false;
  }
};

// --- THÊM HÀM NÀY ---
export const clearOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    console.log('Đã xóa trạng thái Onboarding!');
  } catch (e) {
    console.error('Error clearing onboarding status', e);
  }
};
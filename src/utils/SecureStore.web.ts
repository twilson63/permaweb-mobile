// Polyfill for expo-secure-store on web
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use AsyncStorage as fallback for web
const SecureStore = {
  async getItemAsync(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  async setItemAsync(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },
  
  async deleteItemAsync(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

export default SecureStore;
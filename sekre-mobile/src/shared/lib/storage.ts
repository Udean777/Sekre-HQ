import * as SecureStore from 'expo-secure-store';

export const storage = {
  async setToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('Error saving secure store item', e);
    }
  },

  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error('Error getting secure store item', e);
      return null;
    }
  },

  async deleteToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error('Error deleting secure store item', e);
    }
  }
};

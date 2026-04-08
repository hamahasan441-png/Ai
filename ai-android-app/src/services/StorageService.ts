/**
 * Storage Service - Persistent storage for the Android app
 * Uses AsyncStorage for local data persistence.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from './AIEngine';

const KEYS = {
  CHAT_HISTORY: '@ai_chat_history',
  SETTINGS: '@ai_settings',
  ACTIVE_MODULES: '@ai_active_modules',
  THEME: '@ai_theme',
};

export interface AppSettings {
  darkMode: boolean;
  fontSize: number;
  hapticFeedback: boolean;
  autoScroll: boolean;
  showModuleInfo: boolean;
  maxHistorySize: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  fontSize: 16,
  hapticFeedback: true,
  autoScroll: true,
  showModuleInfo: true,
  maxHistorySize: 1000,
};

export class StorageService {
  /**
   * Save chat history
   */
  static async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    try {
      const json = JSON.stringify(messages);
      await AsyncStorage.setItem(KEYS.CHAT_HISTORY, json);
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  /**
   * Load chat history
   */
  static async loadChatHistory(): Promise<ChatMessage[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  }

  /**
   * Save settings
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const json = JSON.stringify(settings);
      await AsyncStorage.setItem(KEYS.SETTINGS, json);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Load settings
   */
  static async loadSettings(): Promise<AppSettings> {
    try {
      const json = await AsyncStorage.getItem(KEYS.SETTINGS);
      return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save active modules list
   */
  static async saveActiveModules(modules: string[]): Promise<void> {
    try {
      const json = JSON.stringify(modules);
      await AsyncStorage.setItem(KEYS.ACTIVE_MODULES, json);
    } catch (error) {
      console.error('Failed to save active modules:', error);
    }
  }

  /**
   * Load active modules list
   */
  static async loadActiveModules(): Promise<string[] | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.ACTIVE_MODULES);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error('Failed to load active modules:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Get storage size info
   */
  static async getStorageInfo(): Promise<{ keys: number; totalSize: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalBytes = 0;
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalBytes += value.length;
        }
      }
      return {
        keys: keys.length,
        totalSize: totalBytes < 1024
          ? `${totalBytes} B`
          : totalBytes < 1048576
            ? `${(totalBytes / 1024).toFixed(1)} KB`
            : `${(totalBytes / 1048576).toFixed(1)} MB`,
      };
    } catch (error) {
      return { keys: 0, totalSize: '0 B' };
    }
  }
}

export default StorageService;

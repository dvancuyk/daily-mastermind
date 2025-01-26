import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BFF_URL;;

export const StorageKeys = {
  JOURNAL_ENTRIES: 'journal_entries',
  TASKS: 'tasks',
  SCHEDULE: 'schedule',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync',
};

export class DataManager {
  static isOnline = false;
  static syncQueue = [];

  static async initialize() {
    try {
      // Load sync queue from storage
      const queueData = await AsyncStorage.getItem(StorageKeys.SYNC_QUEUE);
      this.syncQueue = queueData ? JSON.parse(queueData) : [];

      // Try to sync any pending changes
      this.attemptSync();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  static async saveData(key, data) {
    try {
      // Save to local storage
      await AsyncStorage.setItem(key, JSON.stringify(data));

      // Add to sync queue
      this.syncQueue.push({
        key,
        data,
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem(StorageKeys.SYNC_QUEUE, JSON.stringify(this.syncQueue));

      // Attempt to sync if online
      this.attemptSync();

      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  }

  static async getData(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Read error:', error);
      return null;
    }
  }

  static async attemptSync() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    try {
      const successfulSyncs = [];

      for (const item of this.syncQueue) {
        try {
          const response = await fetch(`${API_BASE_URL}/${item.key}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item.data),
          });

          if (response.ok) {
            successfulSyncs.push(item);
          }
        } catch (error) {
          console.error('Sync error for item:', error);
        }
      }

      // Remove successful syncs from queue
      this.syncQueue = this.syncQueue.filter(
        item => !successfulSyncs.includes(item)
      );
      await AsyncStorage.setItem(StorageKeys.SYNC_QUEUE, JSON.stringify(this.syncQueue));

      // Update last sync timestamp
      await AsyncStorage.setItem(StorageKeys.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  static setOnlineStatus(status) {
    this.isOnline = status;
    if (status) {
      this.attemptSync();
    }
  }
}
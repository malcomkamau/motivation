import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKUP_FILE = FileSystem.documentDirectory + 'backup.json';

export const createBackup = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data = await AsyncStorage.multiGet(keys);
    const backup = Object.fromEntries(data);
    await FileSystem.writeAsStringAsync(BACKUP_FILE, JSON.stringify(backup));
    return true;
  } catch (err) {
    console.error('Backup failed:', err);
    return false;
  }
};

export const restoreBackup = async () => {
  try {
    const info = await FileSystem.getInfoAsync(BACKUP_FILE);
    if (!info.exists) return false;

    const content = await FileSystem.readAsStringAsync(BACKUP_FILE);
    const parsed = JSON.parse(content);
    await AsyncStorage.multiSet(Object.entries(parsed));
    return true;
  } catch (err) {
    console.error('Restore failed:', err);
    return false;
  }
};

export const backupExists = async () => {
  const info = await FileSystem.getInfoAsync(BACKUP_FILE);
  return info.exists;
};

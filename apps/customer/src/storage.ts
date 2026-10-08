import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Settings that survive a restart: the theme and the language. Storage can fail (a full disk, a
 * private browser window), and a missing setting is never worth a crash, so both calls swallow
 * errors: a failed read looks like "nothing stored" and a failed write just means it is not kept.
 */
export async function readSetting(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function writeSetting(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Not kept this time. The app keeps working with the value in memory.
  }
}

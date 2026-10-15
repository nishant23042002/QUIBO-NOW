import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStorage } from './storageCore';

/** Where the app keeps what must survive a restart. The rules are in `createStorage`. */
const storage = createStorage(AsyncStorage);

export const readSetting = storage.readSetting;
export const writeSetting = storage.writeSetting;

/** Removes saved settings by key. A failure is not worth a crash: what could not be removed is simply still there. */
export async function clearSettings(keys: readonly string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove([...keys]);
  } catch {
    // Left as it was.
  }
}

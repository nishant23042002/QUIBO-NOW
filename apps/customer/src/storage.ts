import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStorage } from './storageCore';

/** Where the app keeps what must survive a restart. The rules are in `createStorage`. */
const storage = createStorage(AsyncStorage);

export const readSetting = storage.readSetting;
export const writeSetting = storage.writeSetting;

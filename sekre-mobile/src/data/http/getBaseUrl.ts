import { Platform } from 'react-native';
import Config from 'react-native-config';

/**
 * Resolves the correct backend base URL based on:
 * - __DEV__ (React Native global — false di release build, tidak bergantung .env)
 * - APP_ENV (react-native-config — production vs development)
 * - Platform (ios / android)
 * - Device type (simulator / emulator vs physical device)
 *
 * Priority:
 * 1. Release build (!__DEV__) → selalu pakai production URL
 *    - Gunakan API_BASE_URL dari .env.production kalau ada
 *    - Fallback eksplisit ke https://sekre-backend.onrender.com
 *    - __DEV__ di-inject langsung oleh Metro bundler, tidak bergantung .env
 * 2. Debug build (__DEV__):
 *    - iOS Simulator     → API_BASE_URL_IOS_SIMULATOR
 *    - Android Emulator  → API_BASE_URL_ANDROID_EMULATOR
 *    - iOS Physical      → API_BASE_URL_IOS_PHYSICAL
 *    - Android Physical  → API_BASE_URL_ANDROID_PHYSICAL
 */

const PRODUCTION_URL = 'https://sekre-backend.onrender.com';

function isIOSSimulator(): boolean {
  if (Platform.OS !== 'ios') return false;
  const constants = Platform.constants;
  return 'isSimulator' in constants && constants.isSimulator === true;
}

function isAndroidEmulator(): boolean {
  if (Platform.OS !== 'android') return false;
  const constants = Platform.constants;
  return 'isEmulator' in constants && constants.isEmulator === true;
}

export function getBaseUrl(): string {
  // Release build — __DEV__ adalah false, di-inject oleh Metro bundler
  // Tidak bergantung pada react-native-config sama sekali untuk deteksi ini
  if (!__DEV__) {
    return Config['API_BASE_URL'] ?? PRODUCTION_URL;
  }

  // Development build — gunakan URL sesuai platform/device
  if (isIOSSimulator()) {
    return Config['API_BASE_URL_IOS_SIMULATOR'] ?? 'http://localhost:8080';
  }

  if (isAndroidEmulator()) {
    return Config['API_BASE_URL_ANDROID_EMULATOR'] ?? 'http://10.0.2.2:8080';
  }

  if (Platform.OS === 'ios') {
    return Config['API_BASE_URL_IOS_PHYSICAL'] ?? 'http://192.168.1.5:8080';
  }

  if (Platform.OS === 'android') {
    return Config['API_BASE_URL_ANDROID_PHYSICAL'] ?? 'http://192.168.1.5:8080';
  }

  return Config['API_BASE_URL'] ?? PRODUCTION_URL;
}

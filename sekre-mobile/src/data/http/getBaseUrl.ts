import { Platform } from 'react-native';
import Config from 'react-native-config';

/**
 * Resolves the correct backend base URL based on:
 * - APP_ENV (production vs development)
 * - Platform (ios / android)
 * - Device type (simulator / emulator vs physical device)
 *
 * Priority:
 * 1. If APP_ENV=production → always use API_BASE_URL (Render)
 * 2. If APP_ENV=development:
 *    - iOS Simulator     → API_BASE_URL_IOS_SIMULATOR
 *    - Android Emulator  → API_BASE_URL_ANDROID_EMULATOR
 *    - iOS Physical      → API_BASE_URL_IOS_PHYSICAL
 *    - Android Physical  → API_BASE_URL_ANDROID_PHYSICAL
 */

/**
 * Returns true when running on an iOS Simulator.
 * Uses Platform.constants which is reliable on RN 0.64+.
 */
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

/**
 * Returns the correct API base URL for the current runtime environment.
 *
 * In production, always returns the production Render URL.
 * In development, returns the URL matching the current device/simulator.
 */
export function getBaseUrl(): string {
  const isProduction = Config.APP_ENV === 'production';

  // Production → always Render
  if (isProduction) {
    return Config.API_BASE_URL ?? 'https://sekre-backend.onrender.com';
  }

  // Development → pick by platform + device type
  if (isIOSSimulator()) {
    return Config.API_BASE_URL_IOS_SIMULATOR ?? 'http://localhost:8080';
  }

  if (isAndroidEmulator()) {
    return Config.API_BASE_URL_ANDROID_EMULATOR ?? 'http://10.0.2.2:8080';
  }

  if (Platform.OS === 'ios') {
    // Physical iOS device — must use LAN IP
    return Config.API_BASE_URL_IOS_PHYSICAL ?? 'http://192.168.1.5:8080';
  }

  if (Platform.OS === 'android') {
    // Physical Android device — must use LAN IP
    return Config.API_BASE_URL_ANDROID_PHYSICAL ?? 'http://192.168.1.5:8080';
  }

  // Fallback
  return Config.API_BASE_URL ?? 'http://localhost:8080';
}

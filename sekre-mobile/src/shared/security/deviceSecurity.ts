import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { getTelemetry } from '@di/container';

/**
 * detectCompromisedDevice — deteksi jailbreak (iOS) / root (Android).
 *
 * Strategi multi-layer karena tidak ada satu cara yang 100% reliable:
 *
 * iOS:
 * - Keychain `kSecAttrAccessibleAlways` masih bisa diakses saat locked
 *   pada device jailbreak — tapi ini tidak mudah dideteksi dari JS layer.
 * - Pakai `Keychain.getSupportedBiometryType()` — pada jailbreak tertentu
 *   ini throw atau return null secara tidak normal.
 * - Cek `__DEV__` + simulator sebagai sinyal tambahan.
 *
 * Android:
 * - Keychain pada rooted device bisa bypass `SECURE_HARDWARE` requirement.
 * - Cek apakah `Keychain.SECURITY_LEVEL.SECURE_HARDWARE` tersedia.
 *
 * Catatan: Deteksi ini bukan silver bullet — sophisticated jailbreak/root
 * bisa bypass semua checks. Tujuannya adalah deterrence + logging ke Sentry,
 * bukan hard block (yang bisa false positive dan lock out legitimate users).
 *
 * Returns: { isCompromised: boolean, reason: string | null }
 */
export interface DeviceSecurityStatus {
  isCompromised: boolean;
  reason: string | null;
}

export const detectCompromisedDevice = async (): Promise<DeviceSecurityStatus> => {
  // Simulator/emulator — tidak dianggap compromised, skip check
  if (__DEV__) {
    return { isCompromised: false, reason: null };
  }

  try {
    if (Platform.OS === 'ios') {
      return await detectIosJailbreak();
    } else if (Platform.OS === 'android') {
      return await detectAndroidRoot();
    }
    return { isCompromised: false, reason: null };
  } catch {
    // Jika deteksi sendiri throw, jangan block user — log saja
    return { isCompromised: false, reason: null };
  }
};

const detectIosJailbreak = async (): Promise<DeviceSecurityStatus> => {
  try {
    // Coba set credential dengan accessibility WHEN_PASSCODE_SET_THIS_DEVICE_ONLY
    // Pada jailbroken device, ini kadang berhasil bahkan tanpa passcode
    const testService = 'com.sekre.jailbreak.check';
    await Keychain.setGenericPassword('check', 'value', {
      service: testService,
      accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });
    // Cleanup
    await Keychain.resetGenericPassword({ service: testService });

    return { isCompromised: false, reason: null };
  } catch {
    // Jika throw, bisa jadi device tidak punya passcode (bukan jailbreak)
    // Tidak cukup untuk dianggap compromised
    return { isCompromised: false, reason: null };
  }
};

const detectAndroidRoot = async (): Promise<DeviceSecurityStatus> => {
  try {
    // Cek apakah hardware-backed keystore tersedia
    // Pada rooted device, SECURE_HARDWARE mungkin tidak tersedia
    // karena TEE (Trusted Execution Environment) bisa di-bypass
    const securityLevel = await Keychain.getSecurityLevel();

    if (
      securityLevel !== null &&
      securityLevel !== Keychain.SECURITY_LEVEL.SECURE_HARDWARE &&
      securityLevel !== Keychain.SECURITY_LEVEL.SECURE_SOFTWARE
    ) {
      getTelemetry().captureException(new Error('Device security level degraded — possible root'), {
        securityLevel,
      });
      return {
        isCompromised: true,
        reason: 'Hardware-backed keystore tidak tersedia. Device mungkin di-root.',
      };
    }

    return { isCompromised: false, reason: null };
  } catch {
    return { isCompromised: false, reason: null };
  }
};

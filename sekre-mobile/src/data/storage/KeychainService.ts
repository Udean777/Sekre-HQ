import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.sekre.mmkv.encryptionKey';
const KEYCHAIN_USERNAME = 'mmkv_key';
const FALLBACK_KEY = 'sekre-mmkv-fallback-key';

/**
 * KeychainService — generate, store, dan retrieve MMKV encryption key
 * dari iOS Keychain / Android Keystore.
 *
 * Alur:
 * 1. Coba ambil key yang sudah tersimpan di Keychain
 * 2. Jika belum ada, generate key baru dan simpan ke Keychain
 * 3. Jika Keychain tidak tersedia (emulator/error), gunakan fallback key
 */
export class KeychainService {
  /**
   * Ambil atau buat encryption key untuk MMKV.
   * Selalu return string — tidak pernah throw.
   */
  static async getOrCreateEncryptionKey(): Promise<string> {
    try {
      // Coba ambil key yang sudah ada
      const existing = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE,
      });

      if (existing && existing.password) {
        return existing.password;
      }

      // Generate key baru
      const newKey = KeychainService.generateKey();

      await Keychain.setGenericPassword(KEYCHAIN_USERNAME, newKey, {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

      return newKey;
    } catch (error) {
      console.warn('[KeychainService] Keychain tidak tersedia, menggunakan fallback key:', error);
      return FALLBACK_KEY;
    }
  }

  /**
   * Hapus encryption key dari Keychain.
   * Dipanggil saat reset app / uninstall.
   */
  static async deleteEncryptionKey(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    } catch (error) {
      console.warn('[KeychainService] Gagal menghapus key dari Keychain:', error);
    }
  }

  /**
   * Generate random hex string 32 karakter sebagai encryption key.
   */
  private static generateKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

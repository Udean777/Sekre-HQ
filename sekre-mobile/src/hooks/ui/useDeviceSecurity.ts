import { useEffect } from 'react';
import { Alert } from 'react-native';
import { detectCompromisedDevice } from '@shared/security/deviceSecurity';

/**
 * useDeviceSecurity — jalankan device security check saat mount.
 *
 * Tampilkan Alert warning (bukan hard block) jika device terdeteksi
 * jailbreak/root. User masih bisa dismiss dan lanjut pakai app.
 *
 * Panggil di RootNavigator atau App.tsx — cukup sekali per session.
 */
export const useDeviceSecurity = (): void => {
  useEffect(() => {
    void detectCompromisedDevice().then(({ isCompromised, reason }) => {
      if (!isCompromised) return;

      Alert.alert(
        'Peringatan Keamanan',
        reason ??
          'Perangkat Anda terdeteksi telah dimodifikasi (jailbreak/root). ' +
            'Penggunaan aplikasi pada perangkat yang dimodifikasi dapat membahayakan keamanan data Anda.',
        [{ text: 'Mengerti', style: 'default' }],
        { cancelable: false },
      );
    });
  }, []);
};

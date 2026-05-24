import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/**
 * setupOnlineManager — wire NetInfo → React Query onlineManager.
 *
 * Tanpa ini, React Query tidak tahu saat device offline/online dan
 * tidak akan retry query yang gagal karena network saat koneksi pulih.
 *
 * Panggil sekali di app entry point (index.js) sebelum AppRegistry.
 */
export const setupOnlineManager = (): void => {
  onlineManager.setEventListener(setOnline => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    return unsubscribe;
  });
};

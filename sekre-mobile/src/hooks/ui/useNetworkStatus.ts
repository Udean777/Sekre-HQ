import { useState, useEffect } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  isOffline: boolean;
}

/**
 * useNetworkStatus — subscribe ke NetInfo dan expose status koneksi.
 *
 * `isOffline` = true hanya jika BOTH isConnected=false OR isInternetReachable=false.
 * Ini menghindari false positive saat isInternetReachable masih null (belum diketahui).
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    isOffline: false,
  });

  useEffect(() => {
    // Fetch status awal
    void NetInfo.fetch().then((state: NetInfoState) => {
      const isConnected = state.isConnected === true;
      const isInternetReachable = state.isInternetReachable !== false;
      setStatus({
        isConnected,
        isInternetReachable,
        isOffline: !isConnected || !isInternetReachable,
      });
    });

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected === true;
      // isInternetReachable bisa null saat pertama kali — treat null sebagai reachable
      // supaya tidak false positive saat app baru buka
      const isInternetReachable = state.isInternetReachable !== false;
      setStatus({
        isConnected,
        isInternetReachable,
        isOffline: !isConnected || !isInternetReachable,
      });
    });

    return unsubscribe;
  }, []);

  return status;
};

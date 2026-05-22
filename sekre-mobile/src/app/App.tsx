import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { ReduxProvider } from './providers/ReduxProvider';
import { QueryProvider } from './providers/QueryProvider';
import { RootNavigator } from './navigation/RootNavigator';
import { ErrorBoundary } from '@presentation/components/ErrorBoundary';
import { ToastContainer } from '@presentation/components/Toast';
import { initTokenStorage } from '@data/storage/MmkvTokenStorage';
import { colors } from '@presentation/theme';
import '@shared/i18n';

const App: React.FC = () => {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    // initTokenStorage HARUS selesai sebelum navigator render
    // supaya MMKV pakai Keychain key yang benar saat bootstrap auth
    initTokenStorage().finally(() => {
      setStorageReady(true);
    });
  }, []);

  if (!storageReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <ReduxProvider>
            <QueryProvider>
              <RootNavigator />
              <ToastContainer />
            </QueryProvider>
          </ReduxProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.background,
  },
});

export default App;

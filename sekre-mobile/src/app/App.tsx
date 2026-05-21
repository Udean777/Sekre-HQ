import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ReduxProvider } from './providers/ReduxProvider';
import { QueryProvider } from './providers/QueryProvider';
import { RootNavigator } from './navigation/RootNavigator';
import { ErrorBoundary } from '@presentation/components/ErrorBoundary';
import { ToastContainer } from '@presentation/components/Toast';
import { initTokenStorage } from '@data/storage/MmkvTokenStorage';
import '@shared/i18n';

const App: React.FC = () => {
  useEffect(() => {
    void initTokenStorage();
  }, []);

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
});

export default App;

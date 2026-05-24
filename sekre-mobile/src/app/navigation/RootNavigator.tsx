import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, DeviceEventEmitter } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Sentry from '@sentry/react-native';
import BootSplash from 'react-native-bootsplash';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { MembersNavigator } from './MembersNavigator';
import { DivisionsNavigator } from './DivisionsNavigator';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { clearSession, selectIsAuthenticated } from '@store/slices/authSlice';
import { tokenStorage } from '@data/storage/MmkvTokenStorage';
import { useBootstrapAuth } from '@hooks/auth/useBootstrapAuth';
import { useDeviceSecurity } from '@hooks/ui/useDeviceSecurity';
import { ScreenErrorBoundary } from '@presentation/components/ErrorBoundary';
import { OfflineBanner } from '@presentation/components/OfflineBanner';
import { colors } from '@presentation/theme';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  Members: undefined;
  Divisions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * navigationIntegration dibuat di module scope supaya instance yang sama
 * dipakai di sentryInit.ts (integrations: [navigationIntegration]) dan
 * di NavigationContainer onReady (registerNavigationContainer).
 *
 * Pola ini adalah cara resmi Sentry RN v8 untuk React Navigation.
 */
export const navigationIntegration = Sentry.reactNavigationIntegration();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { isBootstrapping } = useBootstrapAuth();
  useDeviceSecurity();

  // navigationRef dipakai oleh Sentry untuk melacak screen transitions
  // sebagai performance transactions di Sentry Performance dashboard
  const navigationRef = useRef<React.ComponentRef<typeof NavigationContainer>>(null);

  // Listen untuk event logout dari refreshInterceptor
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('auth:logout', () => {
      tokenStorage.clear();
      dispatch(clearSession());
    });

    return (): void => subscription.remove();
  }, [dispatch]);

  // Hide splash screen setelah bootstrap selesai
  useEffect(() => {
    if (!isBootstrapping) {
      void BootSplash.hide({ fade: true });
    }
  }, [isBootstrapping]);

  // Splash / loading saat bootstrap
  if (isBootstrapping) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScreenErrorBoundary>
      <OfflineBanner />
      <NavigationContainer
        ref={navigationRef}
        onReady={(): void => {
          navigationIntegration.registerNavigationContainer(navigationRef);
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="App" component={AppNavigator} options={{ animation: 'fade' }} />
              <Stack.Screen name="Members" component={MembersNavigator} />
              <Stack.Screen name="Divisions" component={DivisionsNavigator} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} options={{ animation: 'fade' }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ScreenErrorBoundary>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.background,
  },
});

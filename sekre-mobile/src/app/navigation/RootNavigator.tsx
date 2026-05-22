import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, DeviceEventEmitter } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { MembersNavigator } from './MembersNavigator';
import { DivisionsNavigator } from './DivisionsNavigator';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { clearSession } from '@store/slices/authSlice';
import { tokenStorage } from '@data/storage/MmkvTokenStorage';
import { useBootstrapAuth } from '@hooks/auth/useBootstrapAuth';
import { colors } from '@presentation/theme';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  Members: undefined;
  Divisions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const { isBootstrapping } = useBootstrapAuth();

  // Listen untuk event logout dari refreshInterceptor
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('auth:logout', () => {
      tokenStorage.clear();
      dispatch(clearSession());
    });

    return () => subscription.remove();
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
    <NavigationContainer>
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

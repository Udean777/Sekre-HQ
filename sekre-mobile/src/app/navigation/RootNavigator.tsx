import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, DeviceEventEmitter } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { clearSession } from '@store/slices/authSlice';
import { tokenStorage } from '@data/storage/MmkvTokenStorage';
import { useBootstrapAuth } from '@hooks/auth/useBootstrapAuth';
import { colors } from '@presentation/theme';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
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
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
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

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from '@presentation/screens/settings/SettingsScreen';
import { UpdateProfileScreen } from '@presentation/screens/settings/UpdateProfileScreen';
import { ChangePasswordScreen } from '@presentation/screens/settings/ChangePasswordScreen';
import { OrganizationSettingsScreen } from '@presentation/screens/settings/OrganizationSettingsScreen';
import { colors } from '@presentation/theme';

export type SettingsStackParamList = {
  SettingsHome: undefined;
  UpdateProfile: undefined;
  ChangePassword: undefined;
  OrganizationSettings: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Kembali',
        headerTintColor: colors.primary[500],
        headerStyle: { backgroundColor: colors.surface.card },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpdateProfile"
        component={UpdateProfileScreen}
        options={{ title: 'Edit Profil' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Ganti Password' }}
      />
      <Stack.Screen
        name="OrganizationSettings"
        component={OrganizationSettingsScreen}
        options={{ title: 'Pengaturan Organisasi' }}
      />
    </Stack.Navigator>
  );
};

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DivisionListScreen } from '@presentation/screens/divisions/DivisionListScreen';
import { DivisionDetailScreen } from '@presentation/screens/divisions/DivisionDetailScreen';
import { CreateDivisionScreen } from '@presentation/screens/divisions/CreateDivisionScreen';
import { EditDivisionScreen } from '@presentation/screens/divisions/EditDivisionScreen';
import { colors } from '@presentation/theme';
import type { DivisionId } from '@core/domain/entities/Division';

export type DivisionsStackParamList = {
  DivisionList: undefined;
  DivisionDetail: { divisionId: DivisionId };
  CreateDivision: undefined;
  EditDivision: { divisionId: DivisionId };
};

const Stack = createNativeStackNavigator<DivisionsStackParamList>();

export const DivisionsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Kembali',
        headerTintColor: colors.primary[500],
        headerStyle: {
          backgroundColor: colors.surface.card,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="DivisionList"
        component={DivisionListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DivisionDetail"
        component={DivisionDetailScreen}
        options={{ title: 'Detail Divisi' }}
      />
      <Stack.Screen
        name="CreateDivision"
        component={CreateDivisionScreen}
        options={{ title: 'Buat Divisi' }}
      />
      <Stack.Screen
        name="EditDivision"
        component={EditDivisionScreen}
        options={{ title: 'Edit Divisi' }}
      />
    </Stack.Navigator>
  );
};

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FinanceScreen } from '@presentation/screens/finance/FinanceScreen';
import { TransactionDetailScreen } from '@presentation/screens/finance/TransactionDetailScreen';
import { CreateTransactionScreen } from '@presentation/screens/finance/CreateTransactionScreen';
import { EditTransactionScreen } from '@presentation/screens/finance/EditTransactionScreen';
import { colors } from '@presentation/theme';
import type { TransactionId } from '@core/domain/entities/Transaction';

export type FinanceStackParamList = {
  FinanceList: undefined;
  TransactionDetail: { transactionId: TransactionId };
  CreateTransaction: undefined;
  EditTransaction: { transactionId: TransactionId };
};

const Stack = createNativeStackNavigator<FinanceStackParamList>();

export const FinanceNavigator: React.FC = () => {
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
      <Stack.Screen name="FinanceList" component={FinanceScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: 'Detail Transaksi' }}
      />
      <Stack.Screen
        name="CreateTransaction"
        component={CreateTransactionScreen}
        options={{ title: 'Tambah Transaksi' }}
      />
      <Stack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{ title: 'Edit Transaksi' }}
      />
    </Stack.Navigator>
  );
};

import React from 'react';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';

export const DashboardScreen: React.FC = () => {
  return (
    <Screen>
      <AppText variant="h3">Dashboard</AppText>
      <AppText variant="bodyMd" color="#6B7280">
        Placeholder — akan diimplementasi di Fase 3
      </AppText>
    </Screen>
  );
};

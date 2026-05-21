import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@store/index';
import { AppText } from '@presentation/components/Text';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<AppText variant="bodyMd">Memuat...</AppText>}
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
};

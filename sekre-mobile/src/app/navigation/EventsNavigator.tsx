import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventListScreen } from '@presentation/screens/events/EventListScreen';
import { EventDetailScreen } from '@presentation/screens/events/EventDetailScreen';
import { CreateEventScreen } from '@presentation/screens/events/CreateEventScreen';
import { EditEventScreen } from '@presentation/screens/events/EditEventScreen';
import { colors } from '@presentation/theme';
import type { EventId } from '@core/domain/entities/Event';

export type EventsStackParamList = {
  EventList: undefined;
  EventDetail: { eventId: EventId };
  CreateEvent: undefined;
  EditEvent: { eventId: EventId };
};

const Stack = createNativeStackNavigator<EventsStackParamList>();

export const EventsNavigator: React.FC = () => {
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
      <Stack.Screen name="EventList" component={EventListScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Detail Acara' }}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ title: 'Buat Acara' }}
      />
      <Stack.Screen
        name="EditEvent"
        component={EditEventScreen}
        options={{ title: 'Edit Acara' }}
      />
    </Stack.Navigator>
  );
};

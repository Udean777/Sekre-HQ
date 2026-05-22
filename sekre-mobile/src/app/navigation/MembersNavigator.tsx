import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MemberListScreen } from '@presentation/screens/members/MemberListScreen';
import { InviteMemberScreen } from '@presentation/screens/members/InviteMemberScreen';
import { EditMemberScreen } from '@presentation/screens/members/EditMemberScreen';
import { colors } from '@presentation/theme';
import type { MemberId } from '@core/domain/entities/Member';

const BackButton: React.FC = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="chevron-back" size={24} color={colors.primary[500]} />
    </TouchableOpacity>
  );
};

export type MembersStackParamList = {
  MemberList: undefined;
  InviteMember: undefined;
  EditMember: { memberId: MemberId };
};

const Stack = createNativeStackNavigator<MembersStackParamList>();

export const MembersNavigator: React.FC = () => {
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
        name="MemberList"
        component={MemberListScreen}
        options={{ title: 'Anggota', headerLeft: () => <BackButton /> }}
      />
      <Stack.Screen
        name="InviteMember"
        component={InviteMemberScreen}
        options={{ title: 'Undang Anggota' }}
      />
      <Stack.Screen
        name="EditMember"
        component={EditMemberScreen}
        options={{ title: 'Edit Peran' }}
      />
    </Stack.Navigator>
  );
};

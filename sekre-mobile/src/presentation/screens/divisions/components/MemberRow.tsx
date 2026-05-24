import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '@presentation/components/Text';
import { Badge, type BadgeVariant } from '@presentation/components/Badge';
import { Avatar } from '@presentation/components/Avatar';
import { colors, spacing, fontWeight } from '@presentation/theme';
import type { DivisionMember, DivisionRole } from '@core/domain/entities/Division';

const ROLE_VARIANT: Record<DivisionRole, BadgeVariant> = {
  HEAD: 'primary',
  STAFF: 'default',
};

const ROLE_LABEL: Record<DivisionRole, string> = {
  HEAD: 'Ketua',
  STAFF: 'Staf',
};

export interface MemberRowProps {
  member: DivisionMember;
  canManage: boolean;
  onRemove: () => void;
}

export const MemberRow: React.FC<MemberRowProps> = ({ member, canManage, onRemove }) => (
  <View style={styles.row}>
    <Avatar name={member.fullName} size={40} />
    <View style={styles.info}>
      <AppText variant="bodyMd" style={styles.name} numberOfLines={1}>
        {member.fullName}
      </AppText>
      <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
        {member.email}
      </AppText>
    </View>
    <View style={styles.right}>
      <Badge label={ROLE_LABEL[member.role]} variant={ROLE_VARIANT[member.role]} />
      {canManage ? (
        <TouchableOpacity
          onPress={onRemove}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger.main} />
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  info: {
    flex: 1,
    gap: spacing[1],
  },
  name: {
    fontWeight: fontWeight.medium,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});

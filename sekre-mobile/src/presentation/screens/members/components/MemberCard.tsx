import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '@presentation/components/Card';
import { AppText } from '@presentation/components/Text';
import { Badge, roleVariant } from '@presentation/components/Badge';
import { Avatar } from '@presentation/components/Avatar';
import { colors, spacing, fontWeight } from '@presentation/theme';
import type { Member, OrgRole } from '@core/domain/entities/Member';

const ROLE_LABEL: Readonly<Record<OrgRole, string>> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
} as const;

export interface MemberCardProps {
  member: Member;
  canManage: boolean;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export const MemberCard: React.FC<MemberCardProps> = React.memo(
  ({ member, canManage, onEdit, onDelete }) => {
    const handleEdit = useCallback((): void => onEdit(member), [onEdit, member]);
    const handleDelete = useCallback((): void => onDelete(member), [onDelete, member]);

    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <Avatar name={member.fullName} size={44} />
          <View style={styles.info}>
            <AppText variant="bodyMd" style={styles.name} numberOfLines={1}>
              {member.fullName}
            </AppText>
            <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
              {member.email}
            </AppText>
          </View>
          <View style={styles.right}>
            <Badge label={ROLE_LABEL[member.role]} variant={roleVariant(member.role)} />
            {canManage && member.role !== 'OWNER' ? (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleEdit}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil-outline" size={17} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={17} color={colors.danger.main} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  info: {
    flex: 1,
    gap: spacing[1],
  },
  name: {
    fontWeight: fontWeight.semiBold,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
});

import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '@presentation/components/Card';
import { AppText } from '@presentation/components/Text';
import { colors, spacing, fontWeight } from '@presentation/theme';
import type { Division } from '@core/domain/entities/Division';

export interface DivisionCardProps {
  division: Division;
  canManage: boolean;
  onPress: (division: Division) => void;
  onEdit: (division: Division) => void;
  onDelete: (division: Division) => void;
}

export const DivisionCard: React.FC<DivisionCardProps> = React.memo(
  ({ division, canManage, onPress, onEdit, onDelete }) => {
    const handlePress = useCallback((): void => onPress(division), [onPress, division]);
    const handleEdit = useCallback(
      (e: { stopPropagation: () => void }): void => {
        e.stopPropagation();
        onEdit(division);
      },
      [onEdit, division],
    );
    const handleDelete = useCallback(
      (e: { stopPropagation: () => void }): void => {
        e.stopPropagation();
        onDelete(division);
      },
      [onDelete, division],
    );

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name="git-branch-outline" size={20} color={colors.primary[500]} />
            </View>

            <View style={styles.info}>
              <AppText variant="bodyMd" style={styles.name} numberOfLines={1}>
                {division.name}
              </AppText>
              <AppText variant="bodySm" color={colors.text.secondary}>
                {division.memberCount > 0 ? `${division.memberCount} anggota` : 'Belum ada anggota'}
              </AppText>
            </View>

            {canManage ? (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleEdit}
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger.main} />
                </TouchableOpacity>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing[1],
  },
  name: {
    fontWeight: fontWeight.semiBold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  iconButton: {
    padding: spacing[1],
  },
});

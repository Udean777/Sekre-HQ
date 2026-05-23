import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Input } from '@presentation/components/Input';
import { Button } from '@presentation/components/Button';
import { SkeletonList } from '@presentation/components/Skeleton';
import { EmptyState } from '@presentation/components/EmptyState';
import { colors, spacing, fontWeight } from '@presentation/theme';
import { useDivisionsQuery } from '@hooks/divisions/useDivisionsQuery';
import { useDeleteDivisionMutation } from '@hooks/divisions/useDeleteDivisionMutation';
import { useAppSelector } from '@store/hooks';
import type { Division } from '@core/domain/entities/Division';
import type { DivisionsStackParamList } from '@app/navigation/DivisionsNavigator';

type Props = NativeStackScreenProps<DivisionsStackParamList, 'DivisionList'>;

// ─── Division Card ────────────────────────────────────────────────────────────

interface DivisionCardProps {
  division: Division;
  canManage: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DivisionCard: React.FC<DivisionCardProps> = ({
  division,
  canManage,
  onPress,
  onEdit,
  onDelete,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Card style={styles.divisionCard}>
      <View style={styles.cardHeader}>
        {/* Icon */}
        <View style={styles.divisionIcon}>
          <Ionicons name="git-branch-outline" size={20} color={colors.primary[500]} />
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <AppText variant="bodyMd" style={styles.divisionName} numberOfLines={1}>
            {division.name}
          </AppText>
          <AppText variant="bodySm" color={colors.text.secondary}>
            {division.memberCount > 0 ? `${division.memberCount} anggota` : 'Belum ada anggota'}
          </AppText>
        </View>

        {/* Actions */}
        {canManage ? (
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                onEdit();
              }}
              style={styles.iconButton}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                onDelete();
              }}
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

// ─── Screen ──────────────────────────────────────────────────────────────────

export const DivisionListScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const role = useAppSelector(state => state.auth.role);
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const { data, isLoading, isError, refetch, isFetching } = useDivisionsQuery({
    search: search.trim() || undefined,
    limit: 50,
  });

  const { mutate: deleteDivision } = useDeleteDivisionMutation();

  const handlePress = useCallback(
    (division: Division) => {
      navigation.navigate('DivisionDetail', { divisionId: division.id });
    },
    [navigation],
  );

  const handleCreate = useCallback(() => {
    navigation.navigate('CreateDivision');
  }, [navigation]);

  const handleEdit = useCallback(
    (division: Division) => {
      navigation.navigate('EditDivision', { divisionId: division.id });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (division: Division) => {
      Alert.alert('Hapus Divisi', `Apakah Anda yakin ingin menghapus divisi "${division.name}"?`, [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: (): void => deleteDivision(division.id),
        },
      ]);
    },
    [deleteDivision],
  );

  const renderDivision = useCallback(
    ({ item }: { item: Division }) => (
      <DivisionCard
        division={item}
        canManage={canManage}
        onPress={() => handlePress(item)}
        onEdit={() => handleEdit(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [canManage, handlePress, handleEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: Division) => item.id, []);

  return (
    <Screen padded edges={[]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <AppText variant="h3">Divisi</AppText>
        {canManage ? (
          <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      {/* ── Search ── */}
      <Input
        placeholder="Cari divisi..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* ── Total ── */}
      {!isLoading && !isError && data ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {data.total} divisi ditemukan
        </AppText>
      ) : null}

      {/* ── List ── */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : isError ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger.main} />
          <AppText variant="bodySm" color={colors.danger.main} style={styles.errorText}>
            Gagal memuat divisi.
          </AppText>
          <Button
            label="Coba Lagi"
            variant="ghost"
            size="sm"
            onPress={() => {
              refetch();
            }}
            style={styles.retryButton}
          />
        </View>
      ) : (
        <FlatList
          data={data?.divisions ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderDivision}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => {
                refetch();
              }}
              tintColor={colors.primary[500]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title="Belum ada divisi"
              description="Buat divisi untuk mengorganisir anggota tim."
              actionLabel={canManage ? '+ Buat Divisi' : undefined}
              onAction={canManage ? handleCreate : undefined}
            />
          }
        />
      )}
    </Screen>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  searchInput: {
    marginBottom: spacing[2],
  },
  totalText: {
    marginBottom: spacing[3],
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing[3],
    paddingBottom: spacing[6],
  },

  // Card
  divisionCard: {
    paddingVertical: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  divisionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: spacing[1],
  },
  divisionName: {
    fontWeight: fontWeight.semiBold,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  iconButton: {
    padding: spacing[1],
  },

  // States
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
    gap: spacing[2],
  },
  errorText: {
    marginTop: spacing[1],
  },
  retryButton: {
    marginTop: spacing[1],
  },
});

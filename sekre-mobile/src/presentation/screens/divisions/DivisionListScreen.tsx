import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
        <View style={styles.cardInfo}>
          <AppText variant="bodyMd" style={styles.divisionName}>
            {division.name}
          </AppText>
          <AppText variant="bodySm" color={colors.text.secondary}>
            {division.memberCount} anggota
          </AppText>
        </View>
        {canManage ? (
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                onEdit();
              }}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <AppText variant="bodySm" color={colors.primary[500]}>
                Edit
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                onDelete();
              }}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <AppText variant="bodySm" color={colors.danger.main}>
                Hapus
              </AppText>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {division.description ? (
        <AppText
          variant="bodySm"
          color={colors.text.secondary}
          numberOfLines={2}
          style={styles.description}
        >
          {division.description}
        </AppText>
      ) : null}
    </Card>
  </TouchableOpacity>
);

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
          onPress: () => deleteDivision(division.id),
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
    <Screen padded>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h3">Divisi</AppText>
        {canManage ? (
          <Button label="+ Buat" variant="primary" size="sm" onPress={handleCreate} />
        ) : null}
      </View>

      {/* Search */}
      <Input
        placeholder="Cari divisi..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* Total */}
      {!isLoading && !isError && data ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.totalText}>
          {data.total} divisi
        </AppText>
      ) : null}

      {/* List */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : isError ? (
        <View style={styles.centered}>
          <AppText variant="bodySm" color={colors.danger.main}>
            Gagal memuat divisi.
          </AppText>
          <Button
            label="Coba Lagi"
            variant="ghost"
            size="sm"
            onPress={() => void refetch()}
            style={styles.retryButton}
          />
        </View>
      ) : (
        <FlatList
          data={data?.divisions ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderDivision}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => void refetch()}
              tintColor={colors.primary[500]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🏢"
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
  listContent: {
    gap: spacing[3],
    paddingBottom: spacing[6],
  },
  divisionCard: {
    gap: spacing[2],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[2],
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
    gap: spacing[3],
  },
  iconButton: {
    paddingVertical: spacing[1],
  },
  description: {
    marginTop: spacing[1],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  retryButton: {
    marginTop: spacing[2],
  },
});

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, taskStatusVariant, type BadgeVariant } from '@presentation/components/Badge';
import { colors, spacing, fontSize, fontWeight } from '@presentation/theme';
import { useAppSelector } from '@store/hooks';
import { useTasksQuery } from '@hooks/tasks/useTasksQuery';
import type { TaskStatus } from '@core/domain/entities/Task';

interface StatCardProps {
  label: string;
  count: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, count, color }) => (
  <Card style={styles.statCard}>
    <AppText style={[styles.statCount, { color }]}>{count}</AppText>
    <AppText variant="bodySm" color={colors.text.secondary}>
      {label}
    </AppText>
  </Card>
);

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: 'Belum Mulai', color: colors.neutral[500] },
  IN_PROGRESS: { label: 'Sedang Berjalan', color: colors.info.main },
  DONE: { label: 'Selesai', color: colors.success.main },
  CANCELLED: { label: 'Dibatalkan', color: colors.danger.main },
};

const PLAN_VARIANT: Record<string, BadgeVariant> = {
  FREE: 'default',
  LITE: 'info',
  PRO: 'primary',
};

export const DashboardScreen: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);
  const organization = useAppSelector(state => state.auth.organization);
  const role = useAppSelector(state => state.auth.role);

  const { data, isLoading, isError } = useTasksQuery({ limit: 100 });

  const tasksByStatus = React.useMemo(() => {
    if (!data) return { TODO: 0, IN_PROGRESS: 0, DONE: 0, CANCELLED: 0 };
    return data.tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] ?? 0) + 1;
        return acc;
      },
      { TODO: 0, IN_PROGRESS: 0, DONE: 0, CANCELLED: 0 } as Record<TaskStatus, number>,
    );
  }, [data]);

  const plan = organization?.subscriptionPlan ?? 'FREE';

  return (
    <Screen scrollable padded>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Selamat datang,
          </AppText>
          <AppText variant="h3">{user?.fullName ?? '-'}</AppText>
        </View>
        <View style={styles.headerRight}>
          <Badge
            label={plan}
            variant={PLAN_VARIANT[plan] ?? 'default'}
          />
          <AppText variant="bodySm" color={colors.text.secondary} style={styles.roleText}>
            {role ?? '-'}
          </AppText>
        </View>
      </View>

      {/* Org info */}
      <Card style={styles.orgCard}>
        <AppText variant="label" color={colors.text.secondary}>
          Organisasi
        </AppText>
        <AppText variant="bodyMd" style={styles.orgName}>
          {organization?.name ?? '-'}
        </AppText>
        <AppText variant="bodySm" color={colors.text.secondary}>
          {organization?.subdomain ?? '-'}
        </AppText>
      </Card>

      {/* Task summary */}
      <AppText variant="h4" style={styles.sectionTitle}>
        Ringkasan Tugas
      </AppText>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      )}

      {isError && (
        <AppText variant="bodySm" color={colors.danger.main}>
          Gagal memuat data tugas.
        </AppText>
      )}

      {!isLoading && !isError && (
        <>
          <View style={styles.statsGrid}>
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(status => (
              <StatCard
                key={status}
                label={STATUS_CONFIG[status].label}
                count={tasksByStatus[status]}
                color={STATUS_CONFIG[status].color}
              />
            ))}
          </View>

          <Card style={styles.totalCard}>
            <AppText variant="bodySm" color={colors.text.secondary}>
              Total Tugas
            </AppText>
            <AppText style={styles.totalCount}>{data?.total ?? 0}</AppText>
          </Card>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  roleText: {
    marginTop: spacing[1],
  },
  orgCard: {
    marginBottom: spacing[5],
    gap: spacing[1],
  },
  orgName: {
    fontWeight: fontWeight.semiBold,
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  loadingContainer: {
    paddingVertical: spacing[6],
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: spacing[4],
    gap: spacing[1],
  },
  statCount: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  totalCount: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[500],
  },
});

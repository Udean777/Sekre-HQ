import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, type BadgeVariant } from '@presentation/components/Badge';
import { colors, spacing, fontSize, fontWeight } from '@presentation/theme';
import { useAppSelector } from '@store/hooks';
import { selectAuthUser, selectAuthOrganization, selectAuthRole } from '@store/slices/authSlice';
import { useTasksQuery } from '@hooks/tasks/useTasksQuery';
import { useEventsQuery } from '@hooks/events/useEventsQuery';
import { flattenPages, lastPageMeta } from '@shared/utils/infiniteQueryHelpers';
import type { TaskStatus } from '@core/domain/entities/Task';
import type { RootStackParamList } from '@app/navigation/RootNavigator';
import type { AppTabParamList } from '@app/navigation/AppNavigator';
import {
  StatCard,
  SectionHeader,
  TaskRow,
  EventRow,
  MenuShortcut,
} from './components';

type DashboardNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: 'Belum Mulai', color: colors.neutral[500] },
  IN_PROGRESS: { label: 'Berjalan', color: colors.info.main },
  DONE: { label: 'Selesai', color: colors.success.main },
  CANCELLED: { label: 'Dibatalkan', color: colors.danger.main },
};

const STATUS_CONFIG_KEYS: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

const PLAN_VARIANT: Record<string, BadgeVariant> = {
  FREE: 'default',
  LITE: 'info',
  PRO: 'primary',
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavProp>();
  const user = useAppSelector(selectAuthUser);
  const organization = useAppSelector(selectAuthOrganization);
  const role = useAppSelector(selectAuthRole);

  const {
    data: taskData,
    isLoading: taskLoading,
    isError: taskError,
  } = useTasksQuery({ pageSize: 20 });
  const { data: eventData, isLoading: eventLoading } = useEventsQuery({ pageSize: 10 });

  const taskItems = flattenPages(taskData);
  const taskMeta = lastPageMeta(taskData);
  const eventItems = flattenPages(eventData);

  const tasksByStatus = React.useMemo(() => {
    const base: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0, CANCELLED: 0 };
    return taskItems.reduce((acc: Record<TaskStatus, number>, task) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1;
      return acc;
    }, base);
  }, [taskItems]);

  const recentTasks = React.useMemo(
    () => [...taskItems].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3),
    [taskItems],
  );

  const upcomingEvents = React.useMemo(() => {
    const now = new Date();
    return eventItems
      .filter(e => e.startDate >= now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 3);
  }, [eventItems]);

  const plan = organization?.subscriptionPlan ?? 'FREE';

  return (
    <Screen scrollable padded edges={['top']} tabScreen>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <AppText variant="bodySm" color={colors.text.secondary}>
            Selamat datang,
          </AppText>
          <AppText variant="h3">{user?.fullName ?? '-'}</AppText>
        </View>
        <View style={styles.headerRight}>
          <Badge label={plan} variant={PLAN_VARIANT[plan] ?? 'default'} />
          <AppText variant="bodySm" color={colors.text.secondary} style={styles.roleText}>
            {role ?? '-'}
          </AppText>
        </View>
      </View>

      {/* ── Org info ── */}
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

      {/* ── Ringkasan Tugas ── */}
      <SectionHeader title="Ringkasan Tugas" />

      {taskLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : taskError ? (
        <AppText variant="bodySm" color={colors.danger.main} style={styles.errorText}>
          Gagal memuat data tugas.
        </AppText>
      ) : (
        <>
          <View style={styles.statsGrid}>
            {STATUS_CONFIG_KEYS.map(status => (
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
            <AppText style={styles.totalCount}>{taskMeta?.total ?? 0}</AppText>
          </Card>
        </>
      )}

      {/* ── Tugas Terbaru ── */}
      <SectionHeader title="Tugas Terbaru" onViewAll={() => navigation.navigate('Tasks')} />
      {taskLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : recentTasks.length === 0 ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.emptyText}>
          Belum ada tugas.
        </AppText>
      ) : (
        <Card style={styles.listCard}>
          {recentTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <TaskRow task={task} />
              {index < recentTasks.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>
      )}

      {/* ── Event Mendatang ── */}
      <SectionHeader title="Event Mendatang" onViewAll={() => navigation.navigate('Events')} />
      {eventLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : upcomingEvents.length === 0 ? (
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.emptyText}>
          Tidak ada event mendatang.
        </AppText>
      ) : (
        <Card style={styles.listCard}>
          {upcomingEvents.map((event, index) => (
            <React.Fragment key={event.id}>
              <EventRow event={event} />
              {index < upcomingEvents.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card>
      )}

      {/* ── Menu Lainnya ── */}
      <SectionHeader title="Menu Lainnya" />
      <MenuShortcut
        icon="people-outline"
        label="Anggota"
        description="Kelola anggota organisasi"
        onPress={() => navigation.navigate('Members')}
      />
      <MenuShortcut
        icon="git-branch-outline"
        label="Divisi"
        description="Kelola divisi & struktur organisasi"
        onPress={() => navigation.navigate('Divisions')}
      />
    </Screen>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

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
  loadingContainer: {
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  errorText: {
    marginBottom: spacing[4],
  },
  emptyText: {
    marginBottom: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    marginBottom: spacing[2],
  },
  totalCount: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[500],
  },
  listCard: {
    marginBottom: spacing[2],
    paddingVertical: 0,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing[4],
  },
});

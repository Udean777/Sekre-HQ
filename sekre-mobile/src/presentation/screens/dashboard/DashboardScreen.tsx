import React from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Screen } from '@presentation/components/Screen';
import { AppText } from '@presentation/components/Text';
import { Card } from '@presentation/components/Card';
import { Badge, taskStatusVariant, type BadgeVariant } from '@presentation/components/Badge';
import { colors, spacing, fontSize, fontWeight } from '@presentation/theme';
import { useAppSelector } from '@store/hooks';
import { useTasksQuery } from '@hooks/tasks/useTasksQuery';
import { useEventsQuery } from '@hooks/events/useEventsQuery';
import type { Task, TaskStatus } from '@core/domain/entities/Task';
import type { Event } from '@core/domain/entities/Event';
import type { RootStackParamList } from '@app/navigation/RootNavigator';
import type { AppTabParamList } from '@app/navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

const PLAN_VARIANT: Record<string, BadgeVariant> = {
  FREE: 'default',
  LITE: 'info',
  PRO: 'primary',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; count: number; color: string }> = ({
  label,
  count,
  color,
}) => (
  <Card style={styles.statCard}>
    <AppText style={[styles.statCount, { color }]}>{count}</AppText>
    <AppText variant="bodySm" color={colors.text.secondary}>
      {label}
    </AppText>
  </Card>
);

const SectionHeader: React.FC<{ title: string; onViewAll?: () => void }> = ({
  title,
  onViewAll,
}) => (
  <View style={styles.sectionHeader}>
    <AppText variant="h4">{title}</AppText>
    {onViewAll ? (
      <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
        <AppText variant="bodySm" color={colors.primary[500]}>
          Lihat Semua
        </AppText>
      </TouchableOpacity>
    ) : null}
  </View>
);

const TaskRow: React.FC<{ task: Task }> = ({ task }) => (
  <View style={styles.listRow}>
    <View style={styles.listRowContent}>
      <AppText variant="bodyMd" numberOfLines={1} style={styles.listRowTitle}>
        {task.title}
      </AppText>
      {task.assigneeName ? (
        <AppText variant="bodySm" color={colors.text.secondary} numberOfLines={1}>
          {task.assigneeName}
        </AppText>
      ) : null}
    </View>
    <Badge label={STATUS_CONFIG[task.status].label} variant={taskStatusVariant(task.status)} />
  </View>
);

const EventRow: React.FC<{ event: Event }> = ({ event }) => {
  const timeStr = event.startDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.listRow}>
      <View style={styles.eventDateBox}>
        <AppText variant="bodySm" style={styles.eventDay}>
          {event.startDate.getDate()}
        </AppText>
        <AppText variant="bodySm" color={colors.text.secondary} style={styles.eventMonth}>
          {event.startDate.toLocaleDateString('id-ID', { month: 'short' })}
        </AppText>
      </View>
      <View style={styles.listRowContent}>
        <AppText variant="bodyMd" numberOfLines={1} style={styles.listRowTitle}>
          {event.title}
        </AppText>
        <AppText variant="bodySm" color={colors.text.secondary}>
          {timeStr}
          {event.location ? ` · ${event.location}` : ''}
        </AppText>
      </View>
    </View>
  );
};

const MenuShortcut: React.FC<{
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
}> = ({ icon, label, description, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.shortcutItem}>
    <Card style={styles.shortcutCard}>
      <View style={styles.shortcutIcon}>
        <Ionicons name={icon} size={22} color={colors.primary[500]} />
      </View>
      <View style={styles.shortcutText}>
        <AppText variant="bodyMd" style={styles.shortcutLabel}>
          {label}
        </AppText>
        <AppText variant="bodySm" color={colors.text.secondary}>
          {description}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
    </Card>
  </TouchableOpacity>
);

// ─── Screen ──────────────────────────────────────────────────────────────────

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavProp>();
  const user = useAppSelector(state => state.auth.user);
  const organization = useAppSelector(state => state.auth.organization);
  const role = useAppSelector(state => state.auth.role);

  const {
    data: taskData,
    isLoading: taskLoading,
    isError: taskError,
  } = useTasksQuery({ limit: 100 });
  const { data: eventData, isLoading: eventLoading } = useEventsQuery({ limit: 10 });

  // Hitung task per status
  const tasksByStatus = React.useMemo(() => {
    const base = { TODO: 0, IN_PROGRESS: 0, DONE: 0, CANCELLED: 0 } as Record<TaskStatus, number>;
    if (!taskData) return base;
    return taskData.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1;
      return acc;
    }, base);
  }, [taskData]);

  // 3 task terbaru (urut berdasarkan updatedAt desc)
  const recentTasks = React.useMemo(() => {
    if (!taskData?.tasks) return [];
    return [...taskData.tasks]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 3);
  }, [taskData]);

  // 3 event mendatang (startDate >= sekarang, urut asc)
  const upcomingEvents = React.useMemo(() => {
    if (!eventData?.events) return [];
    const now = new Date();
    return eventData.events
      .filter(e => e.startDate >= now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 3);
  }, [eventData]);

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
            <AppText style={styles.totalCount}>{taskData?.total ?? 0}</AppText>
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
  // Header
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

  // Org card
  orgCard: {
    marginBottom: spacing[5],
    gap: spacing[1],
  },
  orgName: {
    fontWeight: fontWeight.semiBold,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[3],
  },

  // Loading / error / empty
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

  // Stats grid
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
    marginBottom: spacing[2],
  },
  totalCount: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[500],
  },

  // List card (tasks & events)
  listCard: {
    marginBottom: spacing[2],
    paddingVertical: 0,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  listRowContent: {
    flex: 1,
    gap: spacing[1],
  },
  listRowTitle: {
    fontWeight: fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing[4],
  },

  // Event date box
  eventDateBox: {
    width: 36,
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    paddingVertical: spacing[1],
  },
  eventDay: {
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
    fontSize: fontSize.lg,
  },
  eventMonth: {
    fontSize: fontSize.xs,
    color: colors.primary[500],
  },

  // Shortcuts
  shortcutItem: {
    marginBottom: spacing[3],
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: {
    flex: 1,
    gap: spacing[1],
  },
  shortcutLabel: {
    fontWeight: fontWeight.semiBold,
  },
});

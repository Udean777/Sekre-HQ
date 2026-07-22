import React from "react";
import { StyleSheet, View } from "react-native";
import {
  PlusIcon,
  WalletIcon,
  CheckSquareOffsetIcon,
  ChartLineUpIcon,
  UsersThreeIcon,
  CalendarBlankIcon,
  UsersIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from "phosphor-react-native";
import { ThemedScrollView } from "@/shared/ui/themed-scroll-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { useAuthStore } from "@/shared/store/auth-store";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useRouter } from "expo-router";

// Helper component for Quick Actions
const QuickAction = ({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) => {
  const theme = useTheme();
  return (
    <BouncingPressable
      style={styles.actionItem}
      scaleTo={0.9}
      onPress={onPress}
    >
      <View
        style={[
          styles.actionIconWrapper,
          { backgroundColor: theme.backgroundElement },
        ]}
      >
        {icon}
      </View>
      <ThemedText style={styles.actionLabel} numberOfLines={1}>
        {label}
      </ThemedText>
    </BouncingPressable>
  );
};

// Helper for Stat Cards
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <ThemedCard style={styles.statCard}>
    <View style={styles.statHeader}>
      {icon}
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
    </View>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
  </ThemedCard>
);

export default function DashboardScreen() {
  const { user, organization } = useAuthStore();
  const theme = useTheme();
  const router = useRouter();

  return (
    <ThemedSafeAreaView style={styles.wrapper}>
      <ThemedScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>
              Halo, selamat datang!
            </ThemedText>
            <ThemedText type="subtitle" style={styles.name}>
              {user?.full_name}
            </ThemedText>
          </View>
          <View
            style={[styles.orgBadge, { backgroundColor: theme.tint + "15" }]}
          >
            <UsersThreeIcon color={theme.tint} size={20} weight="fill" />
            <ThemedText style={[styles.orgName, { color: theme.tint }]}>
              {organization?.name}
            </ThemedText>
          </View>
        </View>

        {/* Main Banner */}
        <View style={[styles.banner, { backgroundColor: theme.tint }]}>
          <View style={styles.bannerContent}>
            <ThemedText style={styles.bannerTitle}>
              Musyawarah Besar 2026
            </ThemedText>
            <ThemedText style={styles.bannerSubtitle}>
              Acara terdekat dalam 14 hari
            </ThemedText>
          </View>
          <CalendarBlankIcon
            color="#ffffff"
            size={48}
            weight="duotone"
            style={styles.bannerIcon}
          />
        </View>

        {/* Quick Actions */}
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          AKSI CEPAT
        </ThemedText>
        <View style={styles.actionsContainer}>
          <QuickAction
            icon={<UsersIcon size={24} color={theme.tint} weight="fill" />}
            label="Member"
            onPress={() => router.push("/members")}
          />
          <QuickAction
            icon={
              <CheckCircleIcon size={24} color={theme.tint} weight="fill" />
            }
            label="Divisi"
            onPress={() => router.push("/divisions")}
          />
          <QuickAction
            icon={<WalletIcon size={24} color={theme.tint} weight="fill" />}
            label="Tugas"
            onPress={() => router.push("/(tabs)/tasks")}
          />
          <QuickAction
            icon={<ChartBarIcon size={24} color={theme.tint} weight="fill" />}
            label="Keuangan"
            onPress={() => router.push("/(tabs)/finance")}
          />
        </View>

        {/* Statistics Row */}
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          RINGKASAN
        </ThemedText>
        <View style={styles.statsRow}>
          <StatCard
            title="Tugas Aktif"
            value="12"
            icon={
              <CheckSquareOffsetIcon
                color={theme.tint}
                size={18}
                weight="fill"
              />
            }
          />
          <StatCard
            title="Saldo Kas"
            value="Rp 4.5M"
            icon={<WalletIcon color="#10b981" size={18} weight="fill" />}
          />
        </View>

        {/* Recent Activity Placeholder */}
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          AKTIVITAS TERBARU
        </ThemedText>
        <ThemedCard style={styles.activityCard}>
          <ThemedText style={styles.emptyText}>
            Belum ada aktivitas terbaru minggu ini.
          </ThemedText>
        </ThemedCard>
      </ThemedScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    lineHeight: 32,
  },
  orgBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    maxWidth: 140,
  },
  orgName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  banner: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: "#ffffff",
    opacity: 0.8,
    fontSize: 14,
  },
  bannerIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
    opacity: 0.2,
    transform: [{ scale: 2.5 }],
  },
  sectionTitle: {
    opacity: 0.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  actionItem: {
    alignItems: "center",
    width: "22%",
  },
  actionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  activityCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    opacity: 0.5,
    fontSize: 14,
    textAlign: "center",
  },
});

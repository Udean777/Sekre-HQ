import React from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import {
  UserCircleIcon,
  WarningCircleIcon,
  ShieldCheckIcon,
} from "phosphor-react-native";

import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { extractErrorMessage } from "@/shared/lib/utils/error";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "phosphor-react-native";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { Button } from "@/shared/ui/button";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useAlert } from "@/shared/context/alert-context";
import { useMembers, Member } from "@/features/member/use-members";
import { useUpdateMemberStatus } from "@/features/member/use-update-member-status";
import { useRemoveMember } from "@/features/member/use-remove-member";
import { useAuthStore } from "@/shared/store/auth-store";

export default function MembersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { alert } = useAlert();
  const currentUser = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.role);

  const {
    data: members,
    isLoading,
    refetch,
    isRefetching,
  } = useMembers({
    page: 1,
    page_size: 50,
  });

  const sortedMembers = React.useMemo(() => {
    if (!members) return [];
    return [...members].sort((a, b) => {
      if (a.id === currentUser?.id) return -1;
      if (b.id === currentUser?.id) return 1;
      return 0;
    });
  }, [members, currentUser?.id]);

  const updateStatusMutation = useUpdateMemberStatus();
  const removeMemberMutation = useRemoveMember();

  const handleToggleStatus = (member: Member) => {
    if (member.id === currentUser?.id) {
      alert("Aksi Ditolak", "Anda tidak dapat menangguhkan akun Anda sendiri.");
      return;
    }

    if (member.role === "OWNER") {
      alert(
        "Aksi Ditolak",
        "Anda tidak dapat menangguhkan pemilik (OWNER) organisasi.",
      );
      return;
    }

    const isSuspended = member.status === "SUSPENDED";
    const action = isSuspended ? "Mengaktifkan" : "Menangguhkan";
    const newStatus = isSuspended ? "ACTIVE" : "SUSPENDED";

    alert(
      `${action} Akun`,
      `Apakah Anda yakin ingin ${action.toLowerCase()} akun ${member.full_name}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Lanjutkan",
          style: isSuspended ? "default" : "destructive",
          onPress: () => {
            updateStatusMutation.mutate(
              { userId: member.id, status: newStatus },
              {
                onError: (error: any) => {
                  alert(
                    "Gagal",
                    extractErrorMessage(error, "Terjadi kesalahan."),
                  );
                },
                onSuccess: () => {
                  alert(
                    "Berhasil",
                    `Akun ${member.full_name} telah ${isSuspended ? "diaktifkan" : "ditangguhkan"}.`,
                  );
                },
              },
            );
          },
        },
      ],
    );
  };

  const handleRemove = (member: Member) => {
    if (member.id === currentUser?.id) {
      alert(
        "Aksi Ditolak",
        "Anda tidak dapat mengeluarkan diri Anda sendiri dari organisasi ini.",
      );
      return;
    }

    if (member.role === "OWNER") {
      alert(
        "Aksi Ditolak",
        "Anda tidak dapat mengeluarkan pemilik (OWNER) organisasi.",
      );
      return;
    }

    alert(
      "Keluarkan Anggota",
      `Apakah Anda yakin ingin mengeluarkan ${member.full_name} dari organisasi? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Keluarkan",
          style: "destructive",
          onPress: () => {
            removeMemberMutation.mutate(member.id, {
              onError: (error: any) => {
                alert(
                  "Gagal",
                  extractErrorMessage(error, "Terjadi kesalahan."),
                );
              },
              onSuccess: () => {
                alert(
                  "Berhasil",
                  `Anggota ${member.full_name} telah dikeluarkan.`,
                );
              },
            });
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Member }) => {
    const isSuspended = item.status === "SUSPENDED";
    const isSelf = currentUser?.id === item.id;
    const canManage =
      !isSelf &&
      (currentRole === "OWNER" ||
        (currentRole === "ADMIN" && item.role === "MEMBER"));

    return (
      <ThemedCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.memberInfo}>
            <UserCircleIcon color={theme.text} size={32} weight="fill" />
            <View style={styles.textContainer}>
              <ThemedText style={styles.memberName}>
                {item.full_name}
              </ThemedText>
              <ThemedText style={styles.memberEmail}>{item.email}</ThemedText>
            </View>
          </View>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <ShieldCheckIcon color={theme.tint} size={14} weight="fill" />
              <ThemedText style={[styles.badgeText, { color: theme.tint }]}>
                {item.role}
              </ThemedText>
            </View>
            {isSuspended && (
              <View style={[styles.badge, { backgroundColor: "#fee2e2" }]}>
                <WarningCircleIcon color="#ef4444" size={14} weight="fill" />
                <ThemedText style={[styles.badgeText, { color: "#ef4444" }]}>
                  DITANGGUHKAN
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {isSelf && (
          <View style={{ marginTop: 12 }}>
            <ThemedText
              style={{
                fontSize: 13,
                color: theme.textSecondary,
                fontStyle: "italic",
              }}
            >
              (Ini adalah Anda)
            </ThemedText>
          </View>
        )}

        {canManage && (
          <View style={styles.actions}>
            <Button
              title={isSuspended ? "Aktifkan Akun" : "Tangguhkan Akun"}
              variant={isSuspended ? "outline" : "danger-outline"}
              style={styles.actionButton}
              onPress={() => handleToggleStatus(item)}
              isLoading={
                updateStatusMutation.isPending &&
                updateStatusMutation.variables?.userId === item.id
              }
              disabled={removeMemberMutation.isPending}
            />
            <Button
              title="Keluarkan"
              variant="danger"
              style={styles.actionButton}
              onPress={() => handleRemove(item)}
              isLoading={
                removeMemberMutation.isPending &&
                removeMemberMutation.variables === item.id
              }
              disabled={updateStatusMutation.isPending}
            />
          </View>
        )}
      </ThemedCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedHeader title="Manajemen Member" showBackButton />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.tint} size="large" />
        </View>
      ) : (
        <FlashList
          data={sortedMembers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText>Tidak ada member yang ditemukan.</ThemedText>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  memberEmail: {
    fontSize: 12,
    opacity: 0.6,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "column",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    minHeight: 40,
  },
  suspendBtn: {
    borderColor: "#ef4444",
  },
  activateBtn: {},
  removeBtn: {
    borderColor: "#ef4444",
    borderWidth: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});

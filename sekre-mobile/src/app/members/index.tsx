import React from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import {
  UserCircleIcon,
  WarningCircleIcon,
  ShieldCheckIcon,
  CaretDownIcon,
  CaretUpIcon,
  MagnifyingGlassIcon,
} from "phosphor-react-native";
import { TextInput, ScrollView } from "react-native";

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
import { useUpdateMemberRole } from "@/features/member/use-update-member-role";
import { useAuthStore } from "@/shared/store/auth-store";
import { useTranslation } from "react-i18next";

export default function MembersScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { alert } = useAlert();
  const currentUser = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.role);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    data: members,
    isLoading,
    refetch,
    isRefetching,
  } = useMembers({
    page: 1,
    page_size: 50,
    search: debouncedSearch,
    role: filterRole,
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
  const updateRoleMutation = useUpdateMemberRole();

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
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "Ya, Lanjutkan",
          style: isSuspended ? "default" : "destructive",
          onPress: () => {
            updateStatusMutation.mutate(
              { userId: member.id, status: newStatus },
              {
                onError: (error: any) => {
                  alert(
                    t("division.error"),
                    extractErrorMessage(error, t("members.suspendError")),
                  );
                },
                onSuccess: () => {
                  alert(t("division.success"), t("members.suspendSuccess"));
                },
              },
            );
          },
        },
      ],
    );
  };

  const handleToggleRole = (member: Member) => {
    if (member.role === "OWNER") {
      alert("Aksi Ditolak", "Peran pemilik (OWNER) tidak dapat diubah.");
      return;
    }
    const newRole = member.role === "ADMIN" ? "MEMBER" : "ADMIN";

    alert(
      "Ubah Peran",
      `Apakah Anda yakin ingin mengubah peran ${member.full_name} menjadi ${newRole}?`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "Ya, Ubah",
          onPress: () => {
            updateRoleMutation.mutate(
              { userId: member.id, role: newRole },
              {
                onError: (error: any) => {
                  alert(
                    t("division.error"),
                    extractErrorMessage(error, t("members.roleError")),
                  );
                },
                onSuccess: () => {
                  alert(t("division.success"), t("members.roleSuccess"));
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
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "Ya, Keluarkan",
          style: "destructive",
          onPress: () => {
            removeMemberMutation.mutate(member.id, {
              onError: (error: any) => {
                alert(
                  t("division.error"),
                  extractErrorMessage(error, t("members.deleteError")),
                );
              },
              onSuccess: () => {
                alert(t("division.success"), t("members.deleteSuccess"));
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
        <Pressable
          style={styles.cardPressable}
          onPress={() => {
            if (canManage) {
              setExpandedId(expandedId === item.id ? null : item.id);
            }
          }}
          disabled={!canManage}
        >
          <View style={styles.cardHeader}>
            <View style={styles.memberInfo}>
              <UserCircleIcon color={theme.text} size={32} weight="fill" />
              <View style={styles.textContainer}>
                <ThemedText style={styles.memberName}>
                  {item.full_name}
                </ThemedText>
                <ThemedText style={styles.memberEmail}>{item.email}</ThemedText>
              </View>
              {canManage && (
                <View style={styles.chevronContainer}>
                  {expandedId === item.id ? (
                    <CaretUpIcon color={theme.textSecondary} size={20} />
                  ) : (
                    <CaretDownIcon color={theme.textSecondary} size={20} />
                  )}
                </View>
              )}
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
                    {t("members.suspended")}
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
                ({t("members.isYou")})
              </ThemedText>
            </View>
          )}

          {canManage && expandedId === item.id && (
            <View style={styles.actions}>
              {currentRole === "OWNER" && item.role !== "OWNER" && (
                <Button
                  title={
                    item.role === "ADMIN"
                      ? t("members.demote")
                      : t("members.promote")
                  }
                  variant="outline"
                  style={styles.actionButton}
                  onPress={() => handleToggleRole(item)}
                  isLoading={
                    updateRoleMutation.isPending &&
                    updateRoleMutation.variables?.userId === item.id
                  }
                />
              )}
              <Button
                title={isSuspended ? t("common.activate") : t("common.suspend")}
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
                title={t("common.remove")}
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
        </Pressable>
      </ThemedCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedHeader
        title={t("members.title")}
        showBackButton
        right={
          currentRole === "OWNER" || currentRole === "ADMIN" ? (
            <BouncingPressable
              onPress={() => router.push("/members/create")}
              style={{ padding: 8, marginRight: -8 }}
            >
              <UserCircleIcon color={theme.text} size={24} weight="bold" />
            </BouncingPressable>
          ) : null
        }
      />

      <View style={styles.filterSection}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <MagnifyingGlassIcon color={theme.textSecondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t("members.searchPlaceholder")}
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          <Pressable
            style={[
              styles.chip,
              !filterRole
                ? { backgroundColor: theme.tint }
                : { backgroundColor: theme.backgroundElement },
            ]}
            onPress={() => setFilterRole("")}
          >
            <ThemedText
              style={[styles.chipText, !filterRole && { color: "#fff" }]}
            >
              {t("common.all")}
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.chip,
              filterRole === "ADMIN"
                ? { backgroundColor: theme.tint }
                : { backgroundColor: theme.backgroundElement },
            ]}
            onPress={() => setFilterRole("ADMIN")}
          >
            <ThemedText
              style={[
                styles.chipText,
                filterRole === "ADMIN" && { color: "#fff" },
              ]}
            >
              {t("common.admin")}
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.chip,
              filterRole === "MEMBER"
                ? { backgroundColor: theme.tint }
                : { backgroundColor: theme.backgroundElement },
            ]}
            onPress={() => setFilterRole("MEMBER")}
          >
            <ThemedText
              style={[
                styles.chipText,
                filterRole === "MEMBER" && { color: "#fff" },
              ]}
            >
              {t("common.member")}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>

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
              <ThemedText>{t("members.noMembersFound")}</ThemedText>
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
  filterSection: {
    padding: 16,
    paddingBottom: 4,
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
  },
  chipsContainer: {
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "bold",
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
    padding: 0,
    overflow: "hidden",
  },
  cardPressable: {
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
  chevronContainer: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
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

import React, { useState } from "react";
import { View, StyleSheet, Modal, Pressable, FlatList, ActivityIndicator } from "react-native";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedCard } from "@/shared/ui/themed-card";
import { Button } from "@/shared/ui/button";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import {
  UserPlus,
  Trash,
  Crown,
  X,
  User,
} from "phosphor-react-native";
import {
  DivisionWithMembers,
  UserWithRole,
} from "@/features/division/division.schema";
import { useMembers } from "@/features/member/use-members";
import { useAddDivisionMember } from "@/features/division/use-add-division-member";
import { useRemoveDivisionMember } from "@/features/division/use-remove-division-member";
import { useUpdateDivisionRole } from "@/features/division/use-update-division-role";
import { useAlert } from "@/shared/context/alert-context";
import { useTranslation } from "react-i18next";

const AVATAR_COLORS = [
  "#4F46E5", "#059669", "#D97706", "#DC2626", "#7C3AED",
  "#0891B2", "#BE185D", "#2563EB", "#65A30D", "#DB2777",
];

function getColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function DivisionMembersManager({
  division,
}: {
  division: DivisionWithMembers;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { alert } = useAlert();
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const addMemberMutation = useAddDivisionMember(division.division.id);
  const removeMemberMutation = useRemoveDivisionMember(division.division.id);
  const updateRoleMutation = useUpdateDivisionRole(division.division.id);

  const { data: availableMembers, isLoading: isOrgMembersLoading } = useMembers({
    page: 1,
    page_size: 1000,
    without_division: true,
  });

  const handleAddMember = (userId: string) => {
    addMemberMutation.mutate(
      { user_id: userId, role: "STAFF" },
      {
        onSuccess: () => {
          alert(t("division.success"), t("division.addSuccess"));
          setAddModalVisible(false);
        },
        onError: () => alert(t("division.error"), t("division.addError")),
      },
    );
  };

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate(userId, {
      onSuccess: () => alert(t("division.success"), t("division.removeSuccess")),
      onError: () => alert(t("division.error"), t("division.removeError")),
    });
  };

  const handleToggleRole = (member: UserWithRole) => {
    const newRole = member.division_role === "HEAD" ? "STAFF" : "HEAD";
    updateRoleMutation.mutate(
      { userId: member.user.id, data: { role: newRole } },
      {
        onSuccess: () => alert(t("division.success"), t("division.roleSuccess")),
        onError: () => alert(t("division.error"), t("division.roleError")),
      },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>
          {t("division.title")}
        </ThemedText>
        <BouncingPressable
          style={[styles.addButton, { backgroundColor: theme.tint }]}
          onPress={() => setAddModalVisible(true)}
        >
          <UserPlus color="#fff" size={16} weight="bold" />
          <ThemedText style={styles.addButtonText}>
            {t("division.add")}
          </ThemedText>
        </BouncingPressable>
      </View>

      <ThemedCard style={styles.card}>
        {division.members.length === 0 ? (
          <View style={styles.emptyState}>
            <User color={theme.textSecondary} size={32} weight="thin" />
            <ThemedText style={styles.emptyText}>
              {t("division.emptyMembers")}
            </ThemedText>
          </View>
        ) : (
          division.members.map((member) => {
            const isHead = member.division_role === "HEAD";
            const color = getColor(member.user.id);
            const initials = member.user.full_name.charAt(0).toUpperCase();
            return (
              <View key={member.user.id} style={styles.memberItem}>
                <View style={[styles.avatar, { backgroundColor: color + "18" }]}>
                  <ThemedText style={[styles.avatarText, { color }]}>
                    {initials}
                  </ThemedText>
                </View>
                <View style={styles.memberInfo}>
                  <ThemedText style={styles.memberName}>
                    {member.user.full_name}
                  </ThemedText>
                  <ThemedText style={styles.memberEmail}>
                    {member.user.email}
                  </ThemedText>
                  <View
                    style={[
                      styles.roleBadge,
                      {
                        backgroundColor: isHead ? color + "18" : theme.backgroundSelected,
                      },
                    ]}
                  >
                    <Crown
                      color={isHead ? color : theme.textSecondary}
                      size={10}
                      weight={isHead ? "fill" : "regular"}
                    />
                    <ThemedText
                      style={[
                        styles.roleText,
                        { color: isHead ? color : theme.textSecondary },
                      ]}
                    >
                      {isHead ? t("division.headOfDivision") : t("division.staff")}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.memberActions}>
                  <BouncingPressable
                    onPress={() => handleToggleRole(member)}
                    style={[
                      styles.iconBtn,
                      { backgroundColor: isHead ? color + "18" : theme.backgroundSelected },
                    ]}
                  >
                    <Crown
                      color={isHead ? color : theme.textSecondary}
                      size={18}
                      weight={isHead ? "fill" : "regular"}
                    />
                  </BouncingPressable>
                  <BouncingPressable
                    onPress={() => handleRemoveMember(member.user.id)}
                    style={[styles.iconBtn, { backgroundColor: "#FEE2E2" }]}
                  >
                    <Trash color="#DC2626" size={18} />
                  </BouncingPressable>
                </View>
              </View>
            );
          })
        )}
      </ThemedCard>

      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setAddModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.backgroundSelected }]}>
              <ThemedText style={styles.modalTitle}>
                {t("division.addMember")}
              </ThemedText>
              <Pressable onPress={() => setAddModalVisible(false)} style={styles.closeBtn}>
                <X color={theme.text} size={22} />
              </Pressable>
            </View>

            {isOrgMembersLoading ? (
              <View style={styles.modalCenter}>
                <ActivityIndicator size="large" color={theme.tint} />
              </View>
            ) : !availableMembers || availableMembers.length === 0 ? (
              <View style={styles.modalCenter}>
                <User color={theme.textSecondary} size={36} weight="thin" />
                <ThemedText style={styles.emptyText}>
                  {t("division.allMembersAdded")}
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={availableMembers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const color = getColor(item.id);
                  const initials = item.full_name.charAt(0).toUpperCase();
                  return (
                    <View style={[styles.addItem, { borderBottomColor: theme.backgroundSelected }]}>
                      <View style={[styles.avatar, { backgroundColor: color + "18" }]}>
                        <ThemedText style={[styles.avatarText, { color }]}>
                          {initials}
                        </ThemedText>
                      </View>
                      <View style={styles.addItemInfo}>
                        <ThemedText style={styles.memberName}>
                          {item.full_name}
                        </ThemedText>
                        <ThemedText style={styles.memberEmail}>
                          {item.email}
                        </ThemedText>
                      </View>
                      <Button
                        title={t("division.add")}
                        onPress={() => handleAddMember(item.id)}
                        size="small"
                        style={styles.addItemBtn}
                      />
                    </View>
                  );
                }}
                contentContainerStyle={styles.addList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  card: { padding: 0, overflow: "hidden", borderRadius: 14 },
  emptyState: { padding: 32, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14, opacity: 0.5, textAlign: "center" },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700" },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontSize: 14, fontWeight: "600" },
  memberEmail: { fontSize: 12, opacity: 0.5 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  roleText: { fontSize: 11, fontWeight: "600" },
  memberActions: { flexDirection: "row", gap: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "65%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  closeBtn: { padding: 4 },
  modalCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 10,
  },
  addList: { padding: 16 },
  addItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addItemInfo: { flex: 1 },
  addItemBtn: { paddingHorizontal: 12, minHeight: 0, height: 34 },
});
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  BuildingsIcon,
  EnvelopeSimpleIcon,
  IdentificationCardIcon,
  ShieldCheckIcon,
} from "phosphor-react-native";

import { ThemedScrollView } from "../../shared/ui/themed-scroll-view";
import { ThemedText } from "../../shared/ui/themed-text";
import { ThemedCard } from "../../shared/ui/themed-card";
import { ThemedHeader } from "../../shared/ui/themed-header";
import { Button } from "../../shared/ui/button";
import { useAuthStore } from "../../shared/store/auth-store";
import { useLogout } from "../../features/auth/use-logout";
import { useTheme } from "../../shared/lib/hooks/use-theme";

export default function ProfileScreen() {
  const { user, organization, role } = useAuthStore();
  const logoutMutation = useLogout();
  const theme = useTheme();

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrapper}>{icon}</View>
      <View style={styles.infoTextContainer}>
        <ThemedText style={styles.infoLabel}>{label}</ThemedText>
        <ThemedText style={styles.infoValue} numberOfLines={1}>
          {value || "-"}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <ThemedHeader title="Profil Pengguna" />
      <ThemedScrollView contentContainerStyle={styles.container}>
        {/* Header / Avatar Area */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
            <ThemedText style={styles.avatarText}>
              {getInitials(user?.full_name)}
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.name}>
            {user?.full_name}
          </ThemedText>
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.backgroundSelected },
            ]}
          >
            <ShieldCheckIcon color={theme.tint} size={16} weight="fill" />
            <ThemedText style={[styles.badgeText, { color: theme.tint }]}>
              {role}
            </ThemedText>
          </View>
        </View>

        {/* Organization Card */}
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          ORGANISASI
        </ThemedText>
        <ThemedCard style={styles.card}>
          <InfoRow
            icon={<BuildingsIcon color={theme.text} size={24} />}
            label="Nama Organisasi"
            value={organization?.name}
          />
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.backgroundSelected },
            ]}
          />
          <InfoRow
            icon={<IdentificationCardIcon color={theme.text} size={24} />}
            label="Subdomain"
            value={`${organization?.subdomain}.sekre.co`}
          />
        </ThemedCard>

        {/* Account Card */}
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          AKUN PRIBADI
        </ThemedText>
        <ThemedCard style={styles.card}>
          <InfoRow
            icon={<EnvelopeSimpleIcon color={theme.text} size={24} />}
            label="Email Terdaftar"
            value={user?.email}
          />
        </ThemedCard>

        {/* Actions */}
        <Button
          title="Keluar dari Sesi"
          variant="outline"
          onPress={() => logoutMutation.mutate()}
          isLoading={logoutMutation.isPending}
          style={styles.logoutButton}
        />
      </ThemedScrollView>
    </View>
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
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "bold",
    color: "#ffffff",
  },
  name: {
    textAlign: "center",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionTitle: {
    opacity: 0.5,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 12,
    marginLeft: 52, // Align with text
  },
  logoutButton: {
    marginTop: 32,
    borderColor: "#ef4444",
  },
});

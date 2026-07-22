import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/shared/ui/themed-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { useTranslation } from "react-i18next";

export default function FinanceScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.wrapper}>
      <ThemedHeader title={t("finance.title")} />
      <ThemedView style={styles.container}>
        <ThemedText style={styles.subtitle}>
          {t("finance.comingSoon")}
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    opacity: 0.7,
  },
});

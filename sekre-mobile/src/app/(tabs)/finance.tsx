import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedView } from "../../shared/ui/themed-view";
import { ThemedText } from "../../shared/ui/themed-text";
import { ThemedHeader } from "../../shared/ui/themed-header";

export default function FinanceScreen() {
  return (
    <View style={styles.wrapper}>
      <ThemedHeader title="Keuangan" />
      <ThemedView style={styles.container}>
        <ThemedText style={styles.subtitle}>
          Fitur Keuangan (Segera Hadir)
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

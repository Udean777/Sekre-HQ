import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { ThemedSafeAreaView } from "@/shared/ui/themed-safe-area";
import { ThemedHeader } from "@/shared/ui/themed-header";
import { ThemedCard } from "@/shared/ui/themed-card";
import { ThemedText } from "@/shared/ui/themed-text";
import { Button } from "@/shared/ui/button";
import { BouncingPressable } from "@/shared/ui/bouncing-pressable";
import { useTheme } from "@/shared/lib/hooks/use-theme";
import { useAlert } from "@/shared/context/alert-context";
import { ENV } from "@/shared/config/env";
import { storage } from "@/shared/lib/storage";
import { useBulkImportMembers } from "@/features/member/use-bulk-import-members";
import { useImportPreview } from "@/features/member/use-import-preview";
import type {
  BulkImportResult,
  ImportPreviewResult,
} from "@/shared/types/member.types";
import { UploadSimple, FileX } from "phosphor-react-native";

type ScreenState =
  | { phase: "pick" }
  | {
      phase: "file-selected";
      file: { uri: string; name: string; type: string };
    }
  | { phase: "result"; result: BulkImportResult };

export default function ImportMembersScreen() {
  const theme = useTheme();
  const { alert } = useAlert();
  const mutation = useBulkImportMembers();
  const previewMutation = useImportPreview();

  const [state, setState] = useState<ScreenState>({ phase: "pick" });

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const isExcel =
        asset.name?.endsWith(".xlsx") || asset.name?.endsWith(".xls");
      if (!isExcel) {
        alert("Error", "Pilih file .xlsx atau .xls");
        return;
      }

      const file = {
        uri: asset.uri,
        name: asset.name,
        type:
          asset.mimeType ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      setState({ phase: "file-selected", file });

      previewMutation.mutate(file, {
        onError: () => {},
      });
    } catch {
      alert("Error", "Gagal memilih file");
    }
  };

  const handleImport = () => {
    if (state.phase !== "file-selected") return;

    mutation.mutate(state.file, {
      onSuccess: (result) => {
        setState({ phase: "result", result });
      },
      onError: (error: any) => {
        alert(
          "Import Gagal",
          error?.response?.data?.message ||
            error?.message ||
            "Terjadi kesalahan saat mengimport",
        );
      },
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = await storage.getToken("access_token");
      const url = `${ENV.API_URL}/members/template`;
      const file = await File.downloadFileAsync(url, Paths.document, {
        idempotent: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Simpan Template Anggota",
        });
      } else {
        alert("Download selesai");
      }
    } catch {
      alert("Error", "Gagal mendownload template");
    }
  };

  const handleReset = () => {
    setState({ phase: "pick" });
  };

  const file = state.phase === "file-selected" ? state.file : null;
  const result = state.phase === "result" ? state.result : null;

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedHeader
        title="Import Anggota"
        showBackButton
        withSafeArea={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!result ? (
          <>
            <ThemedCard style={styles.card}>
              <ThemedText type="subtitle">Petunjuk</ThemedText>
              <ThemedText style={styles.instruction}>
                Unggah file Excel dengan format berikut:
              </ThemedText>
              <ThemedText style={styles.instruction}>
                1. File harus berekstensi .xlsx atau .xls
              </ThemedText>
              <ThemedText style={styles.instruction}>
                2. Maksimal 100 baris data
              </ThemedText>
              <ThemedText style={styles.instruction}>
                3. Kolom yang diperlukan:{" "}
                <ThemedText style={{ fontWeight: "bold" }}>
                  Email, Full Name, Role, Division, Division Role
                </ThemedText>
              </ThemedText>
              <ThemedText style={styles.instruction}>
                4. Role: ADMIN atau MEMBER
              </ThemedText>
              <ThemedText style={styles.instruction}>
                5. Division Role: HEAD atau STAFF
              </ThemedText>
              <ThemedText style={styles.instruction}>
                6. Division harus sesuai dengan divisi yang sudah ada
              </ThemedText>
              <Button
                title="Download Template"
                variant="outline"
                onPress={handleDownloadTemplate}
                style={styles.templateButton}
              />
            </ThemedCard>

            {file ? (
              <>
                <ThemedCard style={styles.card}>
                  <View style={styles.selectedFile}>
                    <FileX color={theme.tint} size={24} />
                    <View style={styles.fileInfo}>
                      <ThemedText style={styles.fileName} numberOfLines={1}>
                        {file.name}
                      </ThemedText>
                    </View>
                  </View>
                </ThemedCard>

                {previewMutation.isPending && (
                  <ThemedCard style={styles.card}>
                    <ThemedText>Memvalidasi data...</ThemedText>
                  </ThemedCard>
                )}

                {previewMutation.data && !previewMutation.isPending && (
                  <PreviewTable preview={previewMutation.data} theme={theme} />
                )}

                {previewMutation.isError && (
                  <ThemedCard style={styles.card}>
                    <ThemedText style={{ color: "#ef4444" }}>
                      Gagal membaca file. Pastikan format Excel benar.
                    </ThemedText>
                  </ThemedCard>
                )}

                <ThemedCard style={styles.card}>
                  <Button
                    title="Import"
                    onPress={handleImport}
                    isLoading={mutation.isPending}
                    disabled={
                      !previewMutation.data ||
                      previewMutation.data.invalid_rows > 0
                    }
                    style={styles.importButton}
                  />
                  <Button
                    title="Pilih File Lain"
                    variant="outline"
                    onPress={handlePickFile}
                    disabled={mutation.isPending}
                  />
                </ThemedCard>
              </>
            ) : (
              <ThemedCard style={styles.card}>
                <BouncingPressable
                  style={[
                    styles.uploadArea,
                    { borderColor: theme.backgroundSelected },
                  ]}
                  onPress={handlePickFile}
                >
                  <UploadSimple color={theme.textSecondary} size={40} />
                  <ThemedText style={styles.uploadText}>
                    Ketuk untuk memilih file Excel
                  </ThemedText>
                  <ThemedText style={styles.uploadHint}>
                    .xlsx atau .xls
                  </ThemedText>
                </BouncingPressable>
              </ThemedCard>
            )}
          </>
        ) : (
          <ImportResult result={result} onDone={handleReset} theme={theme} />
        )}
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

function PreviewTable({
  preview,
  theme,
}: {
  preview: ImportPreviewResult;
  theme: any;
}) {
  return (
    <ThemedCard style={styles.card}>
      <ThemedText type="subtitle">Pratinjau Data</ThemedText>

      <View style={styles.previewStats}>
        <View
          style={[
            styles.previewStatItem,
            { backgroundColor: "rgba(34,197,94,0.1)" },
          ]}
        >
          <ThemedText style={[styles.previewStatNumber, { color: "#22c55e" }]}>
            {preview.valid_rows}
          </ThemedText>
          <ThemedText style={styles.previewStatLabel}>Valid</ThemedText>
        </View>
        <View
          style={[
            styles.previewStatItem,
            { backgroundColor: "rgba(239,68,68,0.1)" },
          ]}
        >
          <ThemedText style={[styles.previewStatNumber, { color: "#ef4444" }]}>
            {preview.invalid_rows}
          </ThemedText>
          <ThemedText style={styles.previewStatLabel}>Tidak Valid</ThemedText>
        </View>
        <View
          style={[
            styles.previewStatItem,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <ThemedText style={styles.previewStatNumber}>
            {preview.total_rows}
          </ThemedText>
          <ThemedText style={styles.previewStatLabel}>Total</ThemedText>
        </View>
      </View>

      <View style={styles.previewList}>
        {preview.rows.map((row) => (
          <View
            key={row.row}
            style={[
              styles.previewRowCard,
              {
                backgroundColor: row.division_valid
                  ? theme.backgroundElement
                  : "rgba(239,68,68,0.05)",
                borderLeftColor: row.division_valid ? "#22c55e" : "#ef4444",
              },
            ]}
          >
            <View style={styles.previewRowHeader}>
              <ThemedText style={styles.previewRowEmail} numberOfLines={1}>
                {row.email}
              </ThemedText>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor:
                      row.role === "ADMIN"
                        ? "rgba(59,130,246,0.1)"
                        : "rgba(107,114,128,0.1)",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.roleBadgeText,
                    { color: row.role === "ADMIN" ? "#3b82f6" : "#6b7280" },
                  ]}
                >
                  {row.role}
                </ThemedText>
              </View>
            </View>

            <View style={styles.previewRowDetails}>
              <View style={styles.previewDetail}>
                <ThemedText style={styles.previewLabel}>Nama</ThemedText>
                <ThemedText style={styles.previewValue}>
                  {row.full_name}
                </ThemedText>
              </View>
              <View style={styles.previewDetail}>
                <ThemedText style={styles.previewLabel}>Divisi</ThemedText>
                <View style={styles.previewDivisiRow}>
                  <ThemedText
                    style={[
                      styles.previewValue,
                      !row.division_valid && { color: "#ef4444" },
                    ]}
                  >
                    {row.division}
                  </ThemedText>
                  {!row.division_valid && (
                    <View style={styles.invalidBadge}>
                      <ThemedText style={styles.invalidBadgeText}>✗</ThemedText>
                    </View>
                  )}
                </View>
              </View>
              <View style={[styles.previewDetail, { borderBottomWidth: 0 }]}>
                <ThemedText style={styles.previewLabel}>Divisi Role</ThemedText>
                <ThemedText style={styles.previewValue}>
                  {row.division_role}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ThemedCard>
  );
}

function ImportResult({
  result,
  onDone,
  theme,
}: {
  result: BulkImportResult;
  onDone: () => void;
  theme: any;
}) {
  const hasErrors = (result.errors?.length ?? 0) > 0;

  return (
    <>
      <ThemedCard style={styles.card}>
        <ThemedText type="subtitle">Hasil Import</ThemedText>
        <View style={styles.resultGrid}>
          <View
            style={[
              styles.resultItem,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <ThemedText style={styles.resultNumber}>
              {result.total_rows}
            </ThemedText>
            <ThemedText style={styles.resultLabel}>Total</ThemedText>
          </View>
          <View
            style={[
              styles.resultItem,
              { backgroundColor: "rgba(34,197,94,0.1)" },
            ]}
          >
            <ThemedText style={[styles.resultNumber, { color: "#22c55e" }]}>
              {result.success_count}
            </ThemedText>
            <ThemedText style={styles.resultLabel}>Berhasil</ThemedText>
          </View>
          <View
            style={[
              styles.resultItem,
              { backgroundColor: "rgba(239,68,68,0.1)" },
            ]}
          >
            <ThemedText style={[styles.resultNumber, { color: "#ef4444" }]}>
              {result.failure_count}
            </ThemedText>
            <ThemedText style={styles.resultLabel}>Gagal</ThemedText>
          </View>
        </View>
      </ThemedCard>

      {result.created_members.length > 0 && (
        <ThemedCard style={styles.card}>
          <ThemedText type="subtitle">Anggota Baru</ThemedText>
          {result.created_members.map((m, i) => (
            <View
              key={i}
              style={[
                styles.memberRow,
                i < result.created_members.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.backgroundSelected,
                },
              ]}
            >
              <ThemedText style={{ fontWeight: "600" }}>
                {m.full_name}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                {m.email}
              </ThemedText>
              <View style={styles.passwordRow}>
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                  Password:
                </ThemedText>
                <ThemedText style={[styles.password, { color: theme.tint }]}>
                  {m.temporary_password}
                </ThemedText>
              </View>
              {m.division && (
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                  Divisi: {m.division}
                </ThemedText>
              )}
            </View>
          ))}
        </ThemedCard>
      )}

      {hasErrors && (
        <ThemedCard style={styles.card}>
          <ThemedText type="subtitle">Error</ThemedText>
          {result.errors!.map((e, i) => (
            <View key={i} style={styles.errorRow}>
              <ThemedText style={{ fontWeight: "600", color: "#ef4444" }}>
                Baris {e.row}: {e.email}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                {e.message}
              </ThemedText>
            </View>
          ))}
        </ThemedCard>
      )}

      <View style={styles.footer}>
        {result.success_count > 0 && (
          <Button
            title="Selesai"
            onPress={onDone}
            style={styles.footerButton}
          />
        )}
        {result.failure_count > 0 && result.success_count === 0 && (
          <Button
            title="Kembali"
            variant="outline"
            onPress={onDone}
            style={styles.footerButton}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 20,
    gap: 8,
  },
  instruction: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  uploadHint: {
    fontSize: 13,
    opacity: 0.5,
    lineHeight: 18,
  },
  selectedFile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  importButton: {
    marginTop: 8,
  },
  templateButton: {
    marginTop: 8,
  },
  resultGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  resultItem: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  resultNumber: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 38,
  },
  resultLabel: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  memberRow: {
    paddingVertical: 12,
    gap: 2,
  },
  passwordRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  password: {
    fontSize: 12,
    fontWeight: "700",
  },
  errorRow: {
    paddingVertical: 8,
    gap: 2,
  },
  previewStats: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 8,
  },
  previewStatItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 2,
  },
  previewStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 26,
  },
  previewStatLabel: {
    fontSize: 11,
    opacity: 0.6,
    lineHeight: 14,
  },
  previewList: {
    gap: 8,
    marginTop: 4,
  },
  previewRowCard: {
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    gap: 6,
  },
  previewRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  previewRowEmail: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  roleBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
  },
  previewRowDetails: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  previewDetail: {
    flex: 1,
    borderBottomWidth: 0,
  },
  previewLabel: {
    fontSize: 11,
    opacity: 0.5,
    lineHeight: 14,
  },
  previewValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  previewDivisiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  invalidBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 4,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  invalidBadgeText: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "bold",
    lineHeight: 12,
  },
  footer: {
    paddingBottom: 24,
    gap: 8,
  },
  footerButton: {
    marginTop: 0,
  },
});

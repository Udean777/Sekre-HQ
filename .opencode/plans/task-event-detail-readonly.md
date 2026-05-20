# Plan: Detail Screens Baru untuk Task & Event

Refactor `TaskDetailScreen` dan `EventDetailScreen` jadi read-only detail (mirip `FinanceDetailScreen`), dengan screen Edit terpisah.

## Tujuan

Sekarang Task & Event "detail" sebenarnya adalah edit form. Sejajarkan dengan pola Finance: Detail (read-only) → tombol Edit → screen Edit terpisah.

## Pola Referensi

`FinanceDetailScreen.kt`:
- `HeaderCard`: nilai utama + status chip + tanggal
- `InfoCard` + `StackedInfoRow`: label di atas, value di bawah, divider antar baris
- Tombol bawah: `Edit` (primary) + `Hapus` (outlined danger), conditional via `canBeEdited()` / `canBeDeleted()`
- Material3 `Card` dengan `containerColor = SekreTheme.colors.glassTint` + `shape = SekreTheme.shapes.large`
- Confirm dialog untuk delete

## Keputusan (sudah dikonfirmasi)

1. **TaskDetail tetap punya quick action "Tandai Selesai"** (tidak harus masuk edit screen)
2. **TaskDetail dapat tombol "Hapus Tugas"** — perlu tambah `TaskEvent.SubmitDelete` + `TaskEffect.DeletedSuccessfully` + handler di VM
3. **Snackbar `UpdatedSuccessfully`** untuk Task & Event setelah submit edit (konsisten dengan Division)
4. **Material3 Card + glassTint** untuk container (konsisten visual antar detail screens)

## Scope Perubahan

### File Diubah

- `presentation/navigation/Routes.kt` — tambah `TASK_EDIT`, `EVENT_EDIT`
- `presentation/navigation/RootNavHost.kt` — wire `onOpenEdit`, add composables, snackbar listeners
- `presentation/event/EventContract.kt` — tambah `UpdatedSuccessfully` effect
- `presentation/event/EventViewModel.kt` — emit `UpdatedSuccessfully` di `submitEdit` success
- `presentation/event/EventDetailScreen.kt` — refactor jadi read-only
- `presentation/task/TaskContract.kt` — tambah `SubmitDelete`, `UpdatedSuccessfully`, `DeletedSuccessfully`
- `presentation/task/TaskViewModel.kt` — handle `SubmitDelete`, emit effects
- `presentation/task/TaskDetailScreen.kt` — refactor jadi read-only

### File Baru

- `presentation/event/EventEditScreen.kt` — pindahkan logic edit dari `EventDetailScreen` lama
- `presentation/task/TaskEditScreen.kt` — pindahkan logic edit dari `TaskDetailScreen` lama

### Tidak Disentuh

- Domain entities & use cases
- List screens (`EventListScreen`, `TaskListScreen`)
- Create screens (`EventCreateScreen`, `TaskCreateScreen`)

## Detail per Screen

### EventDetailScreen (read-only)

**HeaderCard:**
- Title (besar, bold)
- Status chip (`displayStatus()`)
- Range waktu: `formatDateTime(startTime)` – `formatDateTime(endTime)`
- Durasi label: dari `getDurationInHours()` → "X jam Y menit"

**InfoCard items:**
- Divisi (`selected.division?.name`)
- Waktu Mulai (`formatDateTime(startTime)`)
- Waktu Selesai (`formatDateTime(endTime)`)
- Durasi
- Lokasi (jika ada)
- Deskripsi
- Dibuat pada (`formatDate(createdAt)`)

**Tombol bawah:**
- `Edit Acara` (primary) — jika `canBeEdited()`
- `Hapus Acara` (outlined danger) — jika `canBeDeleted()`

**Notice text** untuk event lampau: "Acara sudah berlalu dan tidak bisa diubah lagi."

### EventEditScreen (baru)

Pindahkan semua state edit + form fields + DateTimePicker dari `EventDetailScreen` lama:
- Division dropdown, Title, Description, Location, Start time, End time pickers
- Tombol "Simpan Perubahan" → `EventEvent.SubmitEdit` → snackbar via `UpdatedSuccessfully` → `onBack()` (kembali ke detail)

### TaskDetailScreen (read-only)

**HeaderCard:**
- Title (besar, bold)
- Status chip
- Due date label (jika ada) + badge "Terlambat" jika `isOverdue()`

**InfoCard items:**
- Status (label dari enum: To Do / In Progress / Done)
- Penanggung Jawab (`selected.assignee?.fullName` atau "Belum ditentukan")
- Tanggal Jatuh Tempo (`formatDate(dueDate)` atau "Tidak ada")
- Deskripsi
- Dibuat (`formatDate(createdAt)`)
- Diperbarui (`formatDate(updatedAt)`)

**Tombol bawah (urutan):**
1. `Tandai Selesai` (success color, jika status ≠ DONE) — quick action
2. `Edit Tugas` (primary)
3. `Hapus Tugas` (outlined danger)

### TaskEditScreen (baru)

Pindahkan semua state edit + form fields dari `TaskDetailScreen` lama:
- Title, Description, Status dropdown, Assignee dropdown, Due date picker
- Tombol "Simpan Perubahan" → `TaskEvent.SubmitEdit` → snackbar via `UpdatedSuccessfully` → `onBack()`

## Token/Theme

- `SekreTheme.shapes.large` untuk Card, `medium` untuk button
- `SekreTheme.colors.glassTint` (legacy alias → `surfaceFill`) untuk Card container
- `SekreTheme.colors.glassBorder` untuk divider
- `SekreTheme.colors.onGlassSecondary` untuk label
- `SekreTheme.colors.onGlassPrimary` untuk value
- `SekreTheme.colors.accentSuccess` / `accentDanger` / `accentPrimary` untuk highlight

## Navigation Flow

```
List → tap item → openDetail (load data) → DetailScreen
                                              ├─ Edit button → EditScreen → submit → popBack → DetailScreen (state updated)
                                              ├─ Delete button → confirm → SubmitDelete → popBack → ListScreen
                                              └─ (Task only) Tandai Selesai → SubmitStatus → state updated in place
```

## Verifikasi

- `./gradlew :composeApp:assembleDebug` harus pass
- Smoke test:
  - Tap event di list → detail read-only → tap Edit → edit form → simpan → snackbar + kembali ke detail dengan data updated
  - Tap event lampau → tidak ada tombol Edit & Hapus, tampil notice
  - Tap task → detail → tombol Tandai Selesai langsung dari detail (tanpa masuk edit)
  - Tap Hapus task → confirm → kembali ke list, item terhapus

const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/shared/lib/i18n/locales/en.json', 'utf8'));
const id = JSON.parse(fs.readFileSync('src/shared/lib/i18n/locales/id.json', 'utf8'));

// Organization
en.organization = {
  title: "Organization",
  editOrg: "Edit Organization",
  orgName: "Organization Name",
  orgNamePlaceholder: "Enter organization name",
  subdomainPlaceholder: "my-org",
  deleteOrg: "Delete Organization",
  deleteConfirm: "Are you sure you want to delete this organization?",
  saveSuccess: "Data successfully updated.",
  saveError: "An error occurred while saving.",
  deleteSuccess: "Organization successfully deleted.",
  deleteError: "An error occurred while deleting the organization.",
  cancel: "Cancel",
  delete: "Delete",
  saveChanges: "Save Changes",
  deleteWarning: "Deleting the organization will remove all its members and data."
};
id.organization = {
  title: "Organisasi",
  editOrg: "Ubah Organisasi",
  orgName: "Nama Organisasi",
  orgNamePlaceholder: "Masukkan nama organisasi",
  subdomainPlaceholder: "bem-url",
  deleteOrg: "Hapus Organisasi",
  deleteConfirm: "Apakah Anda yakin ingin menghapus organisasi ini?",
  saveSuccess: "Data berhasil diperbarui.",
  saveError: "Terjadi kesalahan saat menyimpan.",
  deleteSuccess: "Organisasi berhasil dihapus.",
  deleteError: "Terjadi kesalahan saat menghapus organisasi.",
  cancel: "Batal",
  delete: "Hapus",
  saveChanges: "Simpan Perubahan",
  deleteWarning: "Menghapus organisasi akan menghapus semua anggotanya juga."
};

// Profile settings (edit profile, change password)
en.profile.editProfile = "Edit Profile";
en.profile.fullName = "Full Name";
en.profile.namePlaceholder = "Enter your full name";
en.profile.saveSuccess = "Your profile has been successfully updated.";
en.profile.saveError = "A system error occurred.";
en.profile.saveChanges = "Save Changes";
en.profile.passwordCurrent = "Current Password";
en.profile.passwordCurrentPlaceholder = "Enter your old password";
en.profile.passwordNew = "New Password";
en.profile.passwordNewPlaceholder = "Enter your new password";
en.profile.passwordConfirm = "Confirm Password";
en.profile.passwordConfirmPlaceholder = "Repeat your new password";
en.profile.passwordUpdate = "Update Password";
en.profile.passwordSuccess = "Your password has been successfully changed.";
en.profile.passwordError = "An error occurred while changing the password.";

id.profile.editProfile = "Ubah Profil";
id.profile.fullName = "Nama Lengkap";
id.profile.namePlaceholder = "Masukkan nama lengkap";
id.profile.saveSuccess = "Profil Anda telah berhasil diperbarui.";
id.profile.saveError = "Terjadi kesalahan sistem.";
id.profile.saveChanges = "Simpan Perubahan";
id.profile.passwordCurrent = "Kata Sandi Saat Ini";
id.profile.passwordCurrentPlaceholder = "Masukkan kata sandi lama Anda";
id.profile.passwordNew = "Kata Sandi Baru";
id.profile.passwordNewPlaceholder = "Masukkan kata sandi baru";
id.profile.passwordConfirm = "Konfirmasi Kata Sandi";
id.profile.passwordConfirmPlaceholder = "Ulangi kata sandi baru";
id.profile.passwordUpdate = "Perbarui Kata Sandi";
id.profile.passwordSuccess = "Kata sandi Anda telah berhasil diubah.";
id.profile.passwordError = "Terjadi kesalahan saat mengubah password.";

// Divisions Module
en.divisions = {
  title: "Division Management",
  create: "Create New Division",
  createTitle: "Create Division",
  createDesc: "Add a new division to your organization",
  name: "Division Name",
  namePlaceholder: "Enter division name",
  desc: "Description",
  descPlaceholder: "Optional division description",
  submitCreate: "Create Division",
  createSuccess: "Division successfully created.",
  createError: "An error occurred while creating the division.",
  edit: "Edit Division",
  editDesc: "Change name or delete this division",
  deleteDiv: "Delete Division",
  deleteConfirm: "Are you sure you want to delete this division? This action cannot be undone.",
  deleteWarning: "Deleting a division will detach all members in it. Deleted data cannot be recovered.",
  saveSuccess: "Division data successfully updated.",
  saveError: "An error occurred while saving.",
  deleteSuccess: "Division successfully deleted.",
  deleteError: "An error occurred while deleting the division.",
  loadError: "Failed to load division.",
  saveChanges: "Save Changes",
  cancel: "Cancel",
  delete: "Delete",
  searchPlaceholder: "Search divisions...",
  noDivisions: "No divisions found.",
  head: "Head"
};

id.divisions = {
  title: "Manajemen Divisi",
  create: "Buat Divisi Baru",
  createTitle: "Buat Divisi",
  createDesc: "Tambahkan divisi baru ke organisasi Anda",
  name: "Nama Divisi",
  namePlaceholder: "Masukkan nama divisi",
  desc: "Deskripsi",
  descPlaceholder: "Deskripsi divisi opsional",
  submitCreate: "Buat Divisi",
  createSuccess: "Divisi berhasil dibuat.",
  createError: "Terjadi kesalahan saat membuat divisi.",
  edit: "Edit Divisi",
  editDesc: "Ubah nama atau hapus divisi ini",
  deleteDiv: "Hapus Divisi",
  deleteConfirm: "Apakah Anda yakin ingin menghapus divisi ini? Tindakan ini tidak dapat dibatalkan.",
  deleteWarning: "Menghapus divisi akan melepaskan semua anggota yang ada di dalamnya. Data yang dihapus tidak dapat dikembalikan.",
  saveSuccess: "Data divisi berhasil diperbarui.",
  saveError: "Terjadi kesalahan saat menyimpan.",
  deleteSuccess: "Divisi berhasil dihapus.",
  deleteError: "Terjadi kesalahan saat menghapus divisi.",
  loadError: "Gagal memuat divisi.",
  saveChanges: "Simpan Perubahan",
  cancel: "Batal",
  delete: "Hapus",
  searchPlaceholder: "Cari divisi...",
  noDivisions: "Tidak ada divisi ditemukan.",
  head: "Ketua"
};

// Members extra
en.members.createTitle = "Add New Member";
en.members.createDesc = "Invite a new member to join the organization";
en.members.password = "Password";
en.members.passwordPlaceholder = "Temporary password";
en.members.invite = "Invite Member";
en.members.createSuccess = "Member successfully created.";
en.members.createError = "An error occurred while creating the member.";
en.members.deleteSuccess = "Member successfully deleted.";
en.members.deleteError = "An error occurred while deleting the member.";
en.members.roleSuccess = "Member role successfully updated.";
en.members.roleError = "An error occurred while updating the role.";
en.members.suspendSuccess = "Member status successfully updated.";
en.members.suspendError = "An error occurred while updating status.";

id.members.createTitle = "Tambah Anggota Baru";
id.members.createDesc = "Undang anggota baru untuk bergabung ke organisasi";
id.members.password = "Kata Sandi";
id.members.passwordPlaceholder = "Kata sandi sementara";
id.members.invite = "Undang Anggota";
id.members.createSuccess = "Anggota berhasil dibuat.";
id.members.createError = "Terjadi kesalahan saat membuat anggota.";
id.members.deleteSuccess = "Anggota berhasil dihapus.";
id.members.deleteError = "Terjadi kesalahan saat menghapus anggota.";
id.members.roleSuccess = "Peran anggota berhasil diperbarui.";
id.members.roleError = "Terjadi kesalahan saat memperbarui peran.";
id.members.suspendSuccess = "Status anggota berhasil diperbarui.";
id.members.suspendError = "Terjadi kesalahan saat memperbarui status.";

fs.writeFileSync('src/shared/lib/i18n/locales/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/shared/lib/i18n/locales/id.json', JSON.stringify(id, null, 2));

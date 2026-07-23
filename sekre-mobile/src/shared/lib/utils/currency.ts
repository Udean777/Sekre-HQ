/**
 * Memformat uang integer (cents) menjadi string mata uang Rupiah
 * Sesuai arsitektur backend yang menggunakan valueobject.Money (integer)
 * @param amount Nominal uang (misal 50000)
 * @returns String terformat "Rp 50.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

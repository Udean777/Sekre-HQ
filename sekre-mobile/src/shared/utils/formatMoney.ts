import type { Money } from '@core/domain/entities/Transaction';

/**
 * Format Money entity ke string mata uang lokal.
 * amountCents dibagi 100 sebelum diformat.
 *
 * @example
 * formatMoney({ amountCents: 50000, currency: 'IDR' }) // "Rp 500"
 */
export const formatMoney = (money: Money): string => {
  const amount = money.amountCents / 100;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

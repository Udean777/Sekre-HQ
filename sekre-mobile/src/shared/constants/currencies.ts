// ~15 currency populer yang didukung
export interface SupportedCurrency {
  code: string;
  name: string;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  { code: 'IDR', name: 'Rupiah Indonesia', symbol: 'Rp' },
  { code: 'USD', name: 'Dolar Amerika', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£' },
  { code: 'SGD', name: 'Dolar Singapura', symbol: 'S$' },
  { code: 'MYR', name: 'Ringgit Malaysia', symbol: 'RM' },
  { code: 'JPY', name: 'Yen Jepang', symbol: '¥' },
  { code: 'CNY', name: 'Yuan Tiongkok', symbol: '¥' },
  { code: 'KRW', name: 'Won Korea', symbol: '₩' },
  { code: 'AUD', name: 'Dolar Australia', symbol: 'A$' },
  { code: 'THB', name: 'Baht Thailand', symbol: '฿' },
  { code: 'VND', name: 'Dong Vietnam', symbol: '₫' },
  { code: 'PHP', name: 'Peso Filipina', symbol: '₱' },
  { code: 'BRL', name: 'Real Brasil', symbol: 'R$' },
  { code: 'SAR', name: 'Riyal Arab Saudi', symbol: '﷼' },
];

export const CURRENCY_CODES = SUPPORTED_CURRENCIES.map(c => c.code);

export const getCurrencyByCode = (code: string): SupportedCurrency | undefined =>
  SUPPORTED_CURRENCIES.find(c => c.code === code);

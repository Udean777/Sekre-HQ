import { useState, useEffect } from 'react';

/**
 * useDebouncedValue — delay propagasi value ke consumer.
 *
 * Dipakai di search input supaya query tidak dikirim ke server
 * setiap keystroke, melainkan hanya setelah user berhenti mengetik
 * selama `delay` ms.
 *
 * @param value  — nilai yang ingin di-debounce
 * @param delay  — delay dalam ms (default 300ms)
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebouncedValue(search, 300);
 * // gunakan debouncedSearch sebagai query param, bukan search
 */
export const useDebouncedValue = <T>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return (): void => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

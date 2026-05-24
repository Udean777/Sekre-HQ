import axios from 'axios';
import { authInterceptor } from './interceptors/authInterceptor';
import { refreshInterceptor } from './interceptors/refreshInterceptor';
import { errorInterceptor } from './interceptors/errorInterceptor';
import { getBaseUrl } from './getBaseUrl';

const BASE_URL = getBaseUrl();

/**
 * Timeout per HTTP method (ms).
 *
 * GET/DELETE: 15s — read operations, backend harus cepat
 * POST/PUT/PATCH: 30s — write operations bisa lebih lama (upload, transaksi)
 *
 * Default 15s dipakai kalau method tidak dikenali.
 */
const METHOD_TIMEOUTS: Record<string, number> = {
  get: 15_000,
  delete: 15_000,
  post: 30_000,
  put: 30_000,
  patch: 30_000,
};

export const httpClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15_000, // default — di-override per request di interceptor
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request interceptor — set timeout per method + inject X-Request-ID.
 *
 * X-Request-ID dipakai untuk correlate request di backend logs dan Sentry.
 * Format: timestamp-random (tidak pakai uuid untuk menghindari dependency).
 */
httpClient.interceptors.request.use(config => {
  // Timeout per method
  const method = config.method?.toLowerCase() ?? 'get';
  config.timeout = METHOD_TIMEOUTS[method] ?? 15_000;

  // Request ID untuk tracing
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  config.headers.set('X-Request-ID', requestId);

  return config;
});

// Urutan interceptor penting:
// request: auth dulu (inject token), lalu timeout/requestId di atas
// response (LIFO): refreshInterceptor jalan duluan (handle 401 & retry),
//                  lalu errorInterceptor mapping error lainnya
authInterceptor(httpClient);
errorInterceptor(httpClient);
refreshInterceptor(httpClient);

export default httpClient;

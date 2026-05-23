import axios from 'axios';
import { authInterceptor } from './interceptors/authInterceptor';
import { refreshInterceptor } from './interceptors/refreshInterceptor';
import { errorInterceptor } from './interceptors/errorInterceptor';
import { getBaseUrl } from './getBaseUrl';

const BASE_URL = getBaseUrl();

export const httpClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Urutan interceptor penting:
// request: auth dulu (inject token)
// response (LIFO): refreshInterceptor jalan duluan (handle 401 & retry),
//                  lalu errorInterceptor mapping error lainnya
authInterceptor(httpClient);
errorInterceptor(httpClient);
refreshInterceptor(httpClient);

export default httpClient;

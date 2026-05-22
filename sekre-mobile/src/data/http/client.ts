import axios from 'axios';
import Config from 'react-native-config';
import { authInterceptor } from './interceptors/authInterceptor';
import { refreshInterceptor } from './interceptors/refreshInterceptor';
import { errorInterceptor } from './interceptors/errorInterceptor';

const BASE_URL = Config.API_BASE_URL ?? 'http://192.168.40.153:8080';

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

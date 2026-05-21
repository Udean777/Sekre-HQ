import axios from 'axios';
import Config from 'react-native-config';
import { authInterceptor } from './interceptors/authInterceptor';
import { refreshInterceptor } from './interceptors/refreshInterceptor';
import { errorInterceptor } from './interceptors/errorInterceptor';

const BASE_URL = Config.API_BASE_URL ?? 'http://192.168.1.4:8080';

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Urutan interceptor penting:
// request: auth dulu (inject token)
// response: refresh dulu (handle 401), lalu error mapping
authInterceptor(httpClient);
refreshInterceptor(httpClient);
errorInterceptor(httpClient);

export default httpClient;

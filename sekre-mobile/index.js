/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { initSentry } from './src/shared/observability/sentryInit';
import { setupOnlineManager } from './src/data/network/onlineManager';
import { setupFocusManager } from './src/data/network/focusManager';
import App from './src/app/App';
import { name as appName } from './app.json';

// Sentry HARUS diinit sebelum AppRegistry supaya crash saat startup tertangkap
initSentry();

// Wire NetInfo → React Query onlineManager
// Query yang gagal karena offline akan di-retry otomatis saat koneksi pulih
setupOnlineManager();

// Wire AppState → React Query focusManager
// Data stale akan di-refresh saat app kembali ke foreground
setupFocusManager();

AppRegistry.registerComponent(appName, () => App);

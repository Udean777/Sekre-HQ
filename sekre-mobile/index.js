/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { initSentry } from './src/shared/observability/sentryInit';
import App from './src/app/App';
import { name as appName } from './app.json';

// Sentry HARUS diinit sebelum AppRegistry supaya crash saat startup tertangkap
initSentry();

AppRegistry.registerComponent(appName, () => App);

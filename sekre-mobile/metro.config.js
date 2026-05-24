const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * inlineRequires: true — modul JS tidak di-require saat startup, melainkan
 * saat pertama kali diakses. Ini memindahkan biaya parsing/evaluasi modul
 * dari startup ke saat modul benar-benar dibutuhkan, sehingga TTI (Time to
 * Interactive) lebih cepat 200–600ms pada cold start.
 *
 * Catatan: inlineRequires bisa expose circular import yang sebelumnya
 * tersembunyi. Jalankan smoke test penuh setelah mengaktifkan ini.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

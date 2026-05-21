module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
          '@app': './src/app',
          '@core': './src/core',
          '@data': './src/data',
          '@presentation': './src/presentation',
          '@store': './src/store',
          '@hooks': './src/hooks',
          '@shared': './src/shared',
          '@di': './src/di',
        },
      },
    ],
    'react-native-reanimated/plugin', // HARUS paling akhir
  ],
};

const path = require('path');
const fs = require('fs');

// Read version from root package.json
const rootPackageJsonPath = path.resolve(__dirname, '../../package.json');
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));

export default {
  expo: {
    name: 'LOW Access',
    slug: 'low-access',
    scheme: 'low-access',
    version: rootPackageJson.version,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'low.access.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      package: 'low.access.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router', 'expo-font'],
    experiments: {
      typedRoutes: true,
    },
  },
};

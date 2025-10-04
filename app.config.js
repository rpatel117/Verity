/**
 * Expo Configuration
 *
 * Configures the React Native app for both mobile and web platforms.
 * Includes deep linking setup for SMS verification links.
 */
export default {
  expo: {
    name: "Hotel Check-In",
    slug: "hotel-checkin-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#F5F3F0",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.hotelcheckin.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#F5F3F0",
      },
      package: "com.hotelcheckin.app",
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    scheme: "hotelcheckin",
    plugins: ["expo-router", "expo-secure-store"],
  },
}

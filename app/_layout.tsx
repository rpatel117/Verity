/**
 * Root Layout
 *
 * Main app entry point with navigation and global providers.
 * Sets up Expo Router navigation and authentication context.
 */

import { Stack } from "expo-router"
import { AuthProvider } from "../src/context/AuthContext"
import { View } from "react-native"
import { colors } from "../src/styles"

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text.primary,
            headerTitleStyle: {
              fontWeight: "600",
            },
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Guest Check-In",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="privacy-policy"
            options={{
              title: "Privacy Policy",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="code-verification"
            options={{
              title: "Verify Code",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="confirmation"
            options={{
              title: "Check-In Complete",
              headerBackVisible: false,
            }}
          />
        </Stack>
      </View>
    </AuthProvider>
  )
}

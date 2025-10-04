"use client"

/**
 * Confirmation Screen
 *
 * Final screen shown after successful check-in verification.
 * Displays success message and provides option to start a new check-in.
 *
 * UI/UX: Celebratory, clear success state with next action options.
 */

import { View, Text, StyleSheet } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Button } from "../src/components/Button"
import { colors, typography } from "../src/styles"

export default function ConfirmationScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const checkInId = params.checkInId as string

  /**
   * Handles starting a new check-in
   */
  const handleNewCheckIn = () => {
    router.replace("/")
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        <Text style={styles.title}>Check-In Complete!</Text>

        <Text style={styles.message}>
          The guest has been successfully verified and checked in. All information has been securely logged.
        </Text>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-In ID:</Text>
            <Text style={styles.detailValue}>{checkInId.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Completed:</Text>
            <Text style={styles.detailValue}>{new Date().toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Start New Check-In" onPress={handleNewCheckIn} fullWidth />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 60,
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fonts.serif,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  detailsBox: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    padding: 20,
  },
})

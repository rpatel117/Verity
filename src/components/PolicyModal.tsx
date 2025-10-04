"use client"

/**
 * PolicyModal Component
 *
 * Modal for displaying privacy policy with acceptance checkbox.
 * Ensures guests explicitly consent before proceeding with check-in.
 */

import { useState } from "react"
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { colors, typography } from "../styles"
import { Button } from "./Button"

interface PolicyModalProps {
  visible: boolean
  onAccept: () => void
  onDecline: () => void
  policyUrl: string
}

export function PolicyModal({ visible, onAccept, onDecline, policyUrl }: PolicyModalProps) {
  const [accepted, setAccepted] = useState(false)

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onDecline}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <TouchableOpacity onPress={onDecline} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.paragraph}>
            By proceeding with check-in, you agree to share your verification information with the hotel for identity
            confirmation purposes.
          </Text>

          <Text style={styles.paragraph}>
            Your information will be used solely for check-in verification and will be handled in accordance with our
            privacy policy.
          </Text>

          <Text style={styles.paragraph}>
            For full details, please visit:{"\n"}
            <Text style={styles.link}>{policyUrl}</Text>
          </Text>

          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAccepted(!accepted)}>
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>I have read and agree to the privacy policy</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Accept & Continue" onPress={onAccept} disabled={!accepted} fullWidth />
          <TouchableOpacity onPress={onDecline} style={styles.declineButton}>
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fonts.serif,
    color: colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: typography.sizes.xl,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  paragraph: {
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  link: {
    color: colors.primary.DEFAULT,
    textDecorationLine: "underline",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderRadius: 6,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  checkmark: {
    color: colors.text.inverse,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  declineButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  declineText: {
    fontSize: typography.sizes.base,
    color: colors.text.tertiary,
  },
})

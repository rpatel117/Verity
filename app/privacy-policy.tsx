/**
 * Privacy Policy Screen
 *
 * Displays the hotel's privacy policy for guest review.
 * Guests can access this via the SMS link or from within the app.
 *
 * UI/UX: Clean, readable layout with proper typography for legal text.
 */

import { Text, StyleSheet, ScrollView } from "react-native"
import { colors, typography } from "../src/styles"

export default function PrivacyPolicyScreen() {
  const policyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || "https://yourhotel.com/privacy"

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.paragraph}>
        By proceeding with check-in, you agree to share your verification information with the hotel for identity
        confirmation purposes.
      </Text>

      <Text style={styles.sectionTitle}>Information We Collect</Text>
      <Text style={styles.paragraph}>During the check-in process, we collect the following information:</Text>
      <Text style={styles.listItem}>• Last 4 digits of your credit card</Text>
      <Text style={styles.listItem}>• Driver's license number</Text>
      <Text style={styles.listItem}>• Phone number</Text>
      <Text style={styles.listItem}>• Verification code confirmation</Text>

      <Text style={styles.sectionTitle}>How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        Your information is used solely for check-in verification purposes. We verify your identity to ensure the
        security of your reservation and comply with hotel regulations.
      </Text>

      <Text style={styles.sectionTitle}>Data Security</Text>
      <Text style={styles.paragraph}>
        All information is transmitted securely and stored with industry-standard encryption. We implement appropriate
        technical and organizational measures to protect your personal data.
      </Text>

      <Text style={styles.sectionTitle}>Data Retention</Text>
      <Text style={styles.paragraph}>
        Your check-in information is retained for the duration of your stay and for a reasonable period thereafter as
        required by law and for business purposes.
      </Text>

      <Text style={styles.sectionTitle}>Your Rights</Text>
      <Text style={styles.paragraph}>
        You have the right to access, correct, or delete your personal information. Please contact the front desk for
        any privacy-related requests.
      </Text>

      <Text style={styles.sectionTitle}>Contact Information</Text>
      <Text style={styles.paragraph}>
        For questions about this privacy policy or our data practices, please contact us at the front desk or visit:
      </Text>
      <Text style={styles.link}>{policyUrl}</Text>

      <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fonts.serif,
    color: colors.text.primary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  listItem: {
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
    color: colors.text.secondary,
    marginBottom: 8,
    paddingLeft: 16,
  },
  link: {
    fontSize: typography.sizes.base,
    color: colors.primary.DEFAULT,
    textDecorationLine: "underline",
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 32,
    fontStyle: "italic",
  },
})

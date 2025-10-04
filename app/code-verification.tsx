"use client"

/**
 * Code Verification Screen
 *
 * This screen is where guests (or staff on behalf of guests) enter the
 * SMS verification code to complete check-in.
 *
 * FLOW:
 * 1. Guest receives SMS with 6-digit code
 * 2. Guest shares code with hotel staff
 * 3. Staff enters code in this screen
 * 4. System verifies code against database
 * 5. On success, navigates to confirmation screen
 *
 * SECURITY: Backend should implement rate limiting (max 3-5 attempts)
 * to prevent brute force attacks.
 *
 * UI/UX: Large, clear input field for easy code entry. Shows phone number
 * for confirmation. Provides option to resend code if needed.
 */

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { InputField } from "../src/components/InputField"
import { Button } from "../src/components/Button"
import { PolicyModal } from "../src/components/PolicyModal"
import { colors, typography } from "../src/styles"
import { validateSmsCode } from "../src/utils/validation"
import { MESSAGES } from "../src/utils/constants"
import { verifyCode, logPolicyAcceptance } from "../src/services/sms"

export default function CodeVerificationScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const checkInId = params.checkInId as string
  const phoneNumber = params.phoneNumber as string

  // Form state
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Policy modal state
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [policyAccepted, setPolicyAccepted] = useState(false)

  // Resend cooldown
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)

  const policyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || "https://yourhotel.com/privacy"

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendCountdown])

  /**
   * Handles code verification
   */
  const handleVerify = async () => {
    // Validate code format
    if (!validateSmsCode(code)) {
      setError(MESSAGES.ERRORS.INVALID_CODE)
      return
    }

    // Check if policy was accepted
    if (!policyAccepted) {
      setShowPolicyModal(true)
      return
    }

    setLoading(true)
    setError("")

    try {
      // Verify code via Supabase Edge Function
      const response = await verifyCode({
        checkInId,
        code: code.trim(),
      })

      if (response.verified) {
        // Log policy acceptance
        await logPolicyAcceptance(checkInId)

        // Navigate to confirmation screen
        router.replace({
          pathname: "/confirmation",
          params: { checkInId },
        })
      } else {
        setError("Invalid verification code. Please try again.")
      }
    } catch (error) {
      console.error("[CodeVerification] Error verifying code:", error)
      Alert.alert("Error", error instanceof Error ? error.message : MESSAGES.ERRORS.VERIFICATION_FAILED)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles policy acceptance
   */
  const handlePolicyAccept = () => {
    setPolicyAccepted(true)
    setShowPolicyModal(false)
    // Automatically proceed with verification after policy acceptance
    handleVerify()
  }

  /**
   * Handles policy decline
   */
  const handlePolicyDecline = () => {
    setShowPolicyModal(false)
    Alert.alert(
      "Privacy Policy Required",
      "You must accept the privacy policy to complete check-in. Please review and accept to continue.",
    )
  }

  /**
   * Handles resending verification code
   */
  const handleResend = () => {
    // Reset countdown
    setCanResend(false)
    setResendCountdown(60)

    // TODO: Call resend SMS function
    Alert.alert("Code Resent", "A new verification code has been sent to your phone.")
  }

  // Format phone number for display
  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            A 6-digit code was sent to{"\n"}
            <Text style={styles.phoneNumber}>{formatPhoneDisplay(phoneNumber)}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Verification Code"
            placeholder="000000"
            value={code}
            onChangeText={(text) => {
              setCode(text)
              setError("")
            }}
            error={error}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            textAlign="center"
            style={styles.codeInput}
          />

          <TouchableOpacity
            onPress={() => setShowPolicyModal(true)}
            style={styles.policyLink}
            disabled={policyAccepted}
          >
            <Text style={[styles.policyLinkText, policyAccepted && styles.policyAccepted]}>
              {policyAccepted ? "✓ Privacy policy accepted" : "View privacy policy"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button title="Verify & Complete Check-In" onPress={handleVerify} loading={loading} fullWidth />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendButton}>Resend Code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendCountdown}>Resend in {resendCountdown}s</Text>
            )}
          </View>
        </View>
      </View>

      <PolicyModal
        visible={showPolicyModal}
        onAccept={handlePolicyAccept}
        onDecline={handlePolicyDecline}
        policyUrl={policyUrl}
      />
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
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fonts.serif,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
    textAlign: "center",
  },
  phoneNumber: {
    fontWeight: typography.weights.semibold,
    color: colors.primary.DEFAULT,
  },
  form: {
    flex: 1,
  },
  codeInput: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.semibold,
    letterSpacing: 8,
  },
  policyLink: {
    alignItems: "center",
    marginTop: 16,
  },
  policyLinkText: {
    fontSize: typography.sizes.base,
    color: colors.primary.DEFAULT,
    textDecorationLine: "underline",
  },
  policyAccepted: {
    color: colors.success,
    textDecorationLine: "none",
  },
  footer: {
    marginTop: 24,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resendText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: 8,
  },
  resendButton: {
    fontSize: typography.sizes.base,
    color: colors.primary.DEFAULT,
    fontWeight: typography.weights.semibold,
  },
  resendCountdown: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
})

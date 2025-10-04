"use client"

/**
 * Owner Reservation Screen
 *
 * This is the main screen where hotel staff (owners) enter guest information
 * to initiate the check-in process.
 *
 * FLOW:
 * 1. Staff enters guest's last 4 digits of credit card
 * 2. Staff enters guest's driver's license number
 * 3. Staff enters guest's phone number
 * 4. System validates all inputs
 * 5. System sends SMS with verification code to guest
 * 6. Staff navigates to verification screen
 *
 * UI/UX: Clean, professional form with clear labels and validation feedback.
 * Designed for quick data entry by hotel staff.
 */

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native"
import { useRouter } from "expo-router"
import { InputField } from "../src/components/InputField"
import { Button } from "../src/components/Button"
import { colors, typography } from "../src/styles"
import {
  validateCreditCardLast4,
  validateDriversLicense,
  validatePhoneNumber,
  formatPhoneNumber,
  sanitizeInput,
} from "../src/utils/validation"
import { MESSAGES } from "../src/utils/constants"
import { sendVerificationSms } from "../src/services/sms"

export default function OwnerReservationScreen() {
  const router = useRouter()

  // Form state
  const [creditCardLast4, setCreditCardLast4] = useState("")
  const [driversLicense, setDriversLicense] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  // Validation errors
  const [errors, setErrors] = useState({
    creditCard: "",
    driversLicense: "",
    phone: "",
  })

  // Loading state
  const [loading, setLoading] = useState(false)

  /**
   * Validates all form fields
   * Returns true if all fields are valid
   */
  const validateForm = (): boolean => {
    const newErrors = {
      creditCard: "",
      driversLicense: "",
      phone: "",
    }

    let isValid = true

    if (!validateCreditCardLast4(creditCardLast4)) {
      newErrors.creditCard = MESSAGES.ERRORS.INVALID_CREDIT_CARD
      isValid = false
    }

    if (!validateDriversLicense(driversLicense)) {
      newErrors.driversLicense = MESSAGES.ERRORS.INVALID_DRIVERS_LICENSE
      isValid = false
    }

    if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phone = MESSAGES.ERRORS.INVALID_PHONE
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  /**
   * Handles form submission
   * Sends SMS verification code to guest
   */
  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Sanitize inputs before sending to backend
      const sanitizedData = {
        creditCardLast4: sanitizeInput(creditCardLast4),
        driversLicense: sanitizeInput(driversLicense),
        phoneNumber: formatPhoneNumber(phoneNumber),
      }

      // Send SMS via Supabase Edge Function
      const response = await sendVerificationSms({
        phoneNumber: sanitizedData.phoneNumber,
        creditCardLast4: sanitizedData.creditCardLast4,
        driversLicense: sanitizedData.driversLicense,
      })

      // Navigate to verification screen with check-in ID
      router.push({
        pathname: "/code-verification",
        params: {
          checkInId: response.checkInId,
          phoneNumber: sanitizedData.phoneNumber,
        },
      })

      Alert.alert("Success", MESSAGES.SUCCESS.SMS_SENT)
    } catch (error) {
      console.error("[OwnerReservation] Error sending SMS:", error)
      Alert.alert("Error", error instanceof Error ? error.message : MESSAGES.ERRORS.NETWORK_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Guest Check-In</Text>
          <Text style={styles.subtitle}>Enter guest information to begin verification</Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Credit Card (Last 4 Digits)"
            placeholder="1234"
            value={creditCardLast4}
            onChangeText={setCreditCardLast4}
            error={errors.creditCard}
            keyboardType="number-pad"
            maxLength={4}
            helperText="Last 4 digits of the guest's credit card on file"
          />

          <InputField
            label="Driver's License Number"
            placeholder="D1234567"
            value={driversLicense}
            onChangeText={setDriversLicense}
            error={errors.driversLicense}
            autoCapitalize="characters"
            helperText="Full driver's license number"
          />

          <InputField
            label="Phone Number"
            placeholder="(555) 123-4567"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            error={errors.phone}
            keyboardType="phone-pad"
            helperText="Guest will receive verification code at this number"
          />
        </View>

        <View style={styles.footer}>
          <Button title="Send Verification Code" onPress={handleSubmit} loading={loading} fullWidth />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              The guest will receive an SMS with a verification code and privacy policy link. They must share the code
              with you to complete check-in.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.bold,
    fontFamily: typography.fonts.serif,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  form: {
    flex: 1,
  },
  footer: {
    marginTop: 24,
  },
  infoBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.DEFAULT,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
})

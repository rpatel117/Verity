import { View, Text, TextInput, StyleSheet, type TextInputProps } from "react-native"
import { colors, typography } from "../styles"

interface InputFieldProps extends TextInputProps {
  label: string
  error?: string
  helperText?: string
}

export function InputField({ label, error, helperText, ...textInputProps }: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colors.neutral[400]}
        {...textInputProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    minHeight: 56,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginTop: 6,
  },
  helperText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 6,
  },
})
